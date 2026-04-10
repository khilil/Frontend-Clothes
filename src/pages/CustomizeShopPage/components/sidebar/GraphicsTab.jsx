// SVG Imports removed as per requirement to use database-only graphics

import { useEffect, useState, useRef } from "react";
import { getGraphics } from "../../../../services/customizationService";
import { addImageToCanvas } from "../../fabric/Graphic/addImageGraphic";
import { addSVGToCanvas } from "../../fabric/Graphic/addSVGGraphic";
import { useFabric } from "../../../../context/FabricContext";

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

    const allGraphics = fetchedGraphics.map(g => ({ name: g.name, file: g.url, price: g.price }));

    const handleGraphicAdd = async (graphic) => {
        const normalizedGraphic = typeof graphic === "string"
            ? { file: graphic, price: 0, name: "Uploaded Graphic" }
            : graphic;

        const { file, price, name } = normalizedGraphic;

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
            await addSVGToCanvas(fabricCanvas.current, file, printAreaRef.current, price);
        } else {
            await addImageToCanvas(fabricCanvas.current, file, printAreaRef.current, price);
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

                handleGraphicAdd(objectUrl);
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
            handleGraphicAdd(objectUrl);
        }
    };

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0A0A0A]">
                    Graphic Elements
                </h3>
                <p className="text-[9px] text-[#4A4A4A] uppercase tracking-widest leading-relaxed font-black">
                    Premium vector graphics for your custom apparel.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {allGraphics.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleGraphicAdd(item)}
                        className="group relative bg-white aspect-square border border-black/5 flex flex-col items-center justify-center hover:border-[#d4c4b1]/30 hover:bg-[#d4c4b1]/5 transition-all duration-500 rounded-2xl overflow-hidden shadow-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#d4c4b1]/0 to-[#d4c4b1]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                            src={item.file}
                            alt={item.name}
                            className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500 mb-2 p-2"
                        />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black/20 group-hover:text-[#d4c4b1] transition-colors">
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
                className="mt-8 p-6 border-2 border-dashed border-black/5 bg-black/[0.02] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-not-allowed group opacity-50"
            >
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/10 group-hover:text-[#8b7e6d]/40 group-hover:bg-[#8b7e6d]/5 transition-all">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div className="text-center font-primary">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20 block mb-1">
                        Professional Assets Upload
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]/40">
                        Protocol Coming Soon
                    </span>
                </div>
            </div>
        </div>
    );
}
