import React, { useEffect, useState } from 'react';
import api from '../api';
import { BookOpen, ExternalLink, CheckCircle, RefreshCw, Trophy, Target, Zap, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import CodingStatsCard from '../components/CodingStatsCard';

const PracticeHub = () => {
    const [dailyQuestion, setDailyQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const [verificationMsg, setVerificationMsg] = useState(null);
    const [aiCoach, setAiCoach] = useState([]);
    const [analysis, setAnalysis] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dailyRes, profilesRes] = await Promise.all([
                api.get('/api/practice/daily'),
                api.get('/api/profiles')
            ]);
            setDailyQuestion(dailyRes.data);

            if (profilesRes.data && profilesRes.data.length > 0) {
                // Determine "my" profile. For simple student view, use first.
                // In real app, filter by current user ID from context.
                const profile = profilesRes.data[0];
                setStudentData(profile);

                // If we ran a sync recently (persisted analysis needed? Backend doesn't persist analysis object, only history)
                // We can't get AI coach unless we sync OR we adding an endpoint to get "latest advice".
                // For now, AI coach appears after sync, or we could trigger a "dry run" sync on load?
                // Let's just persist "recommendations" in local state for session or fetch last history?
                // Simpler: Trigger a sync on load? No, rate limits.
                // Better: Just show "Sync to get Coach advice" initially.
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

    const handleVerify = async () => {
        if (!studentData) return;
        setVerifying(true);
        setVerificationMsg(null);
        try {
            // Token is handled by api.js interceptor

            const syncRes = await api.post('/api/student/sync-coding-stats',
                { student_id: studentData.student_id }
            );

            const { stats_summary, analysis, recommendations } = syncRes.data;
            setAnalysis(analysis);
            setAiCoach(recommendations || []);

            // Refetch profile to get updated persistent data (like charts)
            const profileRes = await api.get(`/api/profile/${studentData.student_id}`);
            setStudentData(profileRes.data);

            const stats = stats_summary?.leetcode;
            if (stats) {
                const diff = stats.new - stats.old;
                if (diff > 0) {
                    setVerificationMsg(`Success! +${diff} problems.`);
                } else {
                    setVerificationMsg(`Sync complete. No new problems.`);
                }
            } else {
                setVerificationMsg("Sync complete.");
            }

        } catch (error) {
            setVerificationMsg("Verification failed.");
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
                        <BookOpen className="text-primary" />
                        Practice Hub
                    </h1>
                    <p className="text-slate-600">Track progress, solve daily challenges, and improve.</p>
                </div>
                <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                >
                    <RefreshCw className={verifying ? "animate-spin" : ""} size={18} />
                    {verifying ? "Syncing..." : "Sync & Get Coach Advice"}
                </button>
            </header>

            {/* Top Row: Daily Question & Coach */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Challenge */}
                <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                    Question of the Day
                                </div>
                                <h2 className="text-2xl font-bold">{dailyQuestion?.title}</h2>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${dailyQuestion?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                dailyQuestion?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                {dailyQuestion?.difficulty}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-4">
                            <a
                                href={dailyQuestion?.link}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white text-slate-900 px-5 py-2.5 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                            >
                                <ExternalLink size={18} />
                                Solve Now
                            </a>
                            <div className="text-slate-400 text-sm">
                                {dailyQuestion?.date}
                            </div>
                        </div>
                        {verificationMsg && (
                            <div className="mt-4 text-sm text-green-300 bg-green-900/30 p-2 rounded border border-green-800">
                                {verificationMsg}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Coach Widget */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <Brain size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">AI Coach</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {aiCoach.length > 0 ? (
                            <ul className="space-y-3">
                                {aiCoach.map((tip, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                        <Zap className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center text-slate-500 py-4 text-sm">
                                <p>Sync your stats to get personalized recommendations.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LeetCode Detailed Stats */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LC" className="h-8 w-8" />
                            <div>
                                <h3 className="font-bold text-slate-800">LeetCode</h3>
                                <div className="flex gap-2 text-xs">
                                    <a href="https://leetcode.com/accounts/login/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Login</a>
                                    <span className="text-slate-300">|</span>
                                    <a href="https://leetcode.com/problemset/all/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Practice</a>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-slate-800">{habits.leetcode_problems || 0}</div>
                            <div className="text-xs text-slate-500">Total Solved</div>
                        </div>
                    </div>

                    <div className="h-32 w-full mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lcData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={40} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {lcData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {analysis && analysis.leetcode && (
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-center">
                            <div>
                                <div className="text-xs text-slate-500">Daily Solved</div>
                                <div className="font-bold text-green-600">+{analysis.leetcode.daily}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Weekly Solved</div>
                                <div className="font-bold text-blue-600">+{analysis.leetcode.weekly}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* HackerRank & General */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-600 text-white p-1.5 rounded font-bold text-sm">H</div>
                                <div>
                                    <h3 className="font-bold text-slate-800">HackerRank</h3>
                                    <div className="flex gap-2 text-xs">
                                        <a href="https://www.hackerrank.com/auth/login" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Login</a>
                                        <span className="text-slate-300">|</span>
                                        <a href="https://www.hackerrank.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Practice</a>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-slate-800">{habits.hackerrank_problems || 0}</div>
                                <div className="text-xs text-slate-500">Total Activity</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-600">Badges</span>
                                    <span className="text-lg font-bold text-indigo-600">{habits.hackerrank_badges || 0}</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (habits.hackerrank_badges || 0) * 10)}%` }}></div>
                                </div>
                            </div>

                            {analysis && analysis.hackerrank && (
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-green-50 p-2 rounded">
                                        <div className="text-xs text-slate-500">Daily</div>
                                        <div className="font-bold text-green-700">+{analysis.hackerrank.daily}</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded">
                                        <div className="text-xs text-slate-500">Weekly</div>
                                        <div className="font-bold text-blue-700">+{analysis.hackerrank.weekly}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center text-sm text-slate-500 border-t pt-4">
                        <span>Current Streak</span>
                        <span className="font-bold text-orange-500 text-lg flex items-center gap-1">
                            {analysis?.streak || 0} <span className="text-base">🔥</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeHub;
