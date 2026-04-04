import { useNavigate, useLocation, Link } from "react-router-dom";

export default function StudioHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const segments = location.pathname.split("/");

    // URL structure:
    // /customize/:slug/:tool?
    const slug = segments[2];
    const activeTool = segments[3];

    const toolLabels = {
        text: "Active Text Editor",
        shapes: "Shape Editor",
        graphics: "Graphics Editor",
        layers: "Layer Manager",
    };

    const activeLabel = toolLabels[activeTool];

    const handleExitStudio = () => {
        if (slug) {
            navigate(`/product/${slug}`);
        }
    };

    const handleStudioClick = () => { if (slug) { navigate(`/customize/${slug}`); } };

    return (
        <header className="fixed inset-x-0 top-0 z-50 h-16 lg:h-20 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
            <div className="max-w-[1920px] mx-auto h-full px-4 lg:px-12 flex items-center justify-between">

                {/* ===== MOBILE LAYOUT ===== */}
                <div className="flex w-full items-center justify-between lg:hidden">

                    {/* Tool Name */}

                    <span className="text-xs font-black uppercase tracking-[0.3em] text-[#d4c4b1] truncate" onClick={handleStudioClick}>
                        {activeLabel || "Pro Editor Mode"}
                    </span>

                    {/* Exit */}
                    <button
                        onClick={handleExitStudio}
                        className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-white 
                                   hover:text-red-500 transition-all duration-300 ease-in-out"
                    >
                        <span className="material-symbols-outlined text-base">
                            close
                        </span>
                        Exit Studio
                    </button>
                </div>

                {/* ===== DESKTOP LAYOUT ===== */}
                <div className="hidden lg:flex w-full items-center justify-between">

                    {/* LEFT */}
                    <div className="flex-1">
                        <Link to="/" className="logo">MODERN MEN</Link>
                    </div>

                    {/* CENTER */}
                    <div className="flex flex-1 items-center justify-center gap-4 select-none">
                        {/* Canvas Studio Click */}
                        <button onClick={handleStudioClick} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-colors duration-300" > FENRIR Studio / </button>

                        <span className="relative text-[10px] text-[#d4c4b1] font-black uppercase tracking-[0.4em] text-accent">
                            {activeLabel || "Pro Editor Mode"}

                            {/* Red underline */}
                            <span className="absolute left-0 -bottom-1 h-[1px] w-full bg-red-100 rounded-full 
                     transition-all duration-300 ease-in-out" />
                        </span>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-1 justify-end items-center gap-6">
                        <button
                            onClick={handleExitStudio}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white 
                                       hover:text-red-500 transition-all duration-300 ease-in-out"
                        >
                            <span className="material-symbols-outlined text-lg">
                                close
                            </span>
                            Exit Studio
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}
