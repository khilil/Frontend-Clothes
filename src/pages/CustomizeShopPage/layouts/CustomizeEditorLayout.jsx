import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FabricProvider, useFabric } from "../../../context/FabricContext";
import CanvasArea from "../components/CanvasArea";
import StudioNavbar from "../components/StudioNavbar";
import StudioToolbar from "../components/StudioToolbar";
import StudioSidebar from "../components/StudioSidebar";
import DesignPreviewModal from "../components/DesignPreviewModal";
import InitialConfigOverlay from "../components/InitialConfigOverlay";
import { motion } from "framer-motion";
import { FiRotateCcw, FiRotateCw, FiArrowLeft } from "react-icons/fi";
import { useEffect } from "react";

function HeaderControls() {
    const { undo, redo, canUndo, canRedo } = useFabric();

    return (
        <div className="flex items-center gap-1 md:gap-2 mr-0 md:mr-4">
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

    // Safety check: is the studio initialized from Product Details OR overlay?
    const isConfigured = !!location.state?.variantId;

    return (
        <FabricProvider>
            <CustomizeEditorContent isPreview={isPreview} isConfigured={isConfigured} slug={location.pathname.split('/').pop()} locationState={location.state} />
        </FabricProvider>
    );
}

function CustomizeEditorContent({ isPreview, isConfigured, slug, locationState }) {
    const navigate = useNavigate();
    // Mobile state
    const [isExpanded, setIsExpanded] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth >= 768 : true
    );
    const { setGarmentColor } = useFabric();

    useEffect(() => {
        if (locationState?.hexColor) {
            setGarmentColor(locationState.hexColor.startsWith('#') ? locationState.hexColor : `#${locationState.hexColor}`);
        } else if (locationState?.color) {
            const colors = [
                { id: 'white', value: '#F9F6F0', label: 'Bone White', match: 'white' },
                { id: 'black', value: '#1a1a1a', label: 'Charcoal Black', match: 'black' },
                { id: 'olive', value: '#4B5320', label: 'Tactical Olive', match: 'olive' },
                { id: 'beige', value: '#D2B48C', label: 'Atelier Sand', match: 'sand' },
                { id: 'navy', value: '#000080', label: 'Deep Sea Navy', match: 'navy' },
            ];
            const nameLower = locationState.color.toLowerCase();
            const found = colors.find(c => nameLower.includes(c.match));
            if (found) {
                setGarmentColor(found.value);
            }
        }
    }, [locationState?.color, locationState?.hexColor, setGarmentColor]);

    return (
        <>
            {!isConfigured && !isPreview && (
                <InitialConfigOverlay slug={slug} />
            )}
            <div className="bg-[#fcfbf9] h-[100dvh] overflow-hidden flex flex-col relative text-[#1a1a1a]">

                {/* HEADER / NAV */}
                <div className="h-14 border-b border-black/5 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-white z-50 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-all text-[#1a1a1a] flex items-center justify-center"
                            title="Go Back"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div className="h-4 w-px bg-black/10" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-[#0A0A0A] whitespace-nowrap">FENRIR Era</span>
                        <div className="h-4 w-px bg-black/10 hidden xs:block" />
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-black/40 hidden md:inline">Custom Apparel Design</span>
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
                            <div className={`relative flex-1 flex flex-col transition-all duration-500 ease-in-out bg-[#f0f0f0] ${isExpanded ? "mb-[62dvh] md:mb-0" : "mb-[88px] md:mb-0"}`}>

                                {/* CONTEXTUAL TOOLBAR */}
                                <StudioToolbar />

                                <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0">
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
                                    transition-all duration-500 ease-in-out border-t border-black/5 bg-[#f4f2ee]/95 backdrop-blur-xl
                                    md:relative md:w-[320px] lg:w-[400px] md:h-full md:translate-y-0 md:border-t-0 md:border-l
                                    ${isExpanded ? "h-[62dvh] translate-y-0" : "h-[88px] translate-y-0"} 
                                    rounded-t-[2rem] md:rounded-t-none shadow-[0_-15px_50px_rgba(0,0,0,0.08)] md:shadow-none
                                    flex flex-col`}
                            >
                                {/* Drag Handle - Mobile Only */}
                                <div
                                    className="w-full py-3 cursor-grab active:cursor-grabbing flex flex-col items-center md:hidden shrink-0"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    <div className="w-12 h-1 bg-black/10 rounded-full mb-1"></div>
                                    {!isExpanded && (
                                        <span className="text-[8px] font-black uppercase tracking-[0.24em] text-[#8b7e6d] animate-pulse">
                                            Open Studio Tools
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
                                <div className={`flex-1 overflow-hidden px-4 md:px-6 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:pb-0 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0 md:opacity-100"}`}>
                                    <StudioSidebar />
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
            <DesignPreviewModal />
        </>
    );
}
