import { useEffect, useState } from "react";
import { useFabric } from "../../../context/FabricContext";
import { Reorder, useDragControls } from "framer-motion"; // 🔥 install: npm install framer-motion
import { FiEye, FiEyeOff, FiLock, FiUnlock, FiTrash2, FiMenu } from "react-icons/fi";

export default function LayersPanel() {
    const { fabricCanvas, activeTextRef } = useFabric();
    const [layers, setLayers] = useState([]);

    // 🔄 Sync layers from canvas
    useEffect(() => {
        const canvas = fabricCanvas.current;
        if (!canvas) return;

        const updateLayers = () => {
            const objects = canvas.getObjects();
            // Filter out base layer and reverse for visual order (top-most first)
            const editableLayers = objects
                .filter(o => o.layerType !== "base" && !o.excludeFromExport)
                .reverse();
            setLayers(editableLayers);
        };

        updateLayers();

        canvas.on("object:added", updateLayers);
        canvas.on("object:removed", updateLayers);
        canvas.on("object:modified", updateLayers);
        canvas.on("selection:created", updateLayers);
        canvas.on("selection:updated", updateLayers);
        canvas.on("selection:cleared", updateLayers);

        return () => {
            canvas.off("object:added", updateLayers);
            canvas.off("object:removed", updateLayers);
            canvas.off("object:modified", updateLayers);
            canvas.off("selection:created", updateLayers);
            canvas.off("selection:updated", updateLayers);
            canvas.off("selection:cleared", updateLayers);
        };
    }, [fabricCanvas]);

    // 🎯 Select layer
    const selectLayer = (obj) => {
        const canvas = fabricCanvas.current;
        if (!canvas || !obj.selectable) return;

        canvas.setActiveObject(obj);
        activeTextRef.current = obj.type === "textbox" ? obj : null;
        canvas.requestRenderAll();
    };

    // 👁 Toggle visibility
    const toggleVisibility = (obj) => {
        obj.visible = !obj.visible;
        fabricCanvas.current.requestRenderAll();
        setLayers([...layers]);
    };

    // 🔒 Toggle lock
    const toggleLock = (obj) => {
        obj.selectable = !obj.selectable;
        obj.evented = obj.selectable;
        fabricCanvas.current.discardActiveObject();
        fabricCanvas.current.requestRenderAll();
        setLayers([...layers]);
    };

    // 🗑 Delete layer
    const deleteLayer = (obj) => {
        fabricCanvas.current.remove(obj);
        fabricCanvas.current.requestRenderAll();
    };

    // 📦 Handle Reorder (UI Only - No Lag)
    const handleReorder = (newOrder) => {
        setLayers(newOrder);
    };

    // 🔄 Sync Fabric Canvas Order (Only on Drag End)
    const syncCanvasOrder = () => {
        const canvas = fabricCanvas.current;
        if (!canvas) return;

        // Base layer is at index 0. 
        // Our layers array is [top, ..., bottom]
        // We need to move them to indices [n, ..., 1]
        const totalEditable = layers.length;
        layers.forEach((obj, idx) => {
            const newPos = totalEditable - idx;
            canvas.moveObjectTo(obj, newPos);
        });

        canvas.requestRenderAll();
    };

    function getLayerLabel(obj) {
        if (obj.type === "textbox") return "Text";
        if (obj.type === "image") return "Image";
        if (obj.type === "rect" || obj.type === "circle" || obj.type === "triangle")
            return "Shape";
        return "Graphics";
    }

    function renderIcon(obj) {
        if (obj.type === "image") {
            return (
                <img loading="lazy" 
                    src={obj._originalElement?.src}
                    alt=""
                    className="w-8 h-8 object-cover border border-white/10"
                />
            );
        }

        if (obj.type === "textbox") {
            return <span className="text-[12px] font-bold text-white/50 italic">Abc</span>;
        }

        return <div className="w-4 h-4 rounded-sm border-2 border-white/20" />;
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-70">
                    03. Layers
                </h4>
                <div className="h-px flex-1 bg-white/5 ml-4"></div>
            </div>

            <Reorder.Group
                axis="y"
                values={layers}
                onReorder={handleReorder}
                className="space-y-3"
            >
                {layers.length === 0 ? (
                    <p className="text-[9px] text-white/20 italic text-center py-4 uppercase tracking-widest">
                        No elements on canvas
                    </p>
                ) : (
                    layers.map((obj, index) => {
                        const isActive = fabricCanvas.current?.getActiveObject() === obj;

                        return (
                            <Reorder.Item
                                key={obj.id}
                                value={obj}
                                onDragEnd={syncCanvasOrder}
                                onClick={() => selectLayer(obj)}
                                className={`group relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing
                                    ${isActive
                                        ? "bg-white/10 border-[#d4c4b1]/50 shadow-[0_0_20px_rgba(212,196,177,0.1)]"
                                        : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
                                    }
                                    ${!obj.visible ? "opacity-30" : "opacity-100"}
                                `}
                            >
                                {/* Drag Handle */}
                                <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                                    <FiMenu size={14} />
                                </div>

                                {/* Icon Display */}
                                <div className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                                    {renderIcon(obj)}
                                </div>

                                {/* Label & Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[10px] font-black uppercase tracking-widest truncate ${isActive ? 'text-[#d4c4b1]' : 'text-white/70'}`}>
                                        {obj.name || getLayerLabel(obj)}
                                    </p>
                                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] mt-0.5">
                                        Layer {layers.length - index}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleVisibility(obj);
                                        }}
                                        className={`p-2 rounded-lg transition-colors hover:bg-white/10 ${obj.visible ? 'text-white/60' : 'text-[#d4c4b1]'}`}
                                    >
                                        {obj.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLock(obj);
                                        }}
                                        className={`p-2 rounded-lg transition-colors hover:bg-white/10 
                                            ${obj.selectable ? 'text-white/30' : 'text-[#d4c4b1]'}`}
                                    >
                                        {obj.selectable ? <FiUnlock size={14} /> : <FiLock size={14} />}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteLayer(obj);
                                        }}
                                        className={`p-2 rounded-lg transition-colors hover:bg-red-500/10 text-white/20 hover:text-red-400`}
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </Reorder.Item>
                        );
                    })
                )}
            </Reorder.Group>
        </section>
    );
}
