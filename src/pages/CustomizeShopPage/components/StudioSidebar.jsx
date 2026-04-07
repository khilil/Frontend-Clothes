import { useFabric } from "../../../context/FabricContext";
import TextTab from "./sidebar/TextTab";
import GraphicsTab from "./sidebar/GraphicsTab";
import LayersTab from "./sidebar/LayersTab";
import ElementsTab from "./sidebar/ElementsTab";
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
                return <ElementsTab />;
            default:
                return (
                    <div className="space-y-8 animate-slideUp">
                        <div className="relative pl-4 border-l-2 border-[#d4c4b1]/30 py-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#0A0A0A]">
                                Design Protocol
                            </h3>
                            <p className="text-[9px] text-[#4A4A4A] uppercase tracking-[0.2em] mt-2 font-black leading-relaxed">
                                Configure your custom garment components.
                            </p>
                        </div>
                        <div className="h-px bg-black/5" />
                        <div className="p-5 bg-white border border-black/5 rounded-2xl relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#d4c4b1]/5 blur-2xl rounded-full -mr-8 -mt-8 transition-all group-hover:bg-[#d4c4b1]/10" />
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-1.5 bg-[#d4c4b1] rounded-full shadow-[0_0_8px_#d4c4b1]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0A0A0A]">System Insight</span>
                            </div>
                            <p className="text-[9px] text-[#4A4A4A] leading-relaxed uppercase tracking-[0.15em] font-black">
                                Utilize the <span className="text-[#0A0A0A]">Layers Panel</span> to orchestrate complex design architectures and toggle element visibility.
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
            <div className="pt-2 md:pt-6 border-t border-black/5 bg-[#f4f2ee]">
                <BottomCTA />
            </div>
        </aside>
    );
}
