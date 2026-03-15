import React, { useEffect } from "react";

const SaveYourBagModal = ({
  isOpen,
  onClose,
  onGuestContinue,
  onSignIn
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-[6px] flex items-center justify-center p-6 animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-[420px] bg-[#121212] border border-white/10 rounded-[18px] p-10 text-center shadow-[0_40px_120px_rgba(0,0,0,0.8)] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-oswald text-4xl uppercase tracking-[-0.02em] mb-[14px] text-white">Save Your Bag?</h2>

        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white/60 leading-[1.8] mb-9 px-4">
          You can continue as a guest, or sign in to save your bag for later.
        </p>

        <div className="flex flex-col gap-4">
          <button
            className="w-full h-14 text-[11px] font-extrabold tracking-[0.25em] uppercase cursor-pointer transition-all duration-[250ms] ease-in bg-white text-black border-none hover:bg-accent"
            onClick={onGuestContinue}
          >
            Continue as Guest
          </button>

          <button
            className="w-full h-14 text-[11px] font-extrabold tracking-[0.25em] uppercase cursor-pointer transition-all duration-[250ms] ease-in bg-transparent text-white border border-white/20 hover:bg-white/5"
            onClick={onSignIn}
          >
            Sign In / Create Account
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/30 leading-[1.8]">
            No account needed to place an order. <br />
            Secure checkout guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaveYourBagModal;
