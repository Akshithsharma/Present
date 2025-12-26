import React, { useEffect, useState } from 'react';
import { ArrowUp, Activity, Play, Star, Trophy, Target, User, Zap, TrendingUp } from 'lucide-react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const { id } = useParams(); // Get ID from URL if present (Admin context)
    const [myProfile, setMyProfile] = useState(null);
    const [metrics, setMetrics] = useState({ readiness: 0, probability: 0, risk: 'Low' });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Determine Target ID
            let targetId = id;
            if (!targetId) {
                // If no ID in URL, we are looking for "My" dashboard (Student role)
                targetId = user.student_id;
            }

            // We need to fetch the specific profile
            let profileData = null;

            if (targetId) {
                try {
                    const res = await api.get(`/api/profile/${targetId}`);
                    profileData = res.data;
                } catch (e) {
                    console.warn("Direct fetch failed", e);
                    const listRes = await api.get('/api/profiles');
                    profileData = listRes.data.find(p => p.student_id === targetId) || listRes.data[0];
                }
            } else {
                const listRes = await api.get('/api/profiles');
                profileData = listRes.data[0];
            }

            setMyProfile(profileData);

            // Fetch ML Predictions based on this profile
            if (profileData) {
                try {
                    const predRes = await api.post('/api/predict', profileData);
                    setMetrics({
                        readiness: predRes.data.readiness_score,
                        probability: predRes.data.placement_probability,
                        risk: predRes.data.risk_level
                    });
                } catch (error) {
                    console.error("Prediction API failed", error);
                }
            }

        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]); // Re-fetch if ID changes

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!myProfile) return <div className="p-8">No Profile Found.</div>;

    const habits = myProfile.coding_habits || {};

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome, {myProfile.name}</h1>
                    <p className="text-slate-600">Here is your career readiness overview.</p>
                    {user.role === 'admin' && (
                        <div className="mt-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded inline-block">
                            ADMIN VIEWING AS STUDENT
                        </div>
                    )}
                </div>

                {/* Edit Profile Button for Easy Access */}
                <Link
                    to={`/profile/${myProfile.student_id}`}
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
                >
                    <User size={18} />
                    Edit Profile
                </Link>
            </header>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Readiness Score */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-blue-600 font-semibold">
                        <Activity size={20} />
                        <span>Readiness</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{Math.round(metrics.readiness)} %</p>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(metrics.readiness, 100)}%` }}></div>
                    </div>
                </div>

                {/* Placement Probability */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-purple-600 font-semibold">
                        <TrendingUp size={20} />
                        <span>Probability</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{Math.round(metrics.probability * 100)} %</p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{metrics.risk} RISK</p>
                </div>

                {/* Skills */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-indigo-600 font-semibold">
                        <Trophy size={20} />
                        <span>Skills</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{myProfile.skills.length}</p>
                    <p className="text-sm text-slate-400">Total verified skills</p>
                </div>

                {/* Coding Stats (Combined) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-amber-500 font-semibold">
                        <Star size={20} />
                        <span>Practice</span>
                    </div>
                    <div className="flex justify-between items-end gap-2">
                        <div className="text-center flex-1">
                            <span className="block text-xl font-bold text-slate-800">{habits.leetcode_problems || 0}</span>
                            <span className="text-[10px] text-slate-400 uppercase">LeetCode</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="text-center flex-1">
                            <span className="block text-xl font-bold text-slate-800">{habits.hackerrank_problems || 0}</span>
                            <span className="text-[10px] text-slate-400 uppercase">HackerRank</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Run Simulation</h2>
                    <p className="text-blue-100 mb-6 max-w-lg">
                        See how improving your skills and solving more problems can increase your placement probability.
                    </p>
                    {/* 
                        Route logic: 
                        If Admin: /student/:id/simulation
                        If Student: /simulation/:id (or just click)
                        
                        We can normalize: simply use the absolute path /student/:id/simulation for admin,
                        and /simulation/:id for student.
                        
                        Actually, let's try to normalize everything to /student/:id/simulation if possible?
                        Or just conditional logic.
                    */}
                    <Link
                        to={user.role === 'admin' ? `/student/${myProfile.student_id}/simulation` : `/simulation/${myProfile.student_id}`}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
                    >
                        <Play size={18} fill="currentColor" />
                        Start Simulation
                    </Link>
                </div>
                {/* Decor */}
                <Activity className="absolute right-0 bottom-0 opacity-10 w-64 h-64 -mr-10 -mb-10" />
            </div>
        </div>
    );
};

export default Dashboard;
