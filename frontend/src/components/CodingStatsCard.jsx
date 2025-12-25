import React, { useState } from 'react';
import { RefreshCw, Code, Award, ExternalLink } from 'lucide-react';
import api from '../api';

const CodingStatsCard = ({ studentData, onRefresh }) => {
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            // api.js handles token
            await api.post('/api/student/sync-coding-stats',
                { student_id: studentData.student_id }
            );
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Sync failed", error);
            const msg = error.response?.data?.message || error.message;
            alert(`Failed to sync coding stats: ${msg}`);
        } finally {
            setSyncing(false);
        }
    };

    const hasProfiles = studentData.leetcode_username || studentData.hackerrank_username;

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Code size={20} className="text-primary" />
                    Coding Platforms
                </h3>
                {hasProfiles && (
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="text-sm flex items-center gap-1 text-primary hover:text-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing..." : "Sync Stats"}
                    </button>
                )}
            </div>

            {!hasProfiles ? (
                <div className="text-center py-4 text-slate-500 text-sm">
                    No coding profiles linked.
                    <br />
                    Edit profile to add LeetCode/HackerRank usernames.
                </div>
            ) : (
                <div className="space-y-4">
                    {studentData.leetcode_username && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-slate-700">LeetCode</span>
                                <a href={`https://leetcode.com/${studentData.leetcode_username}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary">
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-slate-900">
                                    {studentData.coding_habits?.leetcode_problems || 0}
                                </div>
                                <div className="text-xs text-slate-500">Solved</div>
                            </div>
                        </div>
                    )}

                    {studentData.hackerrank_username && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-slate-700">HackerRank</span>
                                <a href={`https://www.hackerrank.com/${studentData.hackerrank_username}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary">
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                            <div className="text-right">
                                {/* HackerRank explicit stats might be in history or just activity presence */}
                                <div className="text-sm font-medium text-green-600">Active</div>
                                <div className="text-xs text-slate-500">Profile Linked</div>
                            </div>
                        </div>
                    )}

                    {/* History Graph Placeholder or List */}
                    {studentData.coding_history && studentData.coding_history.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Recent Activity</h4>
                            <div className="text-xs text-slate-600">
                                Last synced: {new Date(studentData.coding_history[studentData.coding_history.length - 1].timestamp).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodingStatsCard;
