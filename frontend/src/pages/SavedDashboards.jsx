import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, X } from 'lucide-react';

const SavedDashboards = () => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ username: '', password: '' });
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await api.get('/api/profiles');
            setProfiles(res.data);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to delete this profile?")) return;

        try {
            await api.delete(`/api/profile/${id}`);
            fetchProfiles();
        } catch (error) {
            console.error("Error deleting profile:", error);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/create-student', newStudent);
            setShowModal(false);
            setNewStudent({ username: '', password: '' });
            alert("Student created successfully!");
            fetchProfiles(); // Refresh list to see the new empty profile
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to create student');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading profiles...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {user.role === 'admin' ? 'All Student Dashboards' : 'My Dashboard'}
                    </h1>
                    <p className="text-slate-600">
                        {user.role === 'admin' ? 'Manage all student digital twins' : 'View your digital twin'}
                    </p>
                </div>

                <div className="flex gap-3">
                    {/* Admin can register new students */}
                    {user.role === 'admin' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <UserPlus size={18} />
                            Register Student
                        </button>
                    )}

                    {/* Student can manually create a profile if they somehow don't have one (though reg handles it now) */}
                    {/* keeping logic flexible: if student has no profile, show create button? 
                        Currently reg creates empty profile, so list likely not empty. 
                        But we can keep the Create New Profile button for edits? 
                        Actually, profile editing is done via /profile.
                        Let's just keep 'Create New Profile' as a fallback or for Admin to create loose profiles?
                        Actually admin creates USERS now. 
                        Let's hide 'Create New Profile' for everyone since profiles are 1-1 with users now.
                        BUT, the Profile Page is used to EDIT.
                        Let's change link to 'Edit Profile' if they have one?
                    */}
                </div>
            </header>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Register New Student</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        {createError && <p className="text-red-600 text-sm mb-2">{createError}</p>}
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Username"
                                value={newStudent.username}
                                onChange={e => setNewStudent({ ...newStudent, username: e.target.value })}
                                required
                            />
                            <input
                                className="w-full border p-2 rounded"
                                type="password"
                                placeholder="Password"
                                value={newStudent.password}
                                onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                required
                            />
                            <button className="w-full bg-primary text-white py-2 rounded">Create Student</button>
                        </form>
                    </div>
                </div>
            )}

            {profiles.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800">No profiles found</h2>
                    <p className="text-slate-500 mt-2">
                        {user.role === 'admin' ? "Register a student to get started." : "Please edit your profile."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map(profile => (
                        <Link key={profile.student_id} to={`/dashboard/${profile.student_id}`} className="block group">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                                    </div>

                                    {user.role === 'admin' && (
                                        <button
                                            onClick={(e) => handleDelete(e, profile.student_id)}
                                            className="text-slate-400 hover:text-red-500 p-1"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">
                                    {profile.name || "Unnamed Student"}
                                </h3>
                                <p className="text-sm text-slate-500">{profile.email || "No email"}</p>

                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                                    <span className="text-slate-600">GPA: {profile.academic_details?.cgpa || 'N/A'}</span>
                                    <span className="text-slate-400">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedDashboards;
