import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Activity, BookOpen, GitBranch, Terminal, Award, Play, Settings } from 'lucide-react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams, Link } from 'react-router-dom';
import CodingStatsCard from '../components/CodingStatsCard';

const Dashboard = () => {
    const { id } = useParams();
    const [studentData, setStudentData] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            const studentRes = await api.get(`/api/profile/${id}`);
            setStudentData(studentRes.data);

            if (studentRes.data && studentRes.data.academic_details) {
                const predRes = await api.post('/api/predict', studentRes.data);
                setPrediction(predRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Could not load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8">Loading...</div>;

    if (error) return <div className="p-8 text-red-600">{error}</div>;

    if (!studentData) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">Welcome to your Digital Twin</h2>
                <p className="text-slate-600 mt-2">Select a profile to view or create a new one.</p>
                <div className="mt-6 space-x-4">
                    <Link to="/saved-dashboards" className="text-primary hover:underline">View Saved Dashboards</Link>
                    <Link to="/profile" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600">Create New Profile</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Career Readiness Dashboard</h1>
                    <p className="text-slate-600">Overview of your profile and predictions</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/profile/${id}`}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Settings size={18} />
                        Edit Profile
                    </Link>
                    <Link
                        to={`/simulation/${id}`}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Play size={18} />
                        Run Simulation
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">Readiness Score</h3>
                    <div className="mt-4 flex items-end gap-2">
                        <span className="text-4xl font-bold text-primary">{prediction?.readiness_score || 0}</span>
                        <span className="text-slate-400 mb-1">/ 100</span>
                    </div>
                    <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prediction?.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                        prediction?.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                        Risk Level: {prediction?.risk_level || 'Unknown'}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 uppercase">Placement Probability</h3>
                    <div className="mt-4 flex items-end gap-2">
                        <span className="text-4xl font-bold text-indigo-600">
                            {prediction?.placement_probability ? Math.round(prediction.placement_probability * 100) : 0}%
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Based on ML Model</p>
                </div>

                {/* Third column: Coding Stats */}
                <CodingStatsCard studentData={studentData} onRefresh={fetchData} />
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
                    {/* Decorative bg elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                        <BookOpen size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-indigo-100 font-semibold text-sm uppercase tracking-wide">
                            <Activity size={16} />
                            Daily Practice
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Keep your streak alive!</h3>
                        <p className="text-indigo-100 mb-6 max-w-sm">
                            Solve today's coding challenge to boost your placement probability.
                        </p>
                        <Link
                            to="/practice"
                            className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
                        >
                            Go to Practice Hub
                            <ArrowUp className="transform rotate-45" size={18} />
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Metric Analysis</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'CGPA', value: (studentData.academic_details?.cgpa || 0) * 10 },
                                { name: 'Skills', value: (studentData.skills?.length || 0) * 10 },
                                { name: 'Projects', value: (studentData.projects?.length || 0) * 20 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
