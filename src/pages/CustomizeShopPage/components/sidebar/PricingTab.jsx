import { useFabric } from "../../../../context/FabricContext";
import { FiCheck } from "react-icons/fi";

export default function PricingTab() {
    const { printingType, setPrintingType, printingMethods } = useFabric();

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0A0A0A]">
                    Printing Method
                </h3>
                <p className="text-[9px] text-[#4A4A4A] uppercase tracking-widest leading-relaxed font-black">
                    Choose the printing technique for your design. Each has unique characteristics and pricing.
                </p>
            </div>

            <div className="space-y-3">
                {printingMethods?.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setPrintingType(type.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group shadow-sm ${printingType === type.id
                            ? "bg-[#d4c4b1]/10 border-[#d4c4b1]/30"
                            : "bg-white border-black/5 hover:border-black/10"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${printingType === type.id ? "text-[#0A0A0A]" : "text-[#4A4A4A]"
                                }`}>
                                {type.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-impact text-[#0A0A0A] tracking-tight">
                                    +₹{type.price}
                                </span>
                                {printingType === type.id && (
                                    <div className="w-5 h-5 rounded-full bg-[#d4c4b1] flex items-center justify-center text-black">
                                        <FiCheck size={12} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-[9px] text-[#4A4A4A] uppercase tracking-widest leading-relaxed font-bold">
                            {type.description}
                        </p>
                    </button>
                ))}
            </div>

            <div className="p-6 border border-black/5 rounded-2xl bg-[#f4f2ee]">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-[#0A0A0A] mb-3">Estimated Quality</h4>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`h-1 flex-1 rounded-full ${s <= (printingType === 'embroidery' ? 5 : 4) ? "bg-[#d4c4b1]" : "bg-black/10"
                            }`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
