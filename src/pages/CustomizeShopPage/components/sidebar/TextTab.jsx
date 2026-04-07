import { useState } from "react";
import { useFabric } from "../../../../context/FabricContext";
import { FONT_FAMILIES as INITIAL_FONTS } from "../../fabric/fontRegistry";
import { addOrUpdateText, applyTextAlignment, applyTextKerning } from "../../fabric/textActions";
import { waitForFont, loadGoogleFont } from "../../fabric/fontUtils";
import { FiPlus, FiAlignLeft, FiAlignCenter, FiAlignRight, FiLoader } from "react-icons/fi";
import { useEffect } from "react";
import { getFonts } from "../../../../services/customizationService";

export default function TextTab() {
    const { fabricCanvas, activeTextRef, printAreaRef, setSelectedObject } = useFabric();
    const [fontFamily, setFontFamily] = useState("Oswald");
    const [kerning, setKerning] = useState(20);
    const [fonts, setFonts] = useState([...INITIAL_FONTS]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchFonts = async () => {
            setIsLoading(true);
            try {
                const data = await getFonts();
                if (data?.length > 0) {
                    // Combine initial fonts with fetched fonts, avoiding duplicates
                    const fetched = data.map(f => ({ label: f.label, value: f.value, google: true }));
                    const combined = [...INITIAL_FONTS];
                    fetched.forEach(f => {
                        if (!combined.find(cf => cf.value === f.value)) {
                            combined.push(f);
                        }
                    });
                    setFonts(combined);
                }
            } catch (error) {
                console.error("Failed to fetch fonts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFonts();
    }, []);

    const handleTextAdd = () => {
        addOrUpdateText(
            fabricCanvas.current,
            activeTextRef,
            { text: "Double Click to Edit" },
            printAreaRef.current
        );
        setSelectedObject(activeTextRef.current);
    };

    const handleTextChange = (e) => {
        if (!fabricCanvas.current || !activeTextRef.current) return;
        activeTextRef.current.set({ text: e.target.value });
        fabricCanvas.current.renderAll();
    };

    const handleFontChange = async (font) => {
        setFontFamily(font);
        if (!fabricCanvas.current || !activeTextRef.current) return;

        try {
            await loadGoogleFont(font);
            await waitForFont(font);
            activeTextRef.current.set({ fontFamily: font });
            fabricCanvas.current.renderAll();
        } catch (error) {
            console.error("Failed to load font:", error);
        }
    };

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
        <div className="space-y-8 animate-slideUp">
            <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-50">
                    Text Assets
                </h3>
                <button
                    onClick={handleTextAdd}
                    className="w-full h-16 bg-[#d4c4b1] hover:bg-[#c4b4a1] text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-[#d4c4b1]/10"
                >
                    <FiPlus size={18} /> Add Heading
                </button>
            </div>

            <div className="h-px bg-black/5" />

            {/* QUICK EDIT (If text selected) */}
            {activeTextRef.current && (
                <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-50">
                        Quick Edit
                    </h3>

                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
                            Edit Content
                        </label>
                        <input
                            type="text"
                            placeholder="Type here..."
                            onChange={handleTextChange}
                            className="w-full bg-white border border-black/20 p-4 rounded-xl text-xs font-bold tracking-widest uppercase text-[#0A0A0A] outline-none focus:border-[#d4c4b1] transition-all font-primary shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
                                Alignment
                            </label>
                            <div className="flex bg-white border border-black/20 rounded-xl overflow-hidden h-12 shadow-sm">
                                {[
                                    { id: 'left', icon: FiAlignLeft },
                                    { id: 'center', icon: FiAlignCenter },
                                    { id: 'right', icon: FiAlignRight }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleAlignment(item.id)}
                                        className="flex-1 flex items-center justify-center hover:bg-black/5 hover:text-[#8b7e6d] transition-all text-black/40"
                                    >
                                        <item.icon size={16} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
                                Kerning
                            </label>
                            <div className="flex items-center h-12 px-3 bg-white border border-black/20 rounded-xl shadow-sm">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={kerning}
                                    onChange={(e) => {
                                        setKerning(e.target.value);
                                        applyTextKerning(fabricCanvas.current, activeTextRef.current, e.target.value * 10);
                                    }}
                                    className="w-full h-1 bg-black/10 appearance-none accent-[#d4c4b1] rounded-lg cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-50">
                    Typography
                </h3>
                <div data-lenis-prevent className="grid grid-cols-1 gap-2 h-[300px] overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-black/20">
                            <FiLoader className="animate-spin" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Loading Typography...</span>
                        </div>
                    ) : (
                        fonts.map((font) => (
                            <button
                                key={font.value}
                                onClick={() => handleFontChange(font.value)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${fontFamily === font.value
                                    ? "bg-[#d4c4b1]/10 border-[#d4c4b1]/30 text-[#8b7e6d]"
                                    : "bg-white border-black/5 text-black/60 hover:border-black/20 hover:text-black shadow-sm"
                                    }`}
                            >
                                <span className="text-xs font-bold tracking-widest uppercase font-primary" style={{ fontFamily: font.value }}>
                                    {font.label}
                                </span>
                                {fontFamily === font.value && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4c4b1]" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
