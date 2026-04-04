import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    Loader2, 
    ShieldCheck, 
    ArrowRight,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser } from '../../../features/auth/authSlice';

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const result = await dispatch(loginUser(formData));
            
            if (result.meta.requestStatus === 'fulfilled') {
                const role = result.payload.data.role;
                
                // Securely transition to the appropriate admin section
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'employee') {
                    navigate('/admin/orders');
                } else {
                    setError('Access denied. This portal is for staff only.');
                }
            } else {
                setError(result.payload?.message || 'Invalid credentials.');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 selection:bg-indigo-600 selection:text-white">
            
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] relative"
            >
                {/* Back to Site Link */}
                <Link 
                    to="/" 
                    className="absolute -top-12 left-0 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                >
                    <ChevronLeft size={14} />
                    Back to Store
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                        {/* Subtle patterns */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                        
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-6 shadow-xl shadow-indigo-600/20 relative z-10">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight relative z-10">
                            Staff Portal
                        </h1>
                        <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 relative z-10">
                            FENRIR Era / Administrative Entry
                        </p>
                    </div>

                    <div className="p-8 lg:p-10">
                        {/* Error Alert */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-8 overflow-hidden"
                                >
                                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white">
                                            <AlertCircle size={16} />
                                        </div>
                                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider leading-relaxed">
                                            {error}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Official Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@fenrirera.com"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Access Passphrase
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 group mt-4"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        Authenticate
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            This is a secure system restricted to authorized personnel only. 
                            Unauthorized access is prohibited.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                        © 2024 FENRIR Era Inc.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
