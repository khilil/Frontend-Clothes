import { useFabric } from "../../../../context/FabricContext";
import { FiEye, FiEyeOff, FiTrash2, FiLock, FiUnlock, FiMove } from "react-icons/fi";
import { Reorder } from "framer-motion";
import { useEffect, useState } from "react";

export default function LayersTab() {
    const { fabricCanvas, layersRef, syncLayers, saveHistory } = useFabric();
    const [items, setItems] = useState([]);

    // Sync local items with layersRef whenever layers change (but not during drag)
    useEffect(() => {
        // We reverse it for UI (top layer first)
        setItems([...layersRef.current].reverse());
    }, [layersRef.current]);

    const handleReorder = (newOrder) => {
        setItems(newOrder);

        if (!fabricCanvas.current) return;

        // Map UI order back to Fabric stack order
        // UI order: [top, ..., bottom]
        // Fabric order: [bottom, ..., top]
        const reversed = [...newOrder].reverse();

        // Find base image index (usually 0)
        const baseImg = fabricCanvas.current.getObjects().find(o => o.excludeFromExport);
        let baseOffset = baseImg ? 1 : 0;

        reversed.forEach((obj, idx) => {
            // Move object to the correct index in the stack
            // index 0 is base image, so design elements start at baseOffset
            fabricCanvas.current.moveObjectTo(obj, idx + baseOffset);
        });

        fabricCanvas.current.renderAll();
        syncLayers(fabricCanvas.current);
        saveHistory(fabricCanvas.current);
    };

    const handleToggleVisibility = (obj) => {
        obj.set({ visible: !obj.visible });
        fabricCanvas.current.renderAll();
        syncLayers(fabricCanvas.current);
        saveHistory(fabricCanvas.current);
    };

    const handleToggleLock = (obj) => {
        const isLocked = obj.lockMovementX;
        obj.set({
            lockMovementX: !isLocked,
            lockMovementY: !isLocked,
            lockScalingX: !isLocked,
            lockScalingY: !isLocked,
            lockRotation: !isLocked,
            hasControls: isLocked,
        });
        fabricCanvas.current.renderAll();
        syncLayers(fabricCanvas.current);
        saveHistory(fabricCanvas.current);
    };

    const handleDelete = (obj) => {
        fabricCanvas.current.remove(obj);
        fabricCanvas.current.renderAll();
        syncLayers(fabricCanvas.current);
    };

    return (
        <div className="space-y-6 animate-slideUp">
            <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-50">
                    Canvas Layers
                </h3>
                <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                    Drag to reorder elements and manage visibility.
                </p>
            </div>

            <Reorder.Group
                axis="y"
                values={items}
                onReorder={handleReorder}
                className="space-y-2"
            >
                {items.map((obj) => (
                    <Reorder.Item
                        key={obj.id || Math.random()}
                        value={obj}
                        className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-[#d4c4b1]/30 transition-all cursor-grab active:cursor-grabbing"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                                {obj.type === 'textbox' ? (
                                    <span className="text-[10px] font-black text-[#d4c4b1]">Aa</span>
                                ) : (
                                    <FiMove size={14} className="text-[#d4c4b1]" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                    {obj.type === 'textbox' ? 'Text' : 'Graphic'}
                                </span>
                                <span className="text-[8px] font-medium uppercase tracking-widest text-white/20">
                                    Layer ID: {obj.id?.slice(4, 12)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleToggleVisibility(obj)}
                                className={`p-2 rounded-lg transition-colors ${!obj.visible ? 'text-[#d4c4b1]' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                            >
                                {obj.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                            </button>
                            <button
                                onClick={() => handleToggleLock(obj)}
                                className={`p-2 rounded-lg transition-colors ${obj.lockMovementX ? 'text-[#d4c4b1]' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                            >
                                {obj.lockMovementX ? <FiLock size={14} /> : <FiUnlock size={14} />}
                            </button>
                            <button
                                onClick={() => handleDelete(obj)}
                                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    </Reorder.Item>
                ))}

                {items.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/5 rounded-3xl">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                            <FiMove size={24} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                            No Layers Created
                        </span>
                    </div>
                )}
            </Reorder.Group>
        </div>
    );
}
