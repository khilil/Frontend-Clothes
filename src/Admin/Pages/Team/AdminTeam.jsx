import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Trash2,
    RefreshCcw,
    Loader2,
    CheckCircle2,
    X,
    Shield,
    ShieldCheck,
    Eye,
    EyeOff,
    Mail,
    User,
    Lock,
    AlertCircle,
    Crown,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamMembers, createTeamMember, deleteTeamMember, resetTeamMemberPassword } from '../../../services/teamService';

const ROLE_CONFIG = {
    admin: {
        label: 'Admin',
        icon: Crown,
        bg: 'bg-amber-100 dark:bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-500/20',
        dot: 'bg-amber-500'
    },
    employee: {
        label: 'Employee',
        icon: Briefcase,
        bg: 'bg-indigo-100 dark:bg-indigo-500/10',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-500/20',
        dot: 'bg-indigo-500'
    }
};

// Employee permissions reference
const EMPLOYEE_PERMISSIONS = [
    '🛒 View & Manage Orders',
    '📦 Add / Edit Products',
    '🗃️ Manage Inventory',
    '🎨 Attribute Management',
    '✏️ Customization Studio',
];

const ADMIN_PERMISSIONS = [
    '👑 Everything Employee can do',
    '📊 Analytics & Business Reports',
    '🗂️ Category Management',
    '👥 Customer Management',
    '💸 Discounts & Offers',
    '🖼️ Hero Slider',
    '🗑️ Delete Products',
    '👨‍💼 Team Management',
];

export default function AdminTeam() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee'
    });

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const data = await getTeamMembers();
            setMembers(data.data || []);
        } catch (error) {
            showNotification('error', 'Failed to load team members');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchMembers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) return;

        setIsSubmitting(true);
        try {
            await createTeamMember(formData);
            showNotification('success', `${formData.role === 'admin' ? 'Admin' : 'Employee'} account created for ${formData.name}`);
            setFormData({ name: '', email: '', password: '', role: 'employee' });
            setShowAddModal(false);
            fetchMembers();
        } catch (error) {
            showNotification('error', error.response?.data?.message || 'Failed to create account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (member) => {
        if (!window.confirm(`Delete account for "${member.name}"? This cannot be undone.`)) return;
        try {
            await deleteTeamMember(member._id);
            showNotification('success', `${member.name}'s account removed`);
            fetchMembers();
        } catch (error) {
            showNotification('error', 'Failed to remove member');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            return showNotification('error', 'Password must be at least 6 characters');
        }
        setIsSubmitting(true);
        try {
            await resetTeamMemberPassword(selectedMember._id, newPassword);
            showNotification('success', `Password reset for ${selectedMember.name}`);
            setShowResetModal(false);
            setNewPassword('');
            setSelectedMember(null);
        } catch (error) {
            showNotification('error', 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Team Management</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage admin and employee accounts with role-based access.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchMembers}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                    >
                        <UserPlus size={18} />
                        Add Member
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Team Members List */}
                <div className="xl:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 py-20 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-4">
                                <User size={32} className="text-slate-400" />
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">No team members yet</p>
                            <p className="text-sm text-slate-500 mt-1">Add your first employee or admin account</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all"
                            >
                                <UserPlus size={16} /> Add Member
                            </button>
                        </div>
                    ) : (
                        members.map(member => {
                            const config = ROLE_CONFIG[member.role] || ROLE_CONFIG.employee;
                            const RoleIcon = config.icon;
                            return (
                                <motion.div
                                    key={member._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all group"
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${config.dot}`} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{member.name}</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border}`}>
                                                <RoleIcon size={9} />
                                                {config.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                                            <Mail size={10} /> {member.email}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setSelectedMember(member); setShowResetModal(true); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                        >
                                            <Lock size={12} />
                                            Reset Password
                                        </button>
                                        {member.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDelete(member)}
                                                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Permissions Reference Card */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Crown size={18} className="text-amber-600 dark:text-amber-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Admin Access</h3>
                        </div>
                        <ul className="space-y-2">
                            {ADMIN_PERMISSIONS.map(p => (
                                <li key={p} className="text-xs text-amber-800 dark:text-amber-300/80 font-medium">{p}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">Employee Access</h3>
                        </div>
                        <ul className="space-y-2">
                            {EMPLOYEE_PERMISSIONS.map(p => (
                                <li key={p} className="text-xs text-indigo-800 dark:text-indigo-300/80 font-medium">{p}</li>
                            ))}
                        </ul>
                        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                            <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertCircle size={10} /> No Access
                            </p>
                            <p className="text-[10px] text-rose-700 dark:text-rose-300/70 mt-1">Analytics · Categories · Customers · Offers · Hero Slider · Delete Products</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
                        >
                            <div className="border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-indigo-500 dark:text-indigo-400">
                                    <UserPlus size={20} />
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">New Team Member</h2>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-6 space-y-4">

                                {/* Role Selector */}
                                <div className="grid grid-cols-2 gap-3">
                                    {['employee', 'admin'].map(r => {
                                        const conf = ROLE_CONFIG[r];
                                        const Icon = conf.icon;
                                        const active = formData.role === r;
                                        return (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: r })}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                    active
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                <Icon size={22} className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                                                <span className={`text-xs font-black uppercase ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{conf.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Rahul Shah"
                                            className={`${inputCls} pl-10`}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="employee@example.com"
                                            className={`${inputCls} pl-10`}
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Temporary Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                        <input
                                            required
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min. 6 characters"
                                            minLength={6}
                                            className={`${inputCls} pl-10 pr-10`}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Share this password with them privately. They can login using this.</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                        Create Account
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reset Password Modal */}
            <AnimatePresence>
                {showResetModal && selectedMember && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowResetModal(false); setNewPassword(''); }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-5">
                                <Lock size={28} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Reset Password</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Set a new password for <span className="font-bold text-slate-900 dark:text-white">{selectedMember.name}</span>
                            </p>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="New password (min. 6 chars)"
                                        minLength={6}
                                        className={`${inputCls} pl-10 pr-10`}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setShowResetModal(false); setNewPassword(''); }}
                                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                        Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-[110] flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-6 shadow-2xl backdrop-blur-xl"
                    >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${notification.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{notification.type === 'success' ? 'Done' : 'Error'}</p>
                            <p className="text-xs text-slate-500">{notification.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
