import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { googleLoginUser, sendOTP, verifyOTP, registerUser } from "../features/auth/authSlice";
import { AlertCircle, ArrowRight, Mail, Lock, ShieldCheck, User, Sparkles } from "lucide-react";

export default function LoginAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [useOTP] = useState(true); // Always true for customers now
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        otp: ""
    });

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleAuthNavigation = (role) => {
        if (role === "admin") {
            navigate("/admin");
        } else {
            const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
            navigate(guestCart.length > 0 ? "/cart" : "/");
        }
    };

    const handleSendOTP = async () => {
        if (!formData.email) {
            setError("Please enter your email first.");
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await dispatch(sendOTP(formData.email));
            if (result.meta.requestStatus === "fulfilled") {
                setOtpSent(true);
                setTimer(30);
                setError("");
            } else {
                setError(result.payload?.message || "Failed to send OTP.");
            }
        } catch (err) {
            setError("Connection error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            if (isLogin) {
                if (useOTP) {
                    const result = await dispatch(verifyOTP({ email: formData.email, otp: formData.otp }));
                    if (result.meta.requestStatus === "fulfilled") {
                        handleAuthNavigation(result.payload.data.role);
                    } else {
                        setError(result.payload?.message || "Verification failed.");
                    }
                } else {
                    const result = await dispatch(loginUser({ email: formData.email, password: formData.password }));
                    if (result.meta.requestStatus === "fulfilled") {
                        handleAuthNavigation(result.payload.data.role);
                    } else {
                        setError(result.payload?.message || "Invalid credentials.");
                    }
                }
            } else {
                const result = await dispatch(registerUser(formData));
                if (result.meta.requestStatus === "fulfilled") {
                    handleAuthNavigation("customer");
                } else {
                    setError(result.payload?.message || "Registration failed.");
                }
            }
        } catch (err) {
            setError("Connection error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-background text-text-primary font-sans selection:bg-accent selection:text-white overflow-hidden relative">
            {/* dynamic Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[150px] rounded-full opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] bg-blue-900/5 blur-[120px] rounded-full opacity-20" />
            </div>

            {/* Content Container */}
            <div className="flex flex-col lg:flex-row w-full z-10 relative">
                
                {/* Visual Section - Desktop */}
                <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-16 relative overflow-hidden bg-secondary">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-20"
                    >
                        <Link to="/" className="inline-block mb-12">
                            <img src="/assets/main-logo.png" alt="Fenrir Era" className="h-20 md:h-32 opacity-90 hover:opacity-100 transition-all" />
                        </Link>
                        
                        <h1 className="text-6xl xl:text-8xl font-['Bodoni_Moda'] italic mb-8 leading-[0.9] tracking-tight text-text-primary/90">
                            The New <br /> Standard <br /> <span className="not-italic font-['Oswald'] text-accent uppercase">Of Luxury</span>
                        </h1>
                        
                        <div className="h-px w-24 bg-accent mb-8" />
                        
                        <p className="text-sm font-light text-text-secondary/40 max-w-sm leading-relaxed tracking-wide uppercase">
                            Join our exclusive community and experience the finest curation of modern aesthetics.
                        </p>
                    </motion.div>

                    {/* Background Subtle Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-transparent to-transparent opacity-60" />
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-10 mix-blend-multiply" />
                </div>

                {/* Form Section */}
                <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-24">
                    <div className="w-full max-w-[480px]">
                        
                        {/* Mobile Logo */}
                        <div className="lg:hidden mb-12 text-center flex justify-center">
                            <img src="/assets/main-logo.png" alt="Fenrir era" className="h-20 opacity-90" />
                        </div>

                        {/* Title Toggle */}
                        <div className="mb-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'login' : 'signup'}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className="text-5xl font-['Oswald'] uppercase tracking-tight mb-2">
                                        {isLogin ? "Welcome" : "Connect"}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-text-secondary/40 font-bold">
                                            {isLogin ? "Secure Entry Interface" : "Create Modern Profile"}
                                        </p>
                                        <div className="h-px w-8 bg-accent/30" />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Auth Box */}
                        <div className="relative">
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-transparent blur-2xl opacity-50" />
                            
                            <motion.div 
                                layout
                                className="relative bg-secondary/80 backdrop-blur-3xl border border-text-primary/5 rounded-3xl p-8 lg:p-10"
                            >
                                {/* Error Display */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                                        >
                                            <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-tight">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-primary/70 ml-1">Full Identity</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
                                                    className="w-full bg-secondary/50 border border-border-subtle rounded-2xl py-4 pl-12 pr-6 text-text-primary text-sm focus:border-accent focus:bg-background transition-all outline-none placeholder:text-text-secondary/20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-primary/70 ml-1">Secure Channel</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="email@example.com"
                                                className="w-full bg-secondary/50 border border-border-subtle rounded-2xl py-4 pl-12 pr-6 text-text-primary text-sm focus:border-accent focus:bg-background transition-all outline-none placeholder:text-text-secondary/20"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {isLogin && useOTP ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-primary/70">Verification Code</label>
                                                {otpSent && (
                                                    <button 
                                                        type="button"
                                                        onClick={handleSendOTP}
                                                        disabled={timer > 0 || isSubmitting}
                                                        className="text-[8px] font-bold uppercase text-accent disabled:text-text-secondary/20 transition-colors"
                                                    >
                                                        {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                                                <input
                                                    type="text"
                                                    name="otp"
                                                    value={formData.otp}
                                                    onChange={handleChange}
                                                    placeholder="• • • • • •"
                                                    disabled={!otpSent}
                                                    className="w-full bg-secondary/50 border border-border-subtle rounded-2xl py-4 pl-12 pr-6 text-text-primary text-sm tracking-[0.5em] font-mono focus:border-accent focus:bg-background transition-all outline-none disabled:opacity-20 placeholder:text-text-secondary/20"
                                                    required={otpSent}
                                                    maxLength={6}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-primary/70 ml-1">Access Pass</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="••••••••"
                                                    className="w-full bg-secondary/50 border border-border-subtle rounded-2xl py-4 pl-12 pr-6 text-text-primary text-sm focus:border-accent focus:bg-background transition-all outline-none placeholder:text-text-secondary/20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        {isLogin && useOTP && !otpSent ? (
                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleSendOTP}
                                                disabled={isSubmitting}
                                                type="button"
                                                className="w-full py-4 bg-accent hover:bg-accent/80 text-background text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all flex items-center justify-center gap-3"
                                            >
                                                {isSubmitting ? "Generating..." : "Get Verification Code"}
                                                <ArrowRight size={14} />
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={isSubmitting}
                                                type="submit"
                                                className="w-full py-4 bg-text-primary text-background text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3 group"
                                            >
                                                {isSubmitting ? "Finalizing..." : (isLogin ? "Authenticate" : "Create Account")}
                                                <Sparkles className="group-hover:text-accent transition-colors" size={14} />
                                            </motion.button>
                                        )}
                                    </div>
                                </form>

                                {/* Alternate Methods */}
                                <div className="mt-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-px flex-1 bg-border-subtle/40" />
                                        <span className="text-[8px] font-bold text-text-secondary/60 uppercase tracking-[0.3em]">Social Access</span>
                                        <div className="h-px flex-1 bg-border-subtle/40" />
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="w-full overflow-hidden rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <GoogleLogin
                                                onSuccess={async (res) => {
                                                    const result = await dispatch(googleLoginUser(res.credential));
                                                    if (result.meta.requestStatus === "fulfilled") {
                                                        handleAuthNavigation(result.payload.data.role);
                                                    }
                                                }}
                                                onError={() => setError("Google login failed.")}
                                                theme="filled_black"
                                                shape="rectangular"
                                                width="400px" // Adjusted to be closer to container width
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bottom Link */}
                        <div className="mt-10 text-center">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                    setOtpSent(false);
                                }}
                                className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/40 hover:text-text-primary transition-all"
                            >
                                {isLogin ? "Become a Member" : "Existing Member Login"}
                                <div className="h-px w-4 bg-accent transition-all group-hover:w-8" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Footer */}
            <div className="absolute bottom-6 w-full px-12 hidden lg:flex justify-between items-center text-[7px] font-bold uppercase tracking-[0.5em] text-text-secondary/20 pointer-events-none">
                <p>© 2024 Fenrir era / All Rights Reserved</p>
                <div className="flex gap-8 pointer-events-auto">
                    <a href="#" className="hover:text-text-primary transition-colors">Digital Atelier</a>
                    <a href="#" className="hover:text-text-primary transition-colors">Terms of Presence</a>
                </div>
            </div>
        </div>
    );
}
