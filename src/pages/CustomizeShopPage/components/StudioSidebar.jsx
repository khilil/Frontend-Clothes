import { useFabric } from "../../../context/FabricContext";
import TextTab from "./sidebar/TextTab";
import GraphicsTab from "./sidebar/GraphicsTab";
import LayersTab from "./sidebar/LayersTab";
import FabricColorPicker from "./FabricColorPicker";
import BottomCTA from "./BottomCTA";

export default function StudioSidebar() {
    const { activeTab } = useFabric();

    const renderTabContent = () => {
        switch (activeTab) {
            case "text":
                return <TextTab />;
            case "graphics":
                return <GraphicsTab />;
            case "layers":
                return <LayersTab />;
            case "elements":
            default:
                return (
                    <div className="space-y-8 animate-slideUp">
                        <div className="relative pl-4 border-l-2 border-[#d4c4b1]/30 py-1">
                            <span className="absolute -left-[2px] top-0 w-[2px] h-4 bg-[#d4c4b1] animate-pulse" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#d4c4b1]">
                                Design Protocol
                            </h3>
                            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-2 font-medium">
                                Configure the base architecture of your custom garment.
                            </p>
                        </div>
                        <FabricColorPicker />
                        <div className="h-px bg-white/5" />
                        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#d4c4b1]/5 blur-2xl rounded-full -mr-8 -mt-8 transition-all group-hover:bg-[#d4c4b1]/10" />
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-1.5 bg-[#d4c4b1] rounded-full shadow-[0_0_8px_#d4c4b1]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d4c4b1]">System Insight</span>
                            </div>
                            <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-[0.15em] font-medium">
                                Utilize the <span className="text-white/70">Layers Panel</span> to orchestrate complex design architectures and toggle element visibility.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <aside className="h-full flex flex-col">
            <div data-lenis-prevent className="flex-1 overflow-y-auto py-8 pr-2">
                {renderTabContent()}
            </div>

            {/* STICKY BOTTOM ACTIONS */}
            <div className="pt-2 md:pt-6 border-t border-white/5 bg-[#121212]">
                <BottomCTA />
            </div>
        </aside>
    );
}
