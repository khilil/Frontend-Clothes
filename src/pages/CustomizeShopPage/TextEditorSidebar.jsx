import { useState } from "react";
import { useFabric } from "../../context/FabricContext";
import ElementLibrary from "./components/ElementLibrary";
import { FONT_FAMILIES } from "./fabric/fontRegistry";
import { addOrUpdateText, applyFontFamily, applyTextKerning } from "./fabric/textActions";
import { waitForFont } from "./fabric/fontUtils";
import { useNavigate } from "react-router-dom";
import { applyTextAlignment } from "./fabric/textActions";
import LayersPanel from "./components/LayersPanel";
import PreviewButton from "./components/Preview/PreviewButton";
import { FiArrowLeft } from "react-icons/fi";

export default function TextEditorSidebar() {
    const navigate = useNavigate();
    const { fabricCanvas, activeTextRef, printAreaRef } = useFabric();
    const [fontFamily, setFontFamily] = useState("Oswald");
    const [kerning, setKerning] = useState(20);

    async function handleFontChange(fontFamily) {
        if (!fabricCanvas.current || !activeTextRef.current) return;

        await waitForFont(fontFamily);

        activeTextRef.current.set({
            fontFamily,
        });

        activeTextRef.current.initDimensions();
        activeTextRef.current.setCoords();
        fabricCanvas.current.requestRenderAll();
    }

    const handleKerning = (e) => {
        const value = Number(e.target.value);
        setKerning(value);
        if (!fabricCanvas.current || !activeTextRef.current) return;

        // Fabric.js charSpacing: 1000 units = 1em
        // Slider value 0-100 corresponds to 0-1em
        applyTextKerning(fabricCanvas.current, activeTextRef.current, value * 10);
    };

    const handleTextChange = (e) => {
        addOrUpdateText(
            fabricCanvas.current,
            activeTextRef,
            { text: e.target.value },
            printAreaRef.current
        );
    };

    function handleColor(color) {
        if (!fabricCanvas.current) return;

        addOrUpdateText(
            fabricCanvas.current,
            activeTextRef,
            { fill: color },
            printAreaRef.current
        );
    }

    function handleAlignment(type) {
        if (!fabricCanvas.current || !activeTextRef.current) return;

        applyTextAlignment(
            fabricCanvas.current,
            activeTextRef.current,
            type,
            printAreaRef.current
        );
    }

    return (
        <div className="space-y-12 pb-10">
            {/* BACK BUTTON */}
            <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-[#d4c4b1] transition-all duration-300"
            >
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#d4c4b1]/30 transition-colors">
                    <FiArrowLeft size={14} />
                </div>
                Back to Studio
            </button>

            {/* 01. ELEMENT LIBRARY */}
            <ElementLibrary />

            {/* 02. TEXT STYLING */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-70">
                        02. Text Styling
                    </h4>
                    <div className="h-px flex-1 bg-white/5 ml-4"></div>
                </div>

                <div className="space-y-6">
                    {/* TEXT INPUT */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                            Custom Text Input
                        </label>
                        <input
                            type="text"
                            defaultValue="Studio Edit"
                            onChange={handleTextChange}
                            className="w-full bg-[#1a1a1a]/50 border border-white/5 p-4 rounded-xl text-xs font-bold tracking-widest uppercase text-white focus:ring-1 focus:ring-[#d4c4b1]/50 focus:border-[#d4c4b1]/50 transition-all outline-none"
                        />
                    </div>

                    {/* FONT FAMILY */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                            Typography Style
                        </label>

                        <div className="relative group">
                            <select
                                value={fontFamily}
                                onChange={(e) => {
                                    const selectedFont = e.target.value;
                                    setFontFamily(selectedFont);
                                    handleFontChange(selectedFont);
                                }}
                                className="w-full bg-[#1a1a1a]/50 border border-white/5 p-4 rounded-xl text-xs font-bold tracking-widest text-white appearance-none focus:ring-1 focus:ring-[#d4c4b1]/50 focus:border-[#d4c4b1]/50 transition-all outline-none cursor-pointer"
                            >
                                {FONT_FAMILIES.map((font) => (
                                    <option key={font.value} value={font.value} className="bg-[#121212]">
                                        {font.label}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-[#d4c4b1] transition-colors">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* ALIGNMENT + KERNING */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* ALIGNMENT */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                                Alignment
                            </label>
                            <div className="flex bg-[#1a1a1a]/50 border border-white/5 rounded-xl overflow-hidden h-12">
                                {["left", "center", "right"].map((align, i) => (
                                    <button
                                        key={align}
                                        onClick={() => handleAlignment(align)}
                                        className={`flex-1 flex items-center justify-center hover:bg-white/10 hover:text-[#d4c4b1] transition-all duration-300 ${i !== 2 ? "border-r border-white/5" : ""}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {`format_align_${align}`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* KERNING */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                                Kerning
                            </label>
                            <div className="flex items-center h-12 gap-3 px-3 bg-[#1a1a1a]/50 border border-white/5 rounded-xl">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={kerning}
                                    onChange={handleKerning}
                                    className="flex-1 h-1 bg-white/10 appearance-none accent-[#d4c4b1] rounded-lg cursor-pointer"
                                />
                                <span className="text-[10px] font-mono text-[#d4c4b1] bg-[#d4c4b1]/10 px-1.5 py-0.5 rounded">
                                    {(kerning / 100).toFixed(1)}em
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TEXT COLORS */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                            Color Palette
                        </label>

                        <div className="flex gap-4">
                            {[
                                "#000",
                                "#fff",
                                "#800000",
                                "#d4c4b1",
                                "#E93562"
                            ].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handleColor(color)}
                                    className="group relative w-10 h-10 rounded-full border border-white/10 p-1 hover:border-[#d4c4b1]/50 transition-all duration-300"
                                >
                                    <div
                                        className="w-full h-full rounded-full border border-white/5 shadow-inner transition-transform group-hover:scale-90 duration-300"
                                        style={{ backgroundColor: color }}
                                    />
                                </button>
                            ))}

                            <button className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-white/40 transition-all duration-300 text-white/20 hover:text-white">
                                <span className="material-symbols-outlined text-sm">
                                    add
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 03. LAYERS */}
            <LayersPanel />

            {/* 04. PREVIEW DESIGN */}
            <PreviewButton />
        </div>
    );
}
