import React, { useEffect, useState } from 'react';
import api from '../api';
import { BookOpen, ExternalLink, RefreshCw, Zap, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PracticeHub = () => {
    const [dailyQuestion, setDailyQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const [aiCoach, setAiCoach] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [statsSummary, setStatsSummary] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Daily Question
            try {
                const dailyRes = await api.get('/api/practice/daily');
                setDailyQuestion(dailyRes.data);
            } catch (e) {
                console.warn("Daily API failed", e);
                setDailyQuestion({ title: "Check LeetCode", link: "https://leetcode.com/problemset/all/" });
            }

            // Fetch My Profile
            const profilesRes = await api.get('/api/profiles');
            if (profilesRes.data && profilesRes.data.length > 0) {
                const profile = profilesRes.data[0];
                setStudentData(profile);

                // Initialize display from saved history if available?
                // For now, clean slate unless sync is hit.
            }
        } catch (error) {
            console.error("Error loading hub", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSync = async () => {
        if (!studentData) return;
        setVerifying(true);
        try {
            const response = await api.post('/api/student/sync-coding-stats', {
                student_id: studentData.student_id
            });

            const { stats_summary, analysis, recommendations } = response.data;

            setStatsSummary(stats_summary);
            setAnalysis(analysis);
            setAiCoach(recommendations || []);

            // Reload Profile to update charts
            const profileRes = await api.get(`/api/profile/${studentData.student_id}`);
            setStudentData(profileRes.data);

        } catch (error) {
            console.error("Sync Failed", error);
            alert("Sync Failed. Please ensure Backend is running.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    const habits = studentData?.coding_habits || {};
    const lcData = [
        { name: 'Easy', value: habits.leetcode_easy || 0, color: '#22c55e' },
        { name: 'Med', value: habits.leetcode_medium || 0, color: '#eab308' },
        { name: 'Hard', value: habits.leetcode_hard || 0, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="text-indigo-600" /> Practice Hub
                    </h1>
                    <p className="text-slate-600">Track progress & get AI recommendations.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={verifying}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md font-bold"
                >
                    <RefreshCw className={verifying ? "animate-spin" : ""} size={20} />
                    {verifying ? "Syncing..." : "Sync Stats"}
                </button>
            </header>

            {/* AI Coach Area */}
            {aiCoach.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="text-indigo-600" />
                        <h3 className="font-bold text-indigo-900 text-lg">AI Coach Insights</h3>
                    </div>
                    <div className="space-y-2">
                        {aiCoach.map((tip, idx) => (
                            <div key={idx} className="flex gap-3 text-indigo-800 bg-white/50 p-3 rounded-lg border border-indigo-100">
                                <Zap className="text-yellow-500 shrink-0" size={18} />
                                {tip}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Question */}
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Daily Challenge</div>
                        <h2 className="text-2xl font-bold mb-4">{dailyQuestion?.title || "Loading..."}</h2>

                        <div className="flex gap-4">
                            <a href={dailyQuestion?.link} target="_blank" rel="noreferrer"
                                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                                <ExternalLink size={16} /> Solve
                            </a>
                            {dailyQuestion?.difficulty && (
                                <span className="px-3 py-2 rounded-lg border border-white/20 text-sm font-bold">
                                    {dailyQuestion.difficulty}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* LeetCode & HackerRank Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {/* LeetCode Stats */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold text-slate-800">LeetCode Progress</h3>
                            <span className="text-2xl font-bold text-slate-800">{habits.leetcode_problems || 0}</span>
                        </div>
                        <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={lcData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={40} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {lcData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {analysis && analysis.leetcode && (
                            <div className="flex gap-4 mt-4 text-sm border-t pt-4">
                                <div>
                                    <span className="text-slate-500">Daily:</span> <span className="font-bold text-slate-800">+{analysis.leetcode.daily}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Weekly:</span> <span className="font-bold text-slate-800">+{analysis.leetcode.weekly}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HackerRank Stats */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800">HackerRank</h3>
                                <a href="https://www.hackerrank.com/dashboard" target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">Go to Dashboard</a>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-800">{habits.hackerrank_problems || 0}</div>
                                <div className="text-xs text-slate-500">Solved</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-slate-100 p-3 rounded-lg flex-1 text-center">
                                <div className="text-xs text-slate-500 uppercase font-bold">Badges</div>
                                <div className="text-xl font-bold text-indigo-600">{habits.hackerrank_badges || 0}</div>
                            </div>
                        </div>

                        {analysis && analysis.hackerrank && (
                            <div className="flex gap-4 text-sm border-t pt-4">
                                <div>
                                    <span className="text-slate-500">Daily:</span> <span className="font-bold text-slate-800">+{analysis.hackerrank.daily}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Weekly:</span> <span className="font-bold text-slate-800">+{analysis.hackerrank.weekly}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeHub;
