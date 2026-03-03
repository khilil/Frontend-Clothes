// PreviewButton.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useFabric } from "../../../../context/FabricContext";
import { FiEye } from "react-icons/fi";

export default function PreviewButton() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { fabricCanvas, frontDesignRef, backDesignRef, viewSideRef, productDataRef } = useFabric();

    const handlePreview = () => {
        const canvas = fabricCanvas.current;
        if (!canvas) return;

        const json = canvas.toJSON();
        console.log("🔥 Saving JSON:", json);
        if (viewSideRef.current === "front") {
            frontDesignRef.current = json;
            console.log("💾 Saved FRONT before preview");
        } else {
            backDesignRef.current = json;
            console.log("💾 Saved BACK before preview");
        }

        navigate(`/customize/${slug}/preview`, {
            state: {
                frontImage: productDataRef.current.frontImage,
                backImage: productDataRef.current.backImage
            }
        });
    };


    return (
        <div className="sticky bottom-0 z-50 pt-10 pb-6 mt-12 bg-gradient-to-t from-[#0a0a0a] to-transparent">
            <button
                onClick={handlePreview}
                className="group relative w-full h-16 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
            >
                {/* Glass Background */}
                <div className="absolute inset-0 bg-[#d4c4b1] transition-colors duration-500 group-hover:bg-[#e6d5c3]" />

                {/* Subtle Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]" />

                {/* Content */}
                <div className="relative flex items-center justify-center gap-3">
                    <FiEye size={18} className="text-black group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black">
                        Preview Design
                    </span>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            </button>
        </div>
    );
}