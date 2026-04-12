import { FiTrash2, FiChevronUp, FiChevronDown, FiCopy, FiAlignCenter, FiRotateCcw, FiRotateCw } from "react-icons/fi";
import { useFabric } from "../../../context/FabricContext";
import { FONT_FAMILIES as INITIAL_FONTS } from "../fabric/fontRegistry";
import { waitForFont, loadGoogleFont } from "../fabric/fontUtils";
import { useEffect, useState } from "react";
import { getFonts } from "../../../services/customizationService";

export default function StudioToolbar() {
    const {
        fabricCanvas,
        selectedObject,
        setSelectedObject,
        syncLayers,
        saveHistory
    } = useFabric();

    const [fonts, setFonts] = useState([...INITIAL_FONTS]);

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const data = await getFonts();
                if (data?.length > 0) {
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
                console.error("Failed to fetch fonts for toolbar:", error);
            }
        };
        fetchFonts();
    }, []);

    if (!selectedObject) return null;

    const canHaveColor = ["textbox", "rect", "circle", "triangle", "polygon"].includes(selectedObject.type);

    const handleDelete = () => {
        if (!fabricCanvas.current || !selectedObject) return;
        fabricCanvas.current.remove(selectedObject);
        fabricCanvas.current.discardActiveObject();
        fabricCanvas.current.renderAll();
        setSelectedObject(null);
        syncLayers(fabricCanvas.current);
    };

    const handleDuplicate = () => {
        if (!fabricCanvas.current || !selectedObject) return;
        selectedObject.clone().then((cloned) => {
            cloned.set({
                left: selectedObject.left + 20,
                top: selectedObject.top + 20,
                evented: true,
            });
            fabricCanvas.current.add(cloned);
            fabricCanvas.current.setActiveObject(cloned);
            fabricCanvas.current.renderAll();
            syncLayers(fabricCanvas.current);
        });
    };


    const handleFontChange = async (e) => {
        const fontFamily = e.target.value;
        try {
            await loadGoogleFont(fontFamily);
            await waitForFont(fontFamily);
            selectedObject.set({ fontFamily });
            fabricCanvas.current.requestRenderAll();
        } catch (error) {
            console.error("Failed to load font in toolbar:", error);
        }
    };

    const handleColorChange = (e) => {
        const color = e.target.value;
        selectedObject.set({ fill: color });
        fabricCanvas.current.requestRenderAll();
        // saveHistory is caught by object:modified in CanvasArea
    };

    const handleFontSizeChange = (e) => {
        const value = e.target.value;
        const newSize = parseInt(value, 10);
        if (isNaN(newSize)) return;
        const clamped = Math.max(8, Math.min(200, newSize));
        selectedObject.set({ fontSize: clamped });
        fabricCanvas.current.requestRenderAll();
        saveHistory(fabricCanvas.current);
    };

    const adjustFontSize = (delta) => {
        const currentSize = selectedObject.fontSize || 32;
        const newSize = Math.max(8, Math.min(200, currentSize + delta));
        selectedObject.set({ fontSize: newSize });
        fabricCanvas.current.requestRenderAll();
        saveHistory(fabricCanvas.current);
    };


    const handleRotationChange = (delta) => {
        if (!selectedObject) return;
        const currentAngle = selectedObject.angle || 0;
        selectedObject.rotate((currentAngle + delta) % 360);
        fabricCanvas.current.requestRenderAll();
        saveHistory(fabricCanvas.current);
    };

    const handleCenter = () => {
        if (!fabricCanvas.current || !selectedObject) return;
        fabricCanvas.current.centerObject(selectedObject);
        selectedObject.setCoords();
        fabricCanvas.current.requestRenderAll();
        saveHistory(fabricCanvas.current);
    };

    return (
        <>
            {/* DESKTOP: Floating toolbar chip — unchanged */}
            <div className="hidden md:flex absolute top-6 left-1/2 -translate-x-1/2 items-center bg-white/55 backdrop-blur-2xl border border-black/5 rounded-2xl px-6 py-2.5 gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-40 animate-slideUp mt-7">
                {canHaveColor && (
                    <>
                        {selectedObject.type === "textbox" && (
                            <div className="flex items-center border-r border-black/10 pr-4 mr-1 gap-2">
                                <select
                                    className="bg-transparent text-[10px] font-black text-[#0A0A0A] outline-none cursor-pointer font-primary uppercase tracking-widest"
                                    value={selectedObject.fontFamily}
                                    onChange={handleFontChange}
                                >
                                    {fonts.map(f => (
                                        <option key={f.value} value={f.value} className="bg-white text-black font-black uppercase">
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="h-4 w-px bg-black/10 mx-1" />
                                <div className="flex items-center bg-black/5 rounded-lg overflow-hidden h-7 border border-black/5">
                                    <button onClick={() => adjustFontSize(-2)} className="px-2 hover:bg-black/10 text-[10px] font-black leading-none">-</button>
                                    <input
                                        type="number"
                                        value={Math.round(selectedObject.fontSize || 32)}
                                        onChange={handleFontSizeChange}
                                        className="w-8 text-[10px] bg-transparent text-center font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button onClick={() => adjustFontSize(2)} className="px-2 hover:bg-black/10 text-[10px] font-black leading-none">+</button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 border-r border-black/10 pr-4 shrink-0">
                            <input
                                type="color"
                                className="w-6 h-6 bg-transparent border-none cursor-pointer rounded-full overflow-hidden shrink-0 shadow-sm"
                                value={selectedObject.fill?.length === 4 ? selectedObject.fill.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : selectedObject.fill}
                                onChange={handleColorChange}
                            />
                            <span className="text-[9px] uppercase font-black text-[#0A0A0A] tracking-widest font-primary">Color</span>
                        </div>
                    </>
                )}


                {/* Rotation Stepper */}
                <div className="flex items-center gap-1 border-r border-black/10 pr-4 shrink-0">
                    <button onClick={() => handleRotationChange(-45)} className="p-2 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-black/5 rounded-lg transition-colors" title="Rotate -45°">
                        <FiRotateCcw size={14} className="rotate-45" />
                    </button>
                    <button onClick={() => handleRotationChange(45)} className="p-2 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-black/5 rounded-lg transition-colors" title="Rotate 45°">
                        <FiRotateCw size={14} className="-rotate-45" />
                    </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={handleCenter} className="p-2.5 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-[#d4c4b1]/20 rounded-xl transition-all" title="Center">
                        <FiAlignCenter size={16} />
                    </button>
                    <button onClick={handleDuplicate} className="p-2.5 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-[#d4c4b1]/20 rounded-xl transition-all" title="Duplicate">
                        <FiCopy size={16} />
                    </button>
                    <button onClick={handleDelete} className="p-2.5 text-[#4A4A4A] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                        <FiTrash2 size={16} />
                    </button>
                </div>
            </div>

            {/* MOBILE: Sticky action bar sitting below the main header */}
            <div className={`md:hidden sticky top-0 left-0 right-0 z-[60] bg-white border-b border-black/10 px-3 py-2 flex flex-col gap-2 animate-slideDown shadow-sm shrink-0`}>

                {/* PRIMARY CONTROL ROW (Font/Size or Opacity for Graphics) */}
                <div className="flex items-center justify-between border-b border-black/5 pb-2">
                    {selectedObject.type === "textbox" ? (
                        <>
                            <select
                                className="bg-transparent text-[10px] font-black text-[#0A0A0A] outline-none cursor-pointer font-primary uppercase tracking-tight max-w-[100px]"
                                value={selectedObject.fontFamily}
                                onChange={handleFontChange}
                            >
                                {fonts.map(f => (
                                    <option key={f.value} value={f.value} className="bg-white text-black">{f.label}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center bg-black/5 rounded-lg overflow-hidden h-7 border border-black/5">
                                    <button onClick={() => adjustFontSize(-2)} className="px-2 font-black text-xs active:bg-black/10 transition-colors">-</button>
                                    <input
                                        type="number"
                                        value={Math.round(selectedObject.fontSize || 32)}
                                        onChange={handleFontSizeChange}
                                        className="w-7 text-[9px] bg-transparent text-center font-black outline-none"
                                    />
                                    <button onClick={() => adjustFontSize(2)} className="px-2 font-black text-xs active:bg-black/10 transition-colors">+</button>
                                </div>
                                <div className="flex items-center pl-1.5 border-l border-black/10">
                                    <input
                                        type="color"
                                        className="w-5 h-5 bg-transparent border-none cursor-pointer rounded-full overflow-hidden shrink-0"
                                        value={selectedObject.fill?.length === 4 ? selectedObject.fill.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : selectedObject.fill}
                                        onChange={handleColorChange}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                {canHaveColor && (
                                    <input
                                        type="color"
                                        className="w-6 h-6 bg-transparent border-none cursor-pointer rounded-full overflow-hidden shrink-0 shadow-sm"
                                        value={selectedObject.fill?.length === 4 ? selectedObject.fill.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : selectedObject.fill}
                                        onChange={handleColorChange}
                                    />
                                )}
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">{selectedObject.type}</span>
                            </div>

                        </div>
                    )}
                </div>

                {/* SECONDARY UTILITY ROW */}
                <div className="flex items-center w-full justify-between">
                    {/* Rotation Stepper (Mobile) */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => handleRotationChange(-45)} className="p-1.5 text-[#4A4A4A] rounded-lg active:bg-black/5">
                            <FiRotateCcw size={14} className="rotate-45" />
                        </button>
                        <button onClick={() => handleRotationChange(45)} className="p-1.5 text-[#4A4A4A] rounded-lg active:bg-black/5">
                            <FiRotateCw size={14} className="-rotate-45" />
                        </button>
                    </div>

                    {/* Shared Actions */}
                    <div className="flex items-center gap-0.5 ml-auto">
                        <button onClick={handleCenter} className="p-2 text-[#4A4A4A] rounded-xl active:bg-black/5" title="Center">
                            <FiAlignCenter size={16} />
                        </button>
                        <button onClick={handleDuplicate} className="p-2 text-[#4A4A4A] rounded-xl active:bg-black/5" title="Duplicate">
                            <FiCopy size={16} />
                        </button>
                        <button onClick={handleDelete} className="p-2 text-[#4A4A4A] hover:text-red-600 rounded-xl active:bg-red-50" title="Delete">
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
