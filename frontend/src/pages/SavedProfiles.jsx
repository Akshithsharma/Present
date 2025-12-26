import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const SavedProfiles = () => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [adminNewStudent, setAdminNewStudent] = useState({ username: '', password: '' });

    const fetchData = async () => {
        try {
            const res = await api.get('/api/profiles');
            setProfiles(res.data);
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/create-student', adminNewStudent);
            alert("Student Created!");
            setShowModal(false);
            setAdminNewStudent({ username: '', password: '' });
            fetchData();
        } catch (e) {
            alert(e.response?.data?.message || "Error");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Saved Profiles</h1>
                    <p className="text-slate-600">Total Students: {profiles.length}</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 font-bold"
                >
                    + Register Student
                </button>
            </header>

            {/* Create Student Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Register New Student</h3>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Username"
                                value={adminNewStudent.username}
                                onChange={e => setAdminNewStudent({ ...adminNewStudent, username: e.target.value })}
                            />
                            <input
                                className="w-full border p-2 rounded"
                                type="password"
                                placeholder="Password"
                                value={adminNewStudent.password}
                                onChange={e => setAdminNewStudent({ ...adminNewStudent, password: e.target.value })}
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-800">Cancel</button>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map(p => (
                    <div key={p.student_id} className="relative group">
                        {/* 
                            When Admin clicks a profile, we want to go their DASHBOARD.
                            We use the route /student/:id/dashboard to signal "Admin acting as Student"
                        */}
                        <Link to={`/student/${p.student_id}/dashboard`} className="block">
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {p.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{p.name}</h3>
                                        <p className="text-xs text-slate-500">{p.email || "No Email"}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600 border-t pt-4">
                                    <span>CGPA: {p.academic_details.cgpa || 'N/A'}</span>
                                    <span>Skills: {p.skills.length}</span>
                                </div>
                                <div className="mt-4 text-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Dashboard →
                                </div>
                            </div>
                        </Link>

                        {user.role === 'admin' && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (window.confirm(`Are you sure you want to delete ${p.name}?`)) {
                                        api.delete(`/api/profile/${p.student_id}`)
                                            .then(() => fetchData())
                                            .catch(console.error);
                                    }
                                }}
                                className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Profile"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 4v6m4-6v6" /></svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedProfiles;
