import { Link } from "react-router-dom";

export default function CheckoutHeader() {
  return (
    <header className="bg-secondary text-text-primary h-20 flex items-center border-b border-border-subtle sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex justify-between items-center text-text-primary">
        <Link to="/" className="text-xl md:text-3xl font-[Oswald] uppercase tracking-tighter no-underline text-text-primary">F e n r i r</Link>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
          <span className="material-symbols-outlined text-[#d4c4b1] text-lg">lock</span>
          <span className="hidden sm:inline">100% Secure Checkout</span>
          <span className="sm:hidden">Secure</span>
        </div>
      </div>
    </header>
  );
}
