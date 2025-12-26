import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cgpa: 0,
        backlogs: 0,
        skills: '',
        projects: 0,
        leetcode_problems: 0,
        github_streak: 0,
        leetcode_username: '',
        hackerrank_username: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let targetId = id;

                if (!targetId) {
                    const listRes = await api.get('/api/profiles');
                    if (listRes.data && listRes.data.length > 0) {
                        const myProfile = listRes.data[0];
                        setFormData({
                            name: myProfile.name,
                            email: myProfile.email,
                            cgpa: myProfile.academic_details?.cgpa || 0,
                            backlogs: myProfile.academic_details?.backlogs || 0,
                            skills: myProfile.skills?.join(', ') || '',
                            projects: myProfile.projects?.length || 0,
                            leetcode_problems: myProfile.coding_habits?.leetcode_problems || 0,
                            github_streak: myProfile.coding_habits?.github_streak || 0,
                            leetcode_username: myProfile.leetcode_username || '',
                            hackerrank_username: myProfile.hackerrank_username || ''
                        });
                        return; // Done
                    }
                }

                if (targetId) {
                    const res = await api.get(`/api/profile/${targetId}`);
                    const d = res.data;
                    if (d) {
                        setFormData({
                            name: d.name,
                            email: d.email,
                            cgpa: d.academic_details?.cgpa || 0,
                            backlogs: d.academic_details?.backlogs || 0,
                            skills: d.skills?.join(', ') || '',
                            projects: d.projects?.length || 0,
                            leetcode_problems: d.coding_habits?.leetcode_problems || 0,
                            github_streak: d.coding_habits?.github_streak || 0,
                            leetcode_username: d.leetcode_username || '',
                            hackerrank_username: d.hackerrank_username || ''
                        });
                    }
                }

            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name: formData.name,
            email: formData.email,
            academic_details: {
                cgpa: parseFloat(formData.cgpa),
                backlogs: parseInt(formData.backlogs)
            },
            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
            projects: Array(parseInt(formData.projects || 0)).fill({ title: "Project" }),
            coding_habits: {
                leetcode_problems: parseInt(formData.leetcode_problems),
                github_streak: parseInt(formData.github_streak)
            },
            leetcode_username: formData.leetcode_username,
            hackerrank_username: formData.hackerrank_username
        };

        if (id) {
            payload.student_id = id;
        }

        try {
            await api.post('/api/profile', payload);
            if (id) {
                // Return to the dashboard of the student we just edited
                // Check if we are admin to determine correct route format if needed, 
                // but our Routes handle /student/:id/dashboard well.
                // Or standard /dashboard for student role.

                // Safe bet:
                navigate(`/student/${id}/dashboard`);
            } else {
                // Saved "My Profile" -> Go Home
                navigate('/');
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
                {id ? 'Edit Student Profile' : 'Edit My Profile'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CGPA</label>
                        <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Active Backlogs</label>
                        <input type="number" name="backlogs" value={formData.backlogs} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">LeetCode Username</label>
                        <input type="text" name="leetcode_username" value={formData.leetcode_username} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" placeholder="e.g. tourist" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">HackerRank Username</label>
                        <input type="text" name="hackerrank_username" value={formData.hackerrank_username} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" placeholder="e.g. tourist" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" placeholder="Python, React, Docker..." />
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Count</label>
                        <input type="number" name="projects" value={formData.projects} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">LeetCode Problems</label>
                        <input type="number" name="leetcode_problems" value={formData.leetcode_problems} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Streak</label>
                        <input type="number" name="github_streak" value={formData.github_streak} onChange={handleChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary border p-2" />
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
