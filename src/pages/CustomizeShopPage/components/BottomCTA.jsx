import { useFabric } from "../../../context/FabricContext";

export default function BottomCTA() {
    const { printingType, productDataRef, customizationPrice, printingMethods } = useFabric();

    // Find selected printing type to get its price
    const currentType = printingMethods?.find(t => t.id === printingType);
    const basePrice = productDataRef.current?.price || 1700; // Updated default for ₹
    const totalPrice = basePrice + customizationPrice;

    const handlePreview = () => {
        // Logic to open preview modal
        window.dispatchEvent(new CustomEvent('open-design-preview'));
    };

    return (
        <div className="mt-0 md:mt-12 pt-1 md:pt-12 space-y-3 md:space-y-6">
            <div className="flex justify-between items-center md:items-end gap-4">
                <div className="space-y-0.5 md:space-y-1">
                    <span className="uppercase text-[8px] md:text-[9px] font-black tracking-[0.2em] text-[#0A0A0A] block">Total</span>
                    <span className="text-[8px] md:text-[10px] text-[#4A4A4A] uppercase tracking-[0.18em] md:tracking-widest font-black">
                        {currentType?.label || "Standard"} Included
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-2xl md:text-3xl font-impact text-[#0A0A0A] tracking-tight">
                        ₹{totalPrice.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <button
                    onClick={handlePreview}
                    className="h-12 md:h-16 border border-black/10 rounded-xl flex items-center justify-center gap-3 hover:bg-black/5 active:scale-[0.99] transition-all group bg-white"
                >
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white group-hover:px-4 group-hover:py-2 group-hover:rounded-lg transition-all duration-300">
                        Preview
                    </span>
                </button>

                {/* <button className="group relative h-12 md:h-16 bg-white overflow-hidden rounded-xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <div className="absolute inset-0 bg-[#d4c4b1] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 text-black font-black uppercase tracking-[0.4em] text-[10px] md:text-[11px]">
                        Add to Bag
                    </span>
                </button> */}
            </div>

            <p className="text-[8px] text-black/20 uppercase tracking-[0.24em] md:tracking-[0.3em] text-center font-medium">
                3-5 Days Processing for Custom Orders
            </p>
        </div>
    );
}
