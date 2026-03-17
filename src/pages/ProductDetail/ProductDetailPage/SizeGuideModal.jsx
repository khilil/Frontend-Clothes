import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SizeGuideModal = ({ isOpen, onClose, garmentType = 'top' }) => {
    const [activeTab, setActiveTab] = React.useState(garmentType);

    React.useEffect(() => {
        const lockScroll = () => {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            document.documentElement.style.overflow = 'hidden';
            
            // Handle Lenis scroll lock
            if (window.lenis) {
                window.lenis.stop();
            }
        };

        const unlockScroll = () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.documentElement.style.overflow = '';
            
            // Handle Lenis scroll unlock
            if (window.lenis) {
                window.lenis.start();
            }
        };

        if (isOpen) {
            setActiveTab(garmentType);
            lockScroll();
        } else {
            unlockScroll();
        }

        return () => {
            unlockScroll();
        };
    }, [isOpen, garmentType]);

    const topwareSizes = [
        { size: 'S', chest: '38', length: '27', shoulder: '17' },
        { size: 'M', chest: '40', length: '28', shoulder: '18' },
        { size: 'L', chest: '42', length: '29', shoulder: '19' },
        { size: 'XL', chest: '44', length: '30', shoulder: '20' },
        { size: 'XXL', chest: '46', length: '31', shoulder: '21' },
    ];

    const bottomwareSizes = [
        { size: '30', waist: '31', hip: '38', length: '40' },
        { size: '32', waist: '33', hip: '40', length: '41' },
        { size: '34', waist: '35', hip: '42', length: '42' },
        { size: '36', waist: '37', hip: '44', length: '42' },
        { size: '38', waist: '39', hip: '46', length: '43' },
    ];

    const howToMeasure = {
        top: [
            { label: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
            { label: 'Length', desc: 'Measure from the highest point of the shoulder down to the hem.' },
            { label: 'Shoulder', desc: 'Measure from one shoulder tip to the other across the back.' },
        ],
        bottom: [
            { label: 'Waist', desc: 'Measure around your natural waistline, keeping the tape a bit loose.' },
            { label: 'Hips', desc: 'Measure around the fullest part of your hips.' },
            { label: 'Length', desc: 'Measure from the waist down to the ankle.' },
        ]
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm touch-none"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] overscroll-contain"
                    >
                        {/* Header */}
                        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-white/5">
                            <div>
                                <h2 className="text-3xl font-impact uppercase tracking-tight text-white mb-1">Sizing Guide</h2>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Find your perfect fit (All measurements in inches)</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors group"
                            >
                                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors">close</span>
                            </button>
                        </div>



                        {/* Body */}
                        <div 
                            data-lenis-prevent
                            className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide"
                        >
                            {/* Table */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent/80 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                                    Size Chart
                                </h3>
                                <div className="rounded-2xl border border-white/5 overflow-hidden">
                                    <table className="w-full text-left bg-white/[0.02]">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/5">
                                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Size</th>
                                                {activeTab === 'top' ? (
                                                    <>
                                                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Chest</th>
                                                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Length</th>
                                                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Shoulder</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Waist</th>
                                                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Hips</th>
                                                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Length</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(activeTab === 'top' ? topwareSizes : bottomwareSizes).map((item, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.05] transition-colors group">
                                                    <td className="px-4 py-4 text-sm font-impact text-white text-center group-hover:text-accent transition-colors">{item.size}</td>
                                                    {activeTab === 'top' ? (
                                                        <>
                                                            <td className="px-4 py-4 text-sm font-bold text-white/70">{item.chest}"</td>
                                                            <td className="px-4 py-4 text-sm font-bold text-white/70">{item.length}"</td>
                                                            <td className="px-4 py-4 text-sm font-bold text-white/70">{item.shoulder}"</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-4 py-4 text-sm font-bold text-white/70">{item.waist}"</td>
                                                            <td className="px-4 py-4 text-sm font-bold text-white/70">{item.hip}"</td>
                                                            <td className="px-4 py-4 text-sm font-bold text-white/70">{item.length}"</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* How to Measure */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent/80 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                                    How to Measure
                                </h3>
                                <div className="grid gap-3">
                                    {howToMeasure[activeTab].map((item, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">{item.label}</h4>
                                            <p className="text-[10px] text-white/40 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                                <p className="text-[9px] text-accent/60 font-medium leading-relaxed italic text-center uppercase tracking-widest">
                                    * Fits may vary by style or personal preference. All garments are measured manually.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SizeGuideModal;
