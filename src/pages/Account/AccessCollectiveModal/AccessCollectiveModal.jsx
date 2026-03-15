import React, { useEffect, useState } from "react";

const AccessCollectiveModal = ({
    isOpen,
    onClose,
    onEmailSubmit,
    onGoogleSignIn,
    onOtpLogin
}) => {
    const [email, setEmail] = useState("");

    const [step, setStep] = useState("EMAIL");
    // EMAIL | OTP_PHONE | OTP_VERIFY

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        document.body.style.overflow = "hidden";

        const escHandler = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", escHandler);

        return () => {
            document.body.style.overflow = "auto";
            document.removeEventListener("keydown", escHandler);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    /* ================= EMAIL LOGIN ================= */
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            onEmailSubmit(email); // success
        }, 1200);
    };

    /* ================= GOOGLE LOGIN ================= */
    const handleGoogleLogin = () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            onGoogleSignIn();
        }, 1000);
    };

    /* ================= OTP FLOW ================= */
    const sendOtp = () => {
        if (phone.length !== 10) {
            setError("Enter valid 10 digit mobile number");
            return;
        }

        setError("");
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setStep("OTP_VERIFY");
        }, 1000);
    };

    const verifyOtp = () => {
        if (otp !== "123456") {
            setError("Invalid OTP");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            onOtpLogin(phone);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[1000] text-white bg-black/90 backdrop-blur-md flex items-center justify-center animate-[fadeIn_0.3s_ease]" onClick={onClose}>
            <div className="relative w-full max-w-[480px] p-12 bg-[#121212] rounded-[20px] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.85)] animate-[scaleIn_0.35s_ease] font-[Inter]" onClick={(e) => e.stopPropagation()}>
                <button className="absolute top-[18px] right-[20px] bg-transparent border-none text-white/30 text-[18px] cursor-pointer hover:text-white" onClick={onClose}>✕</button>

                <div className="text-center mb-10">
                    <h2 className="font-[Oswald] text-[48px] uppercase tracking-[-0.03em] leading-none">ACCESS THE COLLECTIVE</h2>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-white/40 mt-2.5">Premium membership for the modern individual.</p>
                </div>

                {/* ================= EMAIL STEP ================= */}
                {step === "EMAIL" && (
                    <>
                        <form onSubmit={handleEmailSubmit} className="flex flex-col">
                            <label className="text-[10px] tracking-[0.3em] uppercase text-white/40">EMAIL ADDRESS</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-14 mt-2.5 mb-6 px-5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d4c4b1] focus:ring-1 focus:ring-[#d4c4b1]"
                            />

                            <button type="submit" className="w-full h-14 bg-white text-black font-extrabold text-[11px] tracking-[0.25em] rounded-xl cursor-pointer hover:bg-[#d4c4b1] transition-colors" disabled={loading}>
                                {loading ? "PLEASE WAIT..." : "CONTINUE WITH EMAIL"}
                            </button>
                        </form>

                        <div className="my-8 relative text-center before:content-[''] before:absolute before:inset-[50%_0_auto_0] before:h-px before:bg-white/5"><span className="relative bg-[#121212] px-3.5 text-[9px] tracking-[0.25em] text-white/30">OR</span></div>

                        <button className="w-full h-[52px] border border-white/10 bg-transparent text-white text-[10px] tracking-[0.25em] rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleGoogleLogin}>
                            <svg viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            SIGN IN WITH GOOGLE
                        </button>

                        <div className="text-center">
                            <button className="mt-7 bg-transparent border-none text-white/40 text-[10px] tracking-[0.25em] uppercase cursor-pointer hover:text-[#d4c4b1] transition-colors" onClick={() => setStep("OTP_PHONE")}>
                                LOGIN WITH MOBILE OTP
                            </button>
                        </div>
                    </>
                )}

                {/* ================= OTP PHONE ================= */}
                {step === "OTP_PHONE" && (
                    <div className="flex flex-col">
                        <label className="text-[10px] tracking-[0.3em] uppercase text-white/40">MOBILE NUMBER</label>
                        <input
                            type="tel"
                            placeholder="10 digit mobile number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            className="w-full h-14 mt-2.5 mb-6 px-5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d4c4b1] focus:ring-1 focus:ring-[#d4c4b1]"
                        />

                        <button className="w-full h-14 bg-white text-black font-extrabold text-[11px] tracking-[0.25em] rounded-xl cursor-pointer hover:bg-[#d4c4b1] transition-colors" onClick={sendOtp}>
                            SEND OTP
                        </button>

                        <div className="text-center">
                            <button className="mt-7 bg-transparent border-none text-white/40 text-[10px] tracking-[0.25em] uppercase cursor-pointer hover:text-[#d4c4b1] transition-colors" onClick={() => setStep("EMAIL")}>
                                ← BACK
                            </button>
                        </div>
                    </div>
                )}

                {/* ================= OTP VERIFY ================= */}
                {step === "OTP_VERIFY" && (
                    <div className="flex flex-col">
                        <label className="text-[10px] tracking-[0.3em] uppercase text-white/40">ENTER OTP</label>
                        <input
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full h-14 mt-2.5 mb-6 px-5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d4c4b1] focus:ring-1 focus:ring-[#d4c4b1]"
                        />

                        <button className="w-full h-14 bg-white text-black font-extrabold text-[11px] tracking-[0.25em] rounded-xl cursor-pointer hover:bg-[#d4c4b1] transition-colors" onClick={verifyOtp}>
                            VERIFY & LOGIN
                        </button>
                        <div className="text-center">
                            <button className="mt-7 bg-transparent border-none text-white/40 text-[10px] tracking-[0.25em] uppercase cursor-pointer hover:text-[#d4c4b1] transition-colors" onClick={() => setStep("OTP_PHONE")}>
                                ← BACK
                            </button>
                        </div>
                    </div>
                )}

                {error && <p className="ac-error">{error}</p>}
            </div>
        </div>
    );
};

export default AccessCollectiveModal;