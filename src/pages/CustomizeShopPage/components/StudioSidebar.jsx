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
                        <div className="space-y-2">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-50">
                                Product Customization
                            </h3>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                                Select and customize the base fabric of your garment.
                            </p>
                        </div>
                        <FabricColorPicker />
                        <div className="h-px bg-white/5" />
                        <div className="p-6 bg-gradient-to-br from-[#d4c4b1]/10 to-transparent border border-[#d4c4b1]/20 rounded-2xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#d4c4b1] mb-2 block">Pro Tip</span>
                            <p className="text-[9px] text-white/60 leading-relaxed uppercase tracking-widest">
                                Use the layers panel to organize your design elements and manage visibility.
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
