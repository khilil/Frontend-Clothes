import {
    FiType,
    FiImage,
    FiLayers,
    FiGrid
} from "react-icons/fi";
import { useFabric } from "../../../context/FabricContext";

const TABS = [
    { id: "elements", icon: FiGrid, label: "Elements" },
    { id: "graphics", icon: FiImage, label: "Graphics" },
    { id: "text", icon: FiType, label: "Text" },
    { id: "layers", icon: FiLayers, label: "Layers" },
];

export default function StudioNavbar() {
    const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useFabric();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const handleTabClick = (tabId) => {
        if (activeTab === tabId && isSidebarOpen) {
            // Toggle close if same tab is clicked while open
            setIsSidebarOpen(false);
        } else {
            // Switch tab and ensure it's open
            setActiveTab(tabId);
            setIsSidebarOpen(true);
        }
    };

    return (
        <nav className="w-full md:w-20 bg-[#fcfbf9] border-t md:border-t-0 md:border-r border-black/5 flex md:flex-col items-stretch md:items-center justify-around md:justify-start py-1 md:py-6 md:gap-8 z-50">

            <div className="flex md:flex-col w-full md:w-auto gap-0 md:gap-4 px-2 md:px-0 justify-around md:justify-start">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`group relative flex flex-1 md:flex-none flex-col items-center justify-center gap-1 py-1.5 md:py-3 px-2 md:px-0 rounded-xl transition-all duration-300 ${isActive
                                ? "text-[#8b7e6d]"
                                : "text-black/30 hover:text-[#1a1a1a]"
                                }`}
                        >
                            {/* Active indicator — bottom bar on mobile, left bar on desktop */}
                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 w-8 h-0.5 md:w-1 md:h-6 bg-[#d4c4b1] rounded-full" />
                            )}
                            <Icon size={19} />
                            <span className="text-[8px] font-black uppercase tracking-tight opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
