import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FabricProvider, useFabric } from "../../../context/FabricContext";
import CanvasArea from "../components/CanvasArea";
import StudioNavbar from "../components/StudioNavbar";
import StudioToolbar from "../components/StudioToolbar";
import StudioSidebar from "../components/StudioSidebar";
import DesignPreviewModal from "../components/DesignPreviewModal";
import { motion } from "framer-motion";
import { FiRotateCcw, FiRotateCw } from "react-icons/fi";

function HeaderControls() {
    const { undo, redo, canUndo, canRedo } = useFabric();

    return (
        <div className="flex items-center gap-2 mr-4">
            <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-2 rounded-lg transition-all ${canUndo ? "text-[#1a1a1a] hover:bg-black/5" : "text-black/10 cursor-not-allowed"}`}
                title="Undo"
            >
                <FiRotateCcw size={18} />
            </button>
            <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-2 rounded-lg transition-all ${canRedo ? "text-[#1a1a1a] hover:bg-black/5" : "text-black/10 cursor-not-allowed"}`}
                title="Redo"
            >
                <FiRotateCw size={18} />
            </button>
        </div>
    );
}

export default function CustomizeEditorLayout() {
    const location = useLocation();
    const isPreview = location.pathname.includes("/preview");

    // Mobile state
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <FabricProvider>
            <div className="bg-[#fcfbf9] h-[100dvh] overflow-hidden flex flex-col relative text-[#1a1a1a]">

                {/* HEADER / NAV (Optional, if you have one) */}
                <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 bg-white z-50">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4c4b1]">GenZ Studio</span>
                        <div className="h-4 w-px bg-black/10" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 hidden sm:inline">Custom Apparel Design</span>
                    </div>

                    <HeaderControls />
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {isPreview ? (
                        <Outlet />
                    ) : (
                        <>
                            {/* LEFT NAVBAR (Desktop Only) */}
                            <div className="hidden md:block">
                                <StudioNavbar />
                            </div>

                            {/* MAIN CANVAS AREA */}
                            <div className={`relative flex-1 flex flex-col transition-all duration-500 ease-in-out bg-[#f0f0f0] ${isExpanded ? "mb-[60vh] md:mb-0" : "mb-[80px] md:mb-0"}`}>

                                {/* CONTEXTUAL TOOLBAR */}
                                <StudioToolbar />

                                <div className="flex-1 flex items-center justify-center p-4">
                                    <CanvasArea />
                                </div>
                            </div>

                            {/* STICKY SIDEBAR (Desktop) / BOTTOM SHEET (Mobile) */}
                            <motion.div
                                drag={window.innerWidth < 768 ? "y" : false}
                                dragConstraints={{ top: 0, bottom: 0 }}
                                onDragEnd={(e, info) => {
                                    if (window.innerWidth < 768) {
                                        if (info.offset.y > 50) setIsExpanded(false);
                                        if (info.offset.y < -50) setIsExpanded(true);
                                    }
                                }}
                                className={`fixed bottom-0 left-0 right-0 w-full bg-[#f4f2ee] z-[60] 
                                    transition-all duration-500 ease-in-out border-t border-black/5
                                    md:relative md:w-[320px] lg:w-[400px] md:h-full md:translate-y-0 md:border-t-0 md:border-l
                                    ${isExpanded ? "h-[60vh] translate-y-0" : "h-[80px] translate-y-0"} 
                                    rounded-t-[2.5rem] md:rounded-t-none shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none
                                    flex flex-col`}
                            >
                                {/* Drag Handle - Mobile Only */}
                                <div
                                    className="w-full py-2 cursor-grab active:cursor-grabbing flex flex-col items-center md:hidden shrink-0"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    <div className="w-12 h-1 bg-black/10 rounded-full mb-1"></div>
                                    {!isExpanded && (
                                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#d4c4b1] animate-pulse">
                                            Open Editor
                                        </span>
                                    )}
                                </div>

                                {/* Mobile Navbar - Only visible on mobile AND when expanded */}
                                {isExpanded && (
                                    <div className="md:hidden shrink-0 border-b border-black/5 animate-slideUp">
                                        <StudioNavbar />
                                    </div>
                                )}

                                {/* Sidebar Content */}
                                <div className={`flex-1 overflow-hidden px-6 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0 md:opacity-100"}`}>
                                    <StudioSidebar />
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
            <DesignPreviewModal />
        </FabricProvider>
    );
}
