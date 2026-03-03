import { useNavigate, useParams } from "react-router-dom";

export default function ElementLibrary() {
    const navigate = useNavigate();
    const { slug } = useParams(); // important for dynamic route

    const items = [
        { icon: "text_fields", label: "Text", action: "text" },
        { icon: "category", label: "Shapes", action: "shapes" },
        { icon: "palette", label: "Graphics", action: "graphics" },
    ];

    const handleClick = (item) => {
        if (item.action === "text") {
            navigate(`/customize/${slug}/text`);
        }
        else if (item.action === "shapes") {
            navigate(`/customize/${slug}/shapes`);
        }
        else if (item.action === "graphics") {
            navigate(`/customize/${slug}/graphics`);
        }
        // later:
        // shapes → /customize/:slug/shapes
        // graphics → /customize/:slug/graphics
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#d4c4b1] opacity-70">
                    01. Element Library
                </h4>
                <div className="h-px flex-1 bg-white/5 ml-4"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {items.map(item => (
                    <button
                        key={item.label}
                        onClick={() => handleClick(item)}
                        className="group relative bg-[#1a1a1a]/50 aspect-square border border-white/5 flex flex-col items-center justify-center gap-2 hover:border-[#d4c4b1]/50 hover:bg-[#d4c4b1]/5 transition-all duration-500 rounded-xl overflow-hidden"
                    >
                        {/* Background subtle glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#d4c4b1]/0 to-[#d4c4b1]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform duration-500 text-white/50 group-hover:text-white">
                            {item.icon}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-[#d4c4b1] transition-colors duration-500">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
