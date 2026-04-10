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
    const { activeTab, setActiveTab } = useFabric();

    return (
        <nav className="w-full md:w-20 bg-[#fcfbf9] border-t md:border-t-0 md:border-r border-black/5 flex md:flex-col items-center justify-start py-2 md:py-6 md:gap-8 z-50 overflow-x-auto no-scrollbar">

            <div className="flex md:flex-col gap-2 md:gap-4 w-full px-2 justify-start md:justify-start min-w-max md:min-w-0">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group relative flex items-center md:flex-col gap-2 md:gap-1.5 py-2.5 md:py-3 px-3.5 md:px-0 rounded-xl transition-all duration-300 min-w-max md:min-w-0 ${isActive
                                ? "bg-[#d4c4b1]/10 text-[#8b7e6d]"
                                : "text-black/30 hover:text-[#1a1a1a] hover:bg-black/5"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute bottom-0 md:bottom-auto md:left-0 md:top-1/2 md:-translate-y-1/2 w-8 h-0.5 md:w-1 md:h-6 bg-[#d4c4b1] rounded-full" />
                            )}
                            <Icon size={18} className="md:size-[20px]" />
                            <span className="text-[9px] md:text-[9px] font-black uppercase tracking-tight md:tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
