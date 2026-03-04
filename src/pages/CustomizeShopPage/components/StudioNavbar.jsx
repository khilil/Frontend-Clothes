import {
    FiType,
    FiImage,
    FiLayers,
    FiGrid,
    FiSettings
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
        <nav className="w-full md:w-20 bg-[#0a0a0a] border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col items-center justify-around md:justify-start py-2 md:py-6 md:gap-8 z-50">

            <div className="flex md:flex-col gap-2 md:gap-4 w-full px-2 justify-around md:justify-start">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group relative flex flex-col items-center gap-1 md:gap-1.5 py-2 md:py-3 px-3 md:px-0 rounded-xl transition-all duration-300 ${isActive
                                ? "bg-[#d4c4b1]/10 text-[#d4c4b1]"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute bottom-0 md:bottom-auto md:left-0 md:top-1/2 md:-translate-y-1/2 w-8 h-0.5 md:w-1 md:h-6 bg-[#d4c4b1] rounded-full" />
                            )}
                            <Icon size={18} className="md:size-[20px]" />
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
