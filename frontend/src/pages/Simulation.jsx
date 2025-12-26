import React, { useState, useEffect } from 'react';
import api from '../api';
import { ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

const Simulation = () => {
    const { id } = useParams();
    const [baseProfile, setBaseProfile] = useState(null);
    const [initialStats, setInitialStats] = useState(null);

    // Default improvements
    const [addSkills, setAddSkills] = useState('');
    const [addProjects, setAddProjects] = useState(1);
    const [addLC, setAddLC] = useState(20);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const profileRes = await api.get(`/api/profile/${id}`);
                setBaseProfile(profileRes.data);

                // Baseline Prediction
                const predictRes = await api.post('/api/predict', profileRes.data);
                setInitialStats(predictRes.data);
            } catch (err) {
                console.error("Simulation Load Error", err);
            }
        };
        fetchData();
    }, [id]);

    const handleSimulate = async () => {
        if (!baseProfile) return;
        setLoading(true);

        const newSkills = addSkills.split(',').filter(s => s.trim().length > 0);

        // Construct Hypothetical Profile
        const payload = {
            ...baseProfile,
            skills: [...baseProfile.skills, ...newSkills],
            projects: Array(baseProfile.projects.length + parseInt(addProjects)).fill({}), // Mock count
            coding_habits: {
                ...baseProfile.coding_habits,
                leetcode_problems: (baseProfile.coding_habits.leetcode_problems || 0) + parseInt(addLC)
            }
        };

        try {
            const res = await api.post('/api/simulate', payload);
            setResult(res.data);
        } catch (error) {
            console.error(error);
            alert("Simulation Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!baseProfile) return <div className="p-10 text-center">Loading Simulation...</div>;

    const improvement = result ? (result.simulated_probability - (initialStats?.placement_probability || 0)) * 100 : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" /> Career Simulator
                </h1>
                <p className="text-slate-600">Visualize how learning new skills affects your placement chances.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg h-fit">
                    <h3 className="font-bold text-lg mb-6 border-b pb-2">Adjust Your Efforts</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Learn New Skills</label>
                            <input
                                type="text"
                                className="w-full border p-3 rounded-lg"
                                placeholder="e.g. Docker, Kubernetes"
                                value={addSkills}
                                onChange={e => setAddSkills(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 mt-1">Comma separated</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Add Projects</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border p-3 rounded-lg"
                                    value={addProjects}
                                    onChange={e => setAddProjects(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Solve Problems</label>
                                <input
                                    type="number"
                                    min="0" step="10"
                                    className="w-full border p-3 rounded-lg"
                                    value={addLC}
                                    onChange={e => setAddLC(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-md transition-all"
                        >
                            {loading ? "Simulating..." : <>Run Simulation <ArrowRight size={20} /></>}
                        </button>
                    </div>

                    {initialStats && (
                        <div className="mt-6 pt-6 border-t text-center">
                            <span className="text-slate-500 text-sm">Current Probability</span>
                            <div className="text-3xl font-bold text-slate-700">
                                {Math.round(initialStats.placement_probability * 100)}%
                            </div>
                        </div>
                    )}
                </div>

                {/* Outcome Panel */}
                <div className={`transition-all duration-500 ${result ? 'opacity-100' : 'opacity-50 blur-sm pointer-events-none'}`}>
                    <div className="bg-slate-900 text-white p-8 rounded-xl shadow-2xl h-full flex flex-col justify-center">
                        {!result ? (
                            <div className="text-center text-slate-400">
                                <ArrowRight className="mx-auto mb-4" size={40} />
                                <p>Run simulation to see results</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">New Placement Probability</div>
                                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                                        {Math.round(result.simulated_probability * 100)}%
                                    </div>
                                    <div className={`mt-2 font-bold ${improvement > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                                        {improvement > 0 ? `+${Math.round(improvement)}% Improvement` : "No Change"}
                                    </div>
                                </div>

                                <div className="space-y-3 bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                                    <h4 className="font-bold text-sm text-slate-300 mb-2">Key Drivers</h4>
                                    {result.improvements.length > 0 ? (
                                        result.improvements.map((imp, i) => (
                                            <div key={i} className="flex gap-3 text-sm">
                                                <CheckCircle className="text-green-400 shrink-0" size={18} />
                                                <span>{imp}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400">No major drivers found. Try increasing your targets.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulation;
