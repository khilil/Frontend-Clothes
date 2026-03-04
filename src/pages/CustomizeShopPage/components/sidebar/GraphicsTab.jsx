import { useFabric } from "../../../../context/FabricContext";
import { addSVGToCanvas } from "../../fabric/Graphic/addSVGGraphic";

// SVG Imports (Same as GraphicsEditorPage)
import api from "../../../../../public/assets/graphics/api.svg";
import calling from "../../../../../public/assets/graphics/calling.svg";
import cloud from "../../../../../public/assets/graphics/cloud.svg";
import jksAura from "../../../../../public/assets/graphics/JK Aura.svg";

import { useEffect, useState, useRef } from "react";
import { getGraphics } from "../../../../services/customizationService";
import { addImageToCanvas } from "../../fabric/Graphic/addImageGraphic";

const GRAPHICS_FALLBACK = [
    { name: "Api", file: api },
    { name: "Calling", file: calling },
    { name: "Cloud", file: cloud },
    { name: "JK Aura", file: jksAura },
];

export default function GraphicsTab() {
    const { fabricCanvas, printAreaRef, uploadedAssetsMetadataRef } = useFabric();
    const [fetchedGraphics, setFetchedGraphics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchRemoteGraphics = async () => {
            setIsLoading(true);
            try {
                const data = await getGraphics();
                setFetchedGraphics(data || []);
            } catch (error) {
                console.error("Failed to fetch graphics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRemoteGraphics();
    }, []);

    const allGraphics = [
        ...GRAPHICS_FALLBACK.map(g => ({ ...g, price: 0 })),
        ...fetchedGraphics.map(g => ({ name: g.name, file: g.url, price: g.price }))
    ];

    const handleGraphicAdd = (graphic) => {
        const { file, price, name } = graphic;

        // Store metadata for production audit
        if (!uploadedAssetsMetadataRef.current[file]) {
            uploadedAssetsMetadataRef.current[file] = {
                width: 5000, // Standard high-res assumption for library items
                height: 5000,
                fileSize: 0,
                type: file.toLowerCase().endsWith('.svg') ? 'image/svg+xml' : 'image/png',
                name: name
            };
        }

        const isSVG = typeof file === 'string' && file.toLowerCase().endsWith('.svg');
        if (isSVG) {
            addSVGToCanvas(fabricCanvas.current, file, printAreaRef.current, price);
        } else {
            addImageToCanvas(fabricCanvas.current, file, printAreaRef.current, price);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadError(null);

        // 1. Format Check
        const validTypes = ['image/png', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            setUploadError("Only professional-grade PNG or SVG files are allowed.");
            return;
        }

        // 2. Size Check (25MB)
        if (file.size > 25 * 1024 * 1024) {
            setUploadError("File size exceeds 25MB limit. Please optimize for faster shipping.");
            return;
        }

        // 3. Resolution Check
        if (file.type === 'image/png') {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                if (img.naturalWidth < 4500 || img.naturalHeight < 5400) {
                    setUploadError(`Low Quality Warning: ${img.naturalWidth}x${img.naturalHeight}px. For pro-level DTF, min 4500x5400px is recommended.`);
                }

                // Store technical metadata for production
                uploadedAssetsMetadataRef.current[objectUrl] = {
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    fileSize: file.size,
                    type: file.type,
                    name: file.name
                };

                handleGraphicAdd(objectUrl, 0);
            };
            img.src = objectUrl;
        } else {
            // SVG - Directly add
            const objectUrl = URL.createObjectURL(file);
            uploadedAssetsMetadataRef.current[objectUrl] = {
                width: 5000, // SVGs are resolution independent, assume high for logic
                height: 5000,
                fileSize: file.size,
                type: file.type,
                name: file.name
            };
            handleGraphicAdd(objectUrl, 0);
        }
    };

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-50">
                    Graphic Elements
                </h3>
                <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                    Premium vector graphics for your custom apparel.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {allGraphics.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleGraphicAdd(item)}
                        className="group relative bg-white/5 aspect-square border border-white/5 flex flex-col items-center justify-center hover:border-[#d4c4b1]/30 hover:bg-[#d4c4b1]/5 transition-all duration-500 rounded-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#d4c4b1]/0 to-[#d4c4b1]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                            src={item.file}
                            alt={item.name}
                            className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500 mb-2"
                        />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-[#d4c4b1] transition-colors">
                            {item.name}
                        </span>
                    </button>
                ))}
            </div>

            {uploadError && (
                <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-400">
                        {uploadError}
                    </p>
                </div>
            )}

            {/* PLACEHOLDER FOR UPLOADS */}
            <div
                className="mt-8 p-6 border-2 border-dashed border-white/[0.03] bg-white/[0.01] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-not-allowed group opacity-50"
            >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/10 group-hover:text-amber-500/40 group-hover:bg-amber-500/5 transition-all">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div className="text-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 block mb-1">
                        Professional Assets Upload
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-amber-500/40">
                        Protocol Coming Soon
                    </span>
                </div>
            </div>
        </div>
    );
}
