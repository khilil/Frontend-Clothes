import { useState, useEffect } from "react";
import { useFabric } from "../../../context/FabricContext";
import {
    resetRotation,
    flipHorizontal,
    rotateObject,
    scaleObject,
} from "../fabric/Trans Form Actions/transformActions";

export default function TransformControls() {
    const { fabricCanvas, activeObjectRef } = useFabric();

    const [scale, setScale] = useState(100);
    const [rotation, setRotation] = useState(0);

    const hasObject = !!activeObjectRef.current;

    // 🔁 Sync UI when object changes
    useEffect(() => {
        if (!activeObjectRef.current) return;

        const obj = activeObjectRef.current;
        setScale(Math.round(obj.scaleX * 100));
        setRotation(Math.round(obj.angle || 0));
    }, [activeObjectRef.current]);

    const disabledUI = !hasObject
        ? "opacity-40 pointer-events-none"
        : "opacity-100";

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-70">
                    02. Transform Controls
                </h4>
                <div className="h-px flex-1 bg-white/5 ml-4"></div>
            </div>

            {/* ICON ACTIONS */}
            <div className={`grid grid-cols-4 gap-2 ${disabledUI} transition-opacity duration-300`}>
                <button
                    onClick={() => flipHorizontal(fabricCanvas.current, activeObjectRef.current)}
                    className="h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group"
                    title="Flip Horizontal"
                >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">flip</span>
                </button>

                <button
                    onClick={() => resetRotation(fabricCanvas.current, activeObjectRef.current)}
                    className="h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group"
                    title="Reset Rotation"
                >
                    <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">sync</span>
                </button>

                <button
                    onClick={() => rotateObject(fabricCanvas.current, activeObjectRef.current, 90)}
                    className="h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group"
                    title="Rotate 90°"
                >
                    <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">rotate_right</span>
                </button>

                <button className="h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 cursor-not-allowed">
                    <span className="material-symbols-outlined">lock</span>
                </button>
            </div>

            {/* SLIDERS */}
            <div className={`space-y-6 pt-2 ${disabledUI} transition-opacity duration-300`}>
                {/* SCALE */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                            Scale Factor
                        </span>
                        <span className="text-[10px] font-mono text-[#d4c4b1] bg-[#d4c4b1]/10 px-2 py-0.5 rounded">
                            {scale}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="300"
                        value={scale}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setScale(value);
                            scaleObject(fabricCanvas.current, activeObjectRef.current, value / 100);
                        }}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#d4c4b1] hover:bg-white/20 transition-colors"
                    />
                </div>

                {/* ROTATION */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                            Rotation Angle
                        </span>
                        <span className="text-[10px] font-mono text-[#d4c4b1] bg-[#d4c4b1]/10 px-2 py-0.5 rounded">
                            {rotation}°
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-180"
                        max="180"
                        value={rotation}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setRotation(value);
                            rotateObject(fabricCanvas.current, activeObjectRef.current, value);
                        }}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#d4c4b1] hover:bg-white/20 transition-colors"
                    />
                </div>
            </div>

            {!hasObject && (
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                    <span className="material-symbols-outlined text-white/20 text-lg">info</span>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                        Select an element on the canvas to enable transformation controls
                    </p>
                </div>
            )}
        </section>
    );
}
