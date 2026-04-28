import React from 'react';

const CustomizationModal = ({ isOpen, onClose, onContinue }) => {

    if (!isOpen) return null;

    const options = [
        {
            id: "DTF",
            title: "DTF Printing",
            subtitle: "High-detail, vibrant",
            image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=400"
        },
        {
            id: "PUFF",
            title: "PUFF Printing",
            subtitle: "Raised 3D texture",
            image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400"
        },
        {
            id: "EMB",
            title: "Embroidery",
            subtitle: "Premium stitched thread",
            image: "https://images.unsplash.com/photo-1613537446522-099712574eb7?auto=format&fit=crop&q=80&w=400"
        }
    ];

    const handleSelect = (methodId) => {
        console.log("Selected Printing Method:", methodId);

        if (onContinue) {
            onContinue(methodId);  // 🔥 direct navigate
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="glass-modal w-full max-w-4xl rounded-[16px] overflow-hidden flex flex-col shadow-2xl bg-[#121212]/85 border border-white/10">

                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] mb-2 block">
                            Personalization
                        </span>
                        <h2 className="text-3xl font-[Oswald] tracking-tighter uppercase text-white">
                            Choose Your Printing Method
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Options */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className="group relative flex flex-col text-left rounded-xl overflow-hidden transition-all duration-300 border border-white/10 bg-white/5 hover:border-[#C5A059] hover:scale-[1.02]"
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img loading="lazy" 
                                    alt={option.title}
                                    src={option.image}
                                    className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0"
                                />
                            </div>

                            <div className="p-5">
                                <h4 className="text-[11px] font-black uppercase tracking-widest mb-1 text-white/60 group-hover:text-white transition-colors">
                                    {option.title}
                                </h4>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight">
                                    {option.subtitle}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default CustomizationModal;
