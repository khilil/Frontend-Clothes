export default function FabricColorPicker() {
    const colors = ["white", "black", "#2d3a3a", "#d4c4b1"];

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-70">
                    04. Fabric Color
                </h4>
                <div className="h-px flex-1 bg-white/5 ml-4"></div>
            </div>

            <div className="flex gap-4">
                {colors.map(color => (
                    <button
                        key={color}
                        className="group relative w-12 h-12 rounded-full border border-white/10 p-1 hover:border-[#d4c4b1]/50 transition-all duration-300"
                    >
                        <div
                            className="w-full h-full rounded-full border border-white/5 shadow-inner transition-transform group-hover:scale-90 duration-300"
                            style={{ backgroundColor: color }}
                        />
                        {/* Subtle inner glow for black color */}
                        {color === 'black' && <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />}
                    </button>
                ))}
            </div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest text-center mt-2">
                Premium Fabric Selection
            </p>
        </section>
    );
}
