import { useFabric } from "../../../../context/FabricContext";
import { useState } from "react";
import { FiSquare, FiCircle, FiTriangle, FiStar, FiHexagon } from "react-icons/fi";
import { Rect, Circle, Triangle, Polygon } from "fabric";

export default function ElementsTab() {
    const { fabricCanvas, saveHistory, updatePrice, syncLayers } = useFabric();
    const [selectedColor, setSelectedColor] = useState("#000000");

    const presetColors = [
        "#000000", "#FFFFFF", "#FF3B30", "#FF9500", "#FFCC00", 
        "#4CD964", "#5AC8FA", "#007AFF", "#5856D6", "#AF52DE"
    ];

    const addShape = (shapeType) => {
        const canvas = fabricCanvas.current;
        if (!canvas) return;

        let shape;
        const color = selectedColor;

        if (shapeType === 'square') {
            shape = new Rect({
                left: 100, top: 100, fill: color, width: 100, height: 100
            });
        } else if (shapeType === 'circle') {
            shape = new Circle({
                left: 100, top: 100, fill: color, radius: 50
            });
        } else if (shapeType === 'triangle') {
            shape = new Triangle({
                left: 100, top: 100, fill: color, width: 100, height: 100
            });
        } else if (shapeType === 'hexagon') {
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i * 2 * Math.PI) / 6;
                points.push({ x: 50 * Math.cos(angle), y: 50 * Math.sin(angle) });
            }
            shape = new Polygon(points, { left: 100, top: 100, fill: color });
        } else if (shapeType === 'star') {
            const starPoints = [];
            for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? 50 : 25;
                const angle = (i * Math.PI) / 5;
                starPoints.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
            }
            shape = new Polygon(starPoints, { left: 100, top: 100, fill: color });
        }

        if (shape) {
            canvas.add(shape);
            canvas.centerObject(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
            saveHistory(canvas);
            updatePrice(canvas);
            syncLayers(canvas);
        }
    };

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0A0A0A]">Geometric Library</h3>
                <p className="text-[9px] text-[#4A4A4A] uppercase tracking-widest leading-relaxed font-black">Add architectural shapes to your design.</p>
            </div>

            {/* COLOR SELECTION */}
            <div className="space-y-4 p-5 bg-white border border-black/5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">Fill Color</span>
                    <input 
                        type="color" 
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-6 h-6 rounded-full overflow-hidden border-none bg-transparent cursor-pointer shadow-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {presetColors.map(c => (
                        <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`w-5 h-5 rounded-full border transition-all ${selectedColor === c ? 'border-[#d4c4b1] scale-110 shadow-md' : 'border-black/5 hover:scale-105'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[
                    { id: 'square', icon: FiSquare, label: 'Square' },
                    { id: 'circle', icon: FiCircle, label: 'Circle' },
                    { id: 'triangle', icon: FiTriangle, label: 'Triangle' },
                    { id: 'star', icon: FiStar, label: 'Star' },
                    { id: 'hexagon', icon: FiHexagon, label: 'Hexagon' }
                ].map((s) => (
                    <button key={s.id} onClick={() => addShape(s.id)} className="flex flex-col items-center justify-center p-6 bg-white border border-black/5 rounded-2xl hover:border-[#d4c4b1] transition-all group">
                        <s.icon size={24} className="text-[#0A0A0A] group-hover:scale-110 transition-transform mb-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#4A4A4A] group-hover:text-[#0A0A0A]">{s.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
