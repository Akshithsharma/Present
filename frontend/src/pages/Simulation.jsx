import React, { useState, useEffect } from 'react';
import api from '../api';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

const Simulation = () => {
    const { id } = useParams();
    const [baseProfile, setBaseProfile] = useState(null);
    const [initialStats, setInitialStats] = useState(null);

    const [simulationParams, setSimulationParams] = useState({
        add_skills: '',
        increase_projects: 1, // Default to 1
        increase_leetcode: 10 // Default to 10
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                // 1. Fetch Profile
                const profileRes = await api.get(`/api/profile/${id}`);
                const profile = profileRes.data;
                setBaseProfile(profile);

                // 2. Fetch Initial Prediction (Baseline)
                const predictRes = await api.post('/api/predict', profile);
                setInitialStats(predictRes.data);

            } catch (err) {
                console.error(err);
                setError("Could not load profile data.");
            }
        };
        fetchData();
    }, [id]);

    if (!id || (!baseProfile && !loading && !error)) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">Career Simulation</h2>
                <p className="text-slate-600 mt-2">Please select a profile to run a simulation.</p>
                <div className="mt-6">
                    <Link to="/saved-dashboards" className="text-primary hover:underline">Go to Saved Dashboards</Link>
                </div>
            </div>
        );
    }

    const handleSimulate = async () => {
        setLoading(true);
        let skillsList = baseProfile?.skills || [];
        if (simulationParams.add_skills) {
            const newSkills = simulationParams.add_skills.split(',').map(s => s.trim()).filter(s => s);
            skillsList = [...skillsList, ...newSkills];
        }

        const payload = {
            ...baseProfile, // Include all original fields
            skills: skillsList,
            projects: Array((baseProfile?.projects?.length || 0) + parseInt(simulationParams.increase_projects || 0)).fill({}),
            coding_habits: {
                ...baseProfile?.coding_habits,
                leetcode_problems: (baseProfile?.coding_habits?.leetcode_problems || 0) + parseInt(simulationParams.increase_leetcode || 0)
            }
        };

        try {
            const res = await api.post('/api/simulate', payload);
            setResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!baseProfile) return <div className="p-8">Loading...</div>;

    const improvement = result && initialStats
        ? (result.simulated_probability - initialStats.placement_probability) * 100
        : 0;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Career Impact Simulator</h1>
                <p className="text-slate-600">Manually enter your learning goals to see how they boost your placement chances.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-xl font-bold text-slate-800 border-b pb-4">What if I...</h3>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Learn New Skill(s)</label>
                        <input
                            type="text"
                            placeholder="e.g. React, Docker, System Design"
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={simulationParams.add_skills}
                            onChange={(e) => setSimulationParams({ ...simulationParams, add_skills: e.target.value })}
                        />
                        <p className="text-xs text-slate-500 mt-1">Enter skills separated by commas.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Build Projects</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={simulationParams.increase_projects}
                                onChange={(e) => setSimulationParams({ ...simulationParams, increase_projects: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 mt-1">Number of new projects using these skills.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Solve Problems</label>
                            <input
                                type="number"
                                min="0" step="10"
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={simulationParams.increase_leetcode}
                                onChange={(e) => setSimulationParams({ ...simulationParams, increase_leetcode: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 mt-1">Additional LeetCode questions solved.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSimulate}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? 'Simulating...' : <>Analyze Improvement <ArrowRight size={20} /></>}
                    </button>

                    {baseProfile && initialStats && (
                        <div className="bg-slate-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-slate-500">Current Placement Probability</p>
                            <p className="text-2xl font-bold text-slate-700">{Math.round(initialStats.placement_probability * 100)}%</p>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className={`bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-xl shadow-xl transition-all ${!result ? 'opacity-80' : ''}`}>
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <CheckCircle className="text-green-400" /> Projected Outcome
                    </h3>

                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                            <ArrowRight size={48} className="mb-4 text-slate-600" />
                            <p>Enter your goals and run the simulation <br />to see your career growth.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">New Probability</p>
                                    <span className="text-5xl font-bold text-white">
                                        {Math.round(result.simulated_probability * 100)}%
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Improvement</p>
                                    <span className={`text-3xl font-bold ${improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {improvement > 0 ? '+' : ''}{Math.round(improvement)}%
                                    </span>
                                </div>
                            </div>

                            {improvement > 0 && (
                                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
                                    By adding <b>{simulationParams.add_skills || 'new skills'}</b>, building <b>{simulationParams.increase_projects} projects</b>, and solving <b>{simulationParams.increase_leetcode} problems</b>, you increase your chances significantly!
                                </div>
                            )}

                            <div>
                                <p className="text-slate-400 text-sm uppercase mb-4 border-b border-white/10 pb-2">Why this helps</p>
                                <div className="space-y-3">
                                    {result.improvements.map((imp, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-slate-200">
                                            <div className="mt-1 min-w-[16px]">
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            </div>
                                            <span>{imp}</span>
                                        </div>
                                    ))}
                                    {/* Add static feedback if skills added */}
                                    {simulationParams.add_skills && (
                                        <div className="flex items-start gap-3 text-sm text-slate-200">
                                            <div className="mt-1 min-w-[16px]">
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            </div>
                                            <span>Expanding your skill set with {simulationParams.add_skills} makes you versatile.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Simulation;
