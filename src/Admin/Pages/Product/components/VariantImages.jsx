import React, { useState } from 'react';
import {
    UploadCloud,
    Trash2,
    Star,
    GripVertical,
    Image as ImageIcon,
    Layout
} from 'lucide-react';

const VariantImages = ({ variants, onAddImage, onDeleteImage, onSetPrimary, availableSizes, availableColors }) => {
    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || null);

    // If variants were deleted and selected is gone, pick another
    if (selectedVariantId && !variants.find(v => v.id === selectedVariantId)) {
        if (variants.length > 0) setSelectedVariantId(variants[0].id);
    } else if (!selectedVariantId && variants.length > 0) {
        setSelectedVariantId(variants[0].id);
    }

    const activeVariant = variants.find(v => v.id === selectedVariantId);

    const getVariantDetails = (v) => {
        const sizeObj = (availableSizes || []).find(s => s._id === v.size);
        const colorObj = (availableColors || []).find(c => c._id === v.color);
        return {
            sizeName: sizeObj?.name || 'Size',
            colorName: colorObj?.name || 'Color',
            colorHex: colorObj?.hexCode || '#475569'
        };
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl ring-1 ring-white/5">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Variant images</h2>
                        <p className="text-sm text-slate-400">Manage unique images for each product variant.</p>
                    </div>
                </div>
            </div>

            {/* Variant Selector */}
            <div className="no-scrollbar mb-8 overflow-x-auto pb-4">
                <div className="flex gap-3 min-w-max">
                    {variants.map((v) => {
                        const { sizeName, colorName, colorHex } = getVariantDetails(v);
                        return (
                            <button
                                key={v.id}
                                className={`flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-xs font-bold transition-all duration-300 ${selectedVariantId === v.id
                                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/20'
                                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                                    }`}
                                onClick={() => setSelectedVariantId(v.id)}
                            >
                                <span className="h-2 w-2 rounded-full ring-2 ring-white/10" style={{ backgroundColor: colorHex }}></span>
                                {colorName} — {sizeName}
                            </button>
                        );
                    })}
                    {variants.length === 0 && (
                        <div className="rounded-full border border-slate-800 bg-slate-800/30 px-5 py-2 text-xs font-medium text-slate-500">No variants defined yet</div>
                    )}
                </div>
            </div>

            {/* Active Variant Content */}
            {activeVariant ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {(() => {
                        const { sizeName, colorName } = getVariantDetails(activeVariant);
                        return (
                            <div
                                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950 px-12 py-16 text-center transition-all hover:border-indigo-500 hover:bg-indigo-500/5"
                                onClick={() => document.getElementById(`variant-image-${activeVariant.id}`).click()}
                            >
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-indigo-400 ring-1 ring-white/10 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/30">
                                    <UploadCloud size={24} />
                                </div>
                                <h3 className="text-sm font-bold text-white">Upload for {colorName} – {sizeName}</h3>
                                <p className="mt-1 text-xs text-slate-400">Drag & drop or catch and release for instant upload</p>
                                <input
                                    id={`variant-image-${activeVariant.id}`}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) onAddImage(activeVariant.id, e.target.files);
                                        e.target.value = ''; // Reset input
                                    }}
                                />
                            </div>
                        );
                    })()}

                    {activeVariant.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {activeVariant.images.map((img, index) => (
                                <div key={img.id} className={`group relative aspect-square overflow-hidden rounded-xl bg-slate-950 ring-2 transition-all duration-300 ${img.isPrimary ? 'ring-indigo-500 shadow-xl shadow-indigo-500/20' : 'ring-white/5 hover:ring-white/20'}`}>
                                    <div className="h-full w-full">
                                        <img loading="lazy" src={img.url} alt={`Variant ${index}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />

                                        {img.isPrimary && (
                                            <div className="absolute left-3 top-3 z-20 flex h-6 items-center rounded-md bg-indigo-600 px-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">Primary</div>
                                        )}

                                        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-slate-900/60 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                                            <div className="flex justify-between">
                                                <div className="cursor-grab text-white drop-shadow-md hover:text-indigo-400"><GripVertical size={16} /></div>
                                                <button
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                                                    onClick={() => onDeleteImage(activeVariant.id, img.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div>
                                                {!img.isPrimary && (
                                                    <button
                                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-1.5 text-[10px] font-bold text-slate-900 shadow-xl transition-all hover:bg-indigo-600 hover:text-white"
                                                        onClick={() => onSetPrimary(activeVariant.id, img.id)}
                                                    >
                                                        <Star size={12} /> Set Primary
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-700">
                            <ImageIcon size={48} strokeWidth={1} />
                            <p className="mt-4 text-sm font-medium">No images uploaded for this variant</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-700">
                    <Layout size={64} strokeWidth={1} />
                    <p className="mt-6 text-base font-bold text-slate-400">Select a variant to manage its style</p>
                    <p className="mt-1 text-sm">Every color tells a different story.</p>
                </div>
            )}
        </div>
    );
};

export default VariantImages;
