import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../services/api";

export default function Reviews({ productId, onReviewsLoaded }) {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { user } = useSelector((state) => state.auth);

    const fetchReviews = async () => {
        if (!productId) return;
        try {
            const response = await api.get(`/reviews/product/${productId}`);
            if (response.data && response.data.data) {
                setReviews(response.data.data);
                if (typeof onReviewsLoaded === "function") {
                    onReviewsLoaded(response.data.data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!user) {
            setError("Please login to write a review.");
            return;
        }

        if (!title.trim() || !reviewText.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/reviews", {
                product: productId,
                rating,
                title,
                review: reviewText
            });

            setSuccessMessage("Review submitted successfully!");
            setTitle("");
            setReviewText("");
            setRating(5);
            setShowForm(false);
            fetchReviews();
        } catch (err) {
            console.error("Submit review error:", err);
            setError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate Average
    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "5.0";

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
                                {Array.from({ length: Math.round(Number(averageRating)) }).map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-xl md:text-2xl fill-star">star</span>
                                ))}
                                {Array.from({ length: 5 - Math.round(Number(averageRating)) }).map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-xl md:text-2xl">star_border</span>
                                ))}
                            </div>

                            <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                                {averageRating} Average ({reviews.length} Reviews)
                            </span>
                        </div>
                    </div>

                    {!showForm && (
                        <button 
                            onClick={() => {
                                if (!user) {
                                    alert("Please login first to submit a review.");
                                } else {
                                    setShowForm(true);
                                }
                            }}
                            className="w-full md:w-auto px-10 py-4 border border-neutral-200 text-[11px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all text-neutral-900"
                        >
                            Write a Review
                        </button>
                    )}
                </div>

                {/* WRITE REVIEW FORM */}
                {showForm && (
                    <div className="mb-16 p-6 md:p-12 bg-neutral-50 border border-neutral-100 rounded-3xl max-w-3xl">
                        <h3 className="text-xl font-impact tracking-tight text-neutral-900 mb-6 uppercase">
                            Submit your feedback
                        </h3>

                        {error && (
                            <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mb-6 bg-rose-50 p-4 border border-rose-100 rounded-xl">
                                {error}
                            </p>
                        )}
                        {successMessage && (
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-6 bg-emerald-50 p-4 border border-emerald-100 rounded-xl">
                                {successMessage}
                            </p>
                        )}

                        <form onSubmit={handleSubmitReview} className="space-y-8">
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Rating</label>
                                <div className="flex gap-2 text-[#d4c4b1]">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="hover:scale-110 transition-transform"
                                        >
                                            <span className={`material-symbols-outlined text-3xl ${star <= rating ? "fill-star" : ""}`}>
                                                {star <= rating ? "star" : "star_border"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Review Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Summarize your experience"
                                    className="bg-white border border-neutral-200 rounded-2xl px-6 py-4 text-[12px] text-neutral-900 font-medium focus:border-neutral-900 transition-all outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Review Content</label>
                                <textarea
                                    rows={4}
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Write your honest opinion here"
                                    className="bg-white border border-neutral-200 rounded-2xl px-6 py-4 text-[12px] text-neutral-900 font-medium focus:border-neutral-900 transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-4 bg-neutral-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-all"
                                >
                                    {loading ? "Submitting..." : "Submit Review"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-10 py-4 border border-neutral-200 text-[11px] font-black uppercase tracking-widest hover:bg-neutral-50 text-neutral-900 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* GRID: Reviews List */}
                {reviews.length === 0 ? (
                    <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest text-center py-12">
                        No reviews yet. Be the first to write a review!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {reviews.map(review => (
                            <div
                                key={review._id}
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
                                    <span className="text-[8px] font-bold uppercase text-neutral-300">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
