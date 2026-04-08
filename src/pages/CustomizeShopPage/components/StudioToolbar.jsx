import { FiTrash2, FiLayers, FiMaximize2, FiMinimize2, FiChevronUp, FiChevronDown, FiCopy, FiAlignCenter } from "react-icons/fi";
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

    const handleMoveToFront = () => {
        selectedObject.bringToFront();
        fabricCanvas.current.renderAll();
    };

    const handleMoveToBack = () => {
        // Base image is at back, so we send to back then bring forward once if base image exists
        selectedObject.sendToBack();
        const baseImg = fabricCanvas.current.getObjects().find(o => o.excludeFromExport);
        if (baseImg) {
            fabricCanvas.current.sendObjectToBack(baseImg);
        }
        fabricCanvas.current.renderAll();
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

    const handleCenter = () => {
        if (!fabricCanvas.current || !selectedObject) return;
        fabricCanvas.current.centerObject(selectedObject);
        selectedObject.setCoords();
        fabricCanvas.current.requestRenderAll();
        saveHistory(fabricCanvas.current);
    };

    return (
        <div className="absolute bottom-4 md:bottom-auto md:top-6 left-1/2 -translate-x-1/2 flex items-center bg-white/40 backdrop-blur-2xl border border-black/5 rounded-2xl px-4 md:px-6 py-2.5 gap-3 md:gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-40 animate-slideUp max-w-[95vw] overflow-x-auto no-scrollbar">

            {/* DYNAMIC CONTROLS */}
            {canHaveColor && (
                <>
                    {selectedObject.type === "textbox" && (
                        <select
                            className="bg-transparent text-[10px] font-black text-[#0A0A0A] outline-none cursor-pointer border-r border-black/10 pr-2 md:pr-4 mr-1 max-w-[80px] md:max-w-none font-primary uppercase tracking-widest"
                            value={selectedObject.fontFamily}
                            onChange={handleFontChange}
                        >
                            {fonts.map(f => (
                                <option key={f.value} value={f.value} className="bg-white text-black font-black uppercase">
                                    {f.label}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="flex items-center gap-1.5 md:gap-3 border-r border-black/10 pr-2 md:pr-4 shrink-0">
                        <input
                            type="color"
                            className="w-5 h-5 md:w-6 md:h-6 bg-transparent border-none cursor-pointer rounded-full overflow-hidden shrink-0 shadow-sm"
                            value={selectedObject.fill?.length === 4 ? selectedObject.fill.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : selectedObject.fill}
                            onChange={handleColorChange}
                        />
                        <span className="hidden md:block text-[9px] uppercase font-black text-[#0A0A0A] tracking-widest font-primary">Color</span>
                    </div>
                </>
            )}

            {/* LAYER CONTROLS */}
            <div className="flex items-center gap-0.5 md:gap-1 border-r border-black/10 pr-2 md:pr-4 shrink-0">
                <button
                    onClick={handleMoveToFront}
                    className="p-2 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-black/5 rounded-lg transition-colors"
                    title="Bring to Front"
                >
                    <FiChevronUp size={16} />
                </button>
                <button
                    onClick={handleMoveToBack}
                    className="p-2 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-black/5 rounded-lg transition-colors"
                    title="Send to Back"
                >
                    <FiChevronDown size={16} />
                </button>
            </div>

            <div className="flex items-center gap-0.5 md:gap-2 shrink-0">
                <button
                    onClick={handleCenter}
                    className="p-2.5 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-[#d4c4b1]/20 rounded-xl transition-all"
                    title="Center Selection"
                >
                    <FiAlignCenter size={16} />
                </button>
                <button
                    onClick={handleDuplicate}
                    className="p-2.5 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-[#d4c4b1]/20 rounded-xl transition-all"
                    title="Duplicate"
                >
                    <FiCopy size={16} />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2.5 text-[#4A4A4A] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
        </div>
    );
}
