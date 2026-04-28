import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPasswordAPI } from "../features/auth/authService";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        setStatus("loading");
        try {
            await resetPasswordAPI(token, password);
            setStatus("success");
            setMessage("Your password has been reset successfully.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setStatus("error");
            setMessage(err.response?.data?.message || "Failed to reset password.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="backdrop-blur-2xl bg-secondary/80 border border-border-subtle rounded-3xl p-8 lg:p-12 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.1)]">
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-['Oswald'] tracking-[-0.05em] text-text-primary uppercase leading-none mb-4">
                            New <span className="text-accent">Secure</span>
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-text-secondary/70 font-bold">
                            Set your new account password
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === "success" ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="text-accent" size={24} />
                                </div>
                                <p className="text-sm text-text-secondary/60 mb-8">{message}</p>
                                <p className="text-[9px] uppercase tracking-widest text-text-secondary/70">Redirecting to login...</p>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {status === "error" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg flex items-center gap-3"
                                    >
                                        <AlertCircle className="text-red-500" size={18} />
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none mt-0.5">{message}</p>
                                    </motion.div>
                                )}

                                <div className="group/input relative flex flex-col gap-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-text-primary/70 group-focus-within/input:text-accent transition-colors ml-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-secondary border border-border-subtle rounded-xl px-5 py-4 text-text-primary text-xs tracking-wider focus:outline-none focus:border-accent focus:bg-background transition-all placeholder:text-text-secondary/80 pr-12"
                                            placeholder="Enter new private key"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary/70 hover:text-text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="group/input relative flex flex-col gap-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-text-primary/70 group-focus-within/input:text-accent transition-colors ml-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-secondary border border-border-subtle rounded-xl px-5 py-4 text-text-primary text-xs tracking-wider focus:outline-none focus:border-accent focus:bg-background transition-all placeholder:text-text-secondary/80"
                                        placeholder="Repeat private key"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full group relative h-[52px] bg-text-primary rounded-xl overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-accent w-0 group-hover:w-full transition-all duration-700 ease-[0.16, 1, 0.3, 1]" />
                                    <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.6em] text-background group-hover:text-background transition-colors duration-500">
                                        {status === "loading" ? "Processing..." : "Reset Password"}
                                    </span>
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
