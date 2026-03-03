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

    const isText = selectedObject.type === "textbox";

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
        <div className="absolute bottom-4 md:bottom-auto md:top-4 left-1/2 -translate-x-1/2 flex items-center bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-full px-3 md:px-4 py-2 gap-2 md:gap-3 shadow-2xl z-40 animate-slideUp max-w-[95vw] overflow-x-auto no-scrollbar">

            {/* TEXT SPECIFIC CONTROLS */}
            {isText && (
                <>
                    <select
                        className="bg-transparent text-[10px] font-bold text-white outline-none cursor-pointer border-r border-white/10 pr-2 md:pr-3 mr-1 max-w-[80px] md:max-w-none"
                        value={selectedObject.fontFamily}
                        onChange={handleFontChange}
                    >
                        {fonts.map(f => (
                            <option key={f.value} value={f.value} className="bg-[#1a1a1a]">
                                {f.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-1.5 md:gap-2 border-r border-white/10 pr-2 md:pr-3 shrink-0">
                        <input
                            type="color"
                            className="w-5 h-5 md:w-6 md:h-6 bg-transparent border-none cursor-pointer rounded-full overflow-hidden shrink-0"
                            value={selectedObject.fill?.length === 4 ? selectedObject.fill.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : selectedObject.fill}
                            onChange={handleColorChange}
                        />
                        <span className="hidden md:block text-[10px] uppercase font-black text-white/40">Color</span>
                    </div>
                </>
            )}

            {/* LAYER CONTROLS */}
            <div className="flex items-center gap-0.5 md:gap-1 border-r border-white/10 pr-2 md:pr-3 shrink-0">
                <button
                    onClick={handleMoveToFront}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    title="Bring to Front"
                >
                    <FiChevronUp size={18} className="md:size-[16px]" />
                </button>
                <button
                    onClick={handleMoveToBack}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    title="Send to Back"
                >
                    <FiChevronDown size={18} className="md:size-[16px]" />
                </button>
            </div>

            <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
                <button
                    onClick={handleCenter}
                    className="p-2 text-white/40 hover:text-[#d4c4b1] hover:bg-[#d4c4b1]/10 rounded-lg transition-colors"
                    title="Center Selection"
                >
                    <FiAlignCenter size={18} className="md:size-[16px]" />
                </button>
                <button
                    onClick={handleDuplicate}
                    className="p-2 text-white/40 hover:text-[#d4c4b1] hover:bg-[#d4c4b1]/10 rounded-lg transition-colors"
                    title="Duplicate"
                >
                    <FiCopy size={18} className="md:size-[16px]" />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete"
                >
                    <FiTrash2 size={18} className="md:size-[16px]" />
                </button>
            </div>
        </div>
    );
}
