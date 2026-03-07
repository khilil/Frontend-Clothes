import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { googleLoginUser, loginUser, registerUser } from "../features/auth/authSlice";
import { AlertCircle } from "lucide-react";

export default function LoginAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🔥 Redux & Navigation
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 🔥 Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    // 🔥 Handle Input Change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError(""); // Clear error when typing
    };

    // 🔥 Handle Auth Navigation
    const handleAuthNavigation = (role) => {
        if (role === "admin") {
            navigate("/admin");
            return;
        }

        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        if (guestCart.length > 0) {
            navigate("/cart");
        } else {
            navigate("/");
        }
    };

    // 🔥 Handle Submit Logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            if (isLogin) {
                const result = await dispatch(
                    loginUser({
                        email: formData.email,
                        password: formData.password
                    })
                );

                if (result.meta.requestStatus === "fulfilled") {
                    handleAuthNavigation(result.payload.data.role);
                } else {
                    setError(result.payload?.message || "Authentication failed. Please verify your credentials.");
                }
            } else {
                const result = await dispatch(
                    registerUser({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    })
                );

                if (result.meta.requestStatus === "fulfilled") {
                    // Registration typically creates a customer account
                    handleAuthNavigation("customer");
                } else {
                    setError(result.payload?.message || "Registration failed. Please try again.");
                }
            }
        } catch (err) {
            setError("A connection error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[#8b7e6d] selection:text-white overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8b7e6d]/10 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8b7e6d]/5 blur-[100px] rounded-full opacity-30" />
            </div>

            {/* Left Side: Editorial Image Content (Desktop Only) */}
            <div className="hidden lg:block lg:w-[45%] relative group overflow-hidden">
                <motion.div
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                >
                    <img
                        src="https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?q=80&w=2070&auto=format&fit=crop"
                        alt="Luxury Lifestyle"
                        className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-[0%] transition-all duration-[2000ms] ease-out group-hover:scale-105"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-1000"></div>

                {/* Branding Layer */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="absolute top-16 left-16 z-20"
                >
                    <a href="/" className="group/logo relative inline-block">
                        <span className="text-4xl font-['Oswald'] tracking-[-0.05em] text-white uppercase leading-none">
                            Fenrir  <span className="text-[#8b7e6d]">era</span>
                        </span>
                        <div className="h-0.5 w-0 group-hover/logo:w-full bg-[#8b7e6d] transition-all duration-700 mt-2" />
                    </a>
                </motion.div>

                {/* Editorial Overlay */}
                <div className="absolute bottom-16 left-16 z-20 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.8 }}
                    >
                        <p className="text-[10px] uppercase tracking-[0.6em] text-[#8b7e6d] mb-4 font-bold">Volume III / MMXXIV</p>
                        <h3 className="text-6xl font-['Bodoni_Moda'] italic text-white mb-6 leading-[1.1] tracking-tight">
                            The Pursuit <br />Of Perfection
                        </h3>
                        <div className="h-0.5 w-16 bg-[#8b7e6d] mb-6 opacity-60" />
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 leading-relaxed font-light">
                            Curating the modern legacy through <br />uncompromising craftsmanship.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Auth Form Container */}
            <div className="w-full lg:w-[55%] flex flex-col justify-between relative border-l border-white/5 z-10">

                {/* Header (Unified Mobile/Desktop) */}
                <div className="p-8 lg:px-20 h-24 flex items-center justify-between">
                    <motion.a
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="lg:hidden text-2xl font-['Oswald'] tracking-tighter text-white"
                        href="/"
                    >
                        MODERN <span className="text-[#8b7e6d]">MEN</span>
                    </motion.a>

                    <div className="hidden lg:flex items-center gap-12 opacity-40">
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase">E-Store</span>
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Atelier</span>
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Muses</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20 py-8">
                    <div className="w-full max-w-[480px]">
                        {/* Title Section */}
                        <div className="mb-12">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'login-head' : 'signup-head'}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <h2 className="text-5xl md:text-7xl font-['Oswald'] tracking-[-0.03em] mb-4 text-white uppercase leading-none">
                                        {isLogin ? (
                                            <>Sign <span className="text-[#8b7e6d] italic font-['Bodoni_Moda'] normal-case">In</span></>
                                        ) : (
                                            <>Register <span className="text-[#8b7e6d] italic font-['Bodoni_Moda'] normal-case">Account</span></>
                                        )}
                                    </h2>
                                    <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase mt-4">
                                        {isLogin
                                            ? "The exclusive gateway to refinement"
                                            : "Begin your journey into the extraordinary"}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Error Feedback */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-8 p-4 bg-red-950/20 border border-red-500/30 rounded-lg flex items-center gap-3"
                                >
                                    <AlertCircle className="text-red-500" size={18} />
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none mt-0.5">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Auth Form with Glassmorphism */}
                        <motion.div
                            layout
                            className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-2xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                        >
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <AnimatePresence mode="popLayout">
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="group/input relative flex flex-col gap-2 mb-4">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-focus-within/input:text-[#8b7e6d] transition-colors ml-1">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Alexander M. Thorne"
                                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 px-6 text-white text-sm focus:bg-white/[0.06] focus:border-[#8b7e6d]/50 transition-all placeholder:text-white/5 outline-none"
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="group/input relative flex flex-col gap-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-focus-within/input:text-[#8b7e6d] transition-colors ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="curator@modernmen.com"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 px-6 text-white text-sm focus:bg-white/[0.06] focus:border-[#8b7e6d]/50 transition-all placeholder:text-white/5 outline-none"
                                        required
                                    />
                                </div>

                                <div className="group/input relative flex flex-col gap-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-focus-within/input:text-[#8b7e6d] transition-colors">
                                            Password
                                        </label>
                                        <Link to="/forgot-password" virtual="true" className="text-[8px] font-bold uppercase tracking-widest text-white/20 hover:text-[#8b7e6d] transition-colors">Recover</Link>
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••••••"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 px-6 text-white text-sm focus:bg-white/[0.06] focus:border-[#8b7e6d]/50 transition-all placeholder:text-white/5 outline-none"
                                        required
                                    />
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="group relative w-full py-5 mt-4 overflow-hidden rounded-xl bg-white transition-all duration-700"
                                >
                                    <div className="absolute inset-0 bg-[#8b7e6d] w-0 group-hover:w-full transition-all duration-700 ease-[0.16, 1, 0.3, 1]" />
                                    <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.6em] text-black group-hover:text-white transition-colors duration-500">
                                        {isSubmitting ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
                                    </span>
                                </motion.button>
                            </form>

                            <div className="mt-8 flex items-center gap-6">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">Social Login</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>

                            <div className="mt-8 flex flex-col gap-4">
                                <div className="w-full h-[52px] relative overflow-hidden flex items-center justify-center border border-white/5 rounded-xl hover:border-white/20 transition-all bg-white/[0.02] hover:bg-white/[0.04]">
                                    <GoogleLogin
                                        onSuccess={async (credentialResponse) => {
                                            const result = await dispatch(googleLoginUser(credentialResponse.credential));
                                            if (result.meta.requestStatus === "fulfilled") {
                                                handleAuthNavigation(result.payload.data.role);
                                            }
                                        }}
                                        onError={() => setError("Google login failed.")}
                                        theme="filled_black"
                                        shape="pill"
                                        width="100%"
                                        text={isLogin ? "signin_with" : "signup_with"}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="mt-10 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="group relative py-2 px-1 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all duration-500"
                            >
                                <span className="relative z-10">{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}</span>
                                <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-[#8b7e6d] transition-all duration-700" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="p-8 lg:px-20 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[7px] font-black uppercase tracking-[0.8em] text-white/20 italic">© 2024 Fenrir era</p>
                        <div className="flex gap-12">
                            <a href="#privacy" className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-[#8b7e6d] transition-colors">Privacy</a>
                            <a href="#terms" className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-[#8b7e6d] transition-colors">Terms</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
