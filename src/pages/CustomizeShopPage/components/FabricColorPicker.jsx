import { useFabric } from "../../../context/FabricContext";

export default function FabricColorPicker() {
    const { garmentColor, setGarmentColor } = useFabric();
    const colors = [
        { id: 'white', value: '#F9F6F0', label: 'Bone White' },
        { id: 'black', value: '#1A1A1A', label: 'Charcoal Black' },
        { id: 'olive', value: '#4B5320', label: 'Tactical Olive' },
        { id: 'beige', value: '#D2B48C', label: 'Atelier Sand' },
        { id: 'navy', value: '#000080', label: 'Deep Sea Navy' },
    ];

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0A0A0A]">
                    04. Fabric Color
                </h4>
                <div className="h-px flex-1 bg-black/10 ml-4"></div>
            </div>

            <div className="flex gap-4">
                {colors.map(color => (
                    <button
                        key={color.id}
                        onClick={() => setGarmentColor(color.value)}
                        className={`group relative w-12 h-12 rounded-full border p-1 transition-all duration-300 ${garmentColor === color.value ? "border-[#d4c4b1] scale-110 shadow-lg" : "border-black/10 hover:border-black/30"
                            }`}
                    >
                        <div
                            className="w-full h-full rounded-full border border-black/5 shadow-inner transition-transform group-hover:scale-95 duration-300"
                            style={{ backgroundColor: color.value }}
                        />
                        {/* Subtle inner glow for black color */}
                        {color.id === 'black' && <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />}
                    </button>
                ))}
            </div>
            <p className="text-[9px] text-[#4A4A4A] uppercase tracking-widest text-center mt-2 font-black">
                {colors.find(c => c.value === garmentColor)?.label || "Custom Selection"}
            </p>
        </section>
    );
}
