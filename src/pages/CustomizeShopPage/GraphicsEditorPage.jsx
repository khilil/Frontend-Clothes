import { FiArrowLeft } from "react-icons/fi";
import ElementLibrary from "./components/ElementLibrary";
import { useFabric } from "../../context/FabricContext";
import { addGraphicToCanvas } from "./fabric/Graphic/components/addGraphic";

import { addSVGToCanvas } from "./fabric/Graphic/addSVGGraphic";
import LayersPanel from "./components/LayersPanel";
import PreviewButton from "./components/Preview/PreviewButton";
import { useEffect, useState } from "react";
import { getGraphics } from "../../services/customizationService";

export default function GraphicsEditorPage() {
    const [fetchedGraphics, setFetchedGraphics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const svgGraphics = fetchedGraphics.map(g => ({ name: g.name, file: g.url, isFetched: true }));

    useEffect(() => {
        const fetchRemoteGraphics = async () => {
            setIsLoading(true);
            try {
                const data = await getGraphics();
                setFetchedGraphics(data || []);
            } catch (error) {
                console.error("Failed to fetch graphics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRemoteGraphics();
    }, []);

    const {
        fabricCanvas,
        printAreaRef,
    } = useFabric();

    const handleFabricColorChange = (color) => {
        if (!fabricCanvas.current) return;

        fabricCanvas.current.setBackgroundColor(
            color,
            fabricCanvas.current.renderAll.bind(fabricCanvas.current)
        );
    };

    return (
        <div className="space-y-12 pb-10">
            {/* BACK BUTTON */}
            <button
                onClick={() => window.history.back()}
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-[#d4c4b1] transition-all duration-300"
            >
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#d4c4b1]/30 transition-colors">
                    <FiArrowLeft size={14} />
                </div>
                Back to Studio
            </button>

            {/* 01. ELEMENT LIBRARY */}
            <ElementLibrary />

            {/* 02. GRAPHIC LIBRARY */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-70">
                        02. Graphic Library
                    </h4>
                    <div className="h-px flex-1 bg-white/5 ml-4"></div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {svgGraphics.map((item, index) => (
                        <button
                            key={index}
                            onClick={() =>
                                addSVGToCanvas(
                                    fabricCanvas.current,
                                    item.file,
                                    printAreaRef.current
                                )
                            }
                            className="group relative bg-[#1a1a1a]/50 aspect-square border border-white/5 flex items-center justify-center hover:border-[#d4c4b1]/50 hover:bg-[#d4c4b1]/5 transition-all duration-500 rounded-xl overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#d4c4b1]/0 to-[#d4c4b1]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <img loading="lazy" 
                                src={item.file}
                                alt={item.name}
                                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                        </button>
                    ))}
                </div>
            </section>

            {/* 03. FABRIC COLOR */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-70">
                        03. Fabric Color
                    </h4>
                    <div className="h-px flex-1 bg-white/5 ml-4"></div>
                </div>

                <div className="flex gap-4">
                    {[
                        "#ffffff",
                        "#000000",
                        "#2d3a3a",
                        "#d4c4b1"
                    ].map((color) => (
                        <button
                            key={color}
                            onClick={() => handleFabricColorChange(color)}
                            className="group relative w-12 h-12 rounded-full border border-white/10 p-1 hover:border-[#d4c4b1]/50 transition-all duration-300"
                        >
                            <div
                                className="w-full h-full rounded-full border border-white/5 shadow-inner transition-transform group-hover:scale-90 duration-300"
                                style={{ backgroundColor: color }}
                            />
                        </button>
                    ))}
                </div>
            </section>

            {/* 04. LAYERS */}
            <LayersPanel />

            {/* 05. PREVIEW DESIGN */}
            <PreviewButton />
        </div>
    );
}
