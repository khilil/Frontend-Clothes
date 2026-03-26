import { useEffect, useState } from "react";

const mockReviews = [
    {
        id: 1,
        name: "Alexander V.",
        rating: 5,
        title: "Exceptional Cut & Material",
        review:
            "The tailored fit is perfect. The Giza cotton feels substantial yet remains breathable. Truly a staple piece for any minimalist wardrobe.",
        time: "2 weeks ago",
        verified: true,
    },
    {
        id: 2,
        name: "Marcus T.",
        rating: 4,
        title: "Timeless Luxury",
        review:
            "I've tried many luxury shirts, but the attention to detail in the stitching here is unparalleled. Holds its shape well after multiple washes.",
        time: "1 month ago",
        verified: true,
    },
    {
        id: 3,
        name: "Julian R.",
        rating: 5,
        title: "Perfect White Shirt",
        review:
            "Found the holy grail of white shirts. Crisp, opaque, and the collar height is just right for both formal and casual settings.",
        time: "3 months ago",
        verified: true,
    },
];


export default function Reviews() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        setReviews(mockReviews);
    }, []);

    if (!reviews.length) return null;

    return (
        <section className="py-16 md:py-32 bg-white border-t border-neutral-100">
            <div className="max-w-[1920px] mx-auto px-4 md:px-12">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 md:mb-16">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-impact tracking-tighter mb-4 text-neutral-900">
                            CUSTOMER REVIEWS
                        </h2>

                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <div className="flex gap-0.5 text-[#d4c4b1]">
                                {[1, 2, 3, 4].map(i => (
                                    <span key={i} className="material-symbols-outlined text-xl md:text-2xl fill-star">star</span>
                                ))}
                                <span className="material-symbols-outlined text-xl md:text-2xl">star_half</span>
                            </div>

                            <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                                4.8 Average (1,240 Reviews)
                            </span>
                        </div>
                    </div>

                    <button className="w-full md:w-auto px-10 py-4 border border-neutral-200 text-[11px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all text-neutral-900">
                        Write a Review
                    </button>
                </div>

                {/* GRID: Mobile ma 1 column, Desktop ma 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    {reviews.map(review => (
                        <div
                            key={review.id}
                            className="bg-neutral-50 p-6 md:p-10 border border-neutral-100 hover:border-neutral-200 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-0.5 text-[#d4c4b1]">
                                        {Array.from({ length: review.rating }).map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-sm fill-star">star</span>
                                        ))}
                                    </div>
                                    {review.verified && (
                                        <div className="flex items-center gap-1 text-[#d4c4b1]">
                                            <span className="material-symbols-outlined text-xs">verified</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest mb-3 text-neutral-900">
                                    {review.title}
                                </h4>
                                <p className="text-neutral-600 text-[10px] md:text-[11px] leading-relaxed tracking-wider uppercase">
                                    {review.review}
                                </p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-900">{review.name}</span>
                                <span className="text-[8px] font-bold uppercase text-neutral-300">{review.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
