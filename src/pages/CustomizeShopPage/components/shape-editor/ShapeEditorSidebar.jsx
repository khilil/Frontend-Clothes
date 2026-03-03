import { FiArrowLeft } from "react-icons/fi";
import ElementLibrary from "../ElementLibrary";
import ShapeGrid from "./ShapeGrid";
import { useFabric } from "../../../../context/FabricContext";
import { updateOpacity, updateShape, updateStrokeWidth } from "../../fabric/Shapes/shapeActions";
import { useState } from "react";
import LayersPanel from "../LayersPanel";
import PreviewButton from "../Preview/PreviewButton";
import { useNavigate } from "react-router-dom";

export default function ShapeEditorSidebar() {
    const navigate = useNavigate();
    const { fabricCanvas, activeShapeRef } = useFabric();
    const [opacity, setOpacity] = useState(100);
    const [strokeWidth, setStrokeWidth] = useState(2);

    return (
        <div className="space-y-12 pb-10">
            {/* 🔙 Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-[#d4c4b1] transition-all duration-300"
            >
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#d4c4b1]/30 transition-colors">
                    <FiArrowLeft size={14} />
                </div>
                Back to Studio
            </button>

            {/* ================= ELEMENT LIBRARY ================= */}
            <ElementLibrary />

            {/* ================= SHAPE LIBRARY ================= */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-70">
                        02. Shape Library
                    </h4>
                    <div className="h-px flex-1 bg-white/5 ml-4"></div>
                </div>

                <ShapeGrid />

                <div className="space-y-10 pt-6">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Shape customization
                    </h5>

                    {/* Fill Color */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                            Surface Color
                        </label>
                        <div className="flex gap-4 flex-wrap">
                            {["#ff0000", "#ffffff", "#000000", "#d4c4b1"].map((color) => (
                                <button
                                    key={color}
                                    onClick={() =>
                                        updateShape(activeShapeRef, fabricCanvas.current, { fill: color })
                                    }
                                    className="group relative w-10 h-10 rounded-full border border-white/10 p-1 hover:border-[#d4c4b1]/50 transition-all duration-300"
                                >
                                    <div
                                        className="w-full h-full rounded-full border border-white/5 shadow-inner transition-transform group-hover:scale-90 duration-300"
                                        style={{ backgroundColor: color }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stroke Color */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                            Outline Color
                        </label>
                        <div className="flex gap-4">
                            {["#ffffff", "#000000", "#d4c4b1"].map((color) => (
                                <button
                                    key={color}
                                    onClick={() =>
                                        updateShape(activeShapeRef, fabricCanvas.current, { stroke: color })
                                    }
                                    className="group relative w-10 h-10 rounded-full border border-white/10 p-1 hover:border-[#d4c4b1]/50 transition-all duration-300"
                                >
                                    <div
                                        className="w-full h-full rounded-full border border-white/5 shadow-inner transition-transform group-hover:scale-90 duration-300"
                                        style={{ backgroundColor: color }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Opacity */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                                Transparency
                            </label>
                            <span className="text-[10px] font-mono text-[#d4c4b1] bg-[#d4c4b1]/10 px-1.5 py-0.5 rounded">
                                {opacity}%
                            </span>
                        </div>
                        <div className="bg-[#1a1a1a]/50 border border-white/5 p-4 rounded-xl">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={opacity}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setOpacity(value);
                                    updateOpacity(fabricCanvas.current, activeShapeRef.current, value);
                                }}
                                className="w-full h-1 bg-white/10 appearance-none accent-[#d4c4b1] rounded-lg cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Stroke Width */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                                Stroke Width
                            </label>
                            <span className="text-[10px] font-mono text-[#d4c4b1] bg-[#d4c4b1]/10 px-1.5 py-0.5 rounded">
                                {strokeWidth}px
                            </span>
                        </div>
                        <div className="bg-[#1a1a1a]/50 border border-white/5 p-4 rounded-xl">
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={strokeWidth}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setStrokeWidth(value);
                                    updateStrokeWidth(fabricCanvas.current, activeShapeRef.current, value);
                                }}
                                className="w-full h-1 bg-white/10 appearance-none accent-[#d4c4b1] rounded-lg cursor-pointer"
                            />
                        </div>
                    </div>

                    <LayersPanel />
                </div>
            </section>

            <PreviewButton />
        </div>
    );
}
