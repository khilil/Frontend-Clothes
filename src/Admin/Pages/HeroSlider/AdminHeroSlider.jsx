import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { 
    Plus, 
    Trash2, 
    Edit, 
    Save, 
    X, 
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = "/hero";

const AdminHeroSlider = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlideId, setCurrentSlideId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        label: "",
        subheading: "",
        heading: "",
        cta: "SHOP NOW",
        link: "/category/all",
        order: 0,
        isActive: true,
        image: null
    });

    const [preview, setPreview] = useState(null);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${BASE_URL}/admin`);
            setSlides(response.data.data || []);
        } catch (error) {
            console.error("Error fetching slides:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setFormData({
            label: "",
            subheading: "",
            heading: "",
            cta: "SHOP NOW",
            link: "/category/all",
            order: 0,
            isActive: true,
            image: null
        });
        setPreview(null);
        setIsEditing(false);
        setCurrentSlideId(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'image' && !formData[key]) return;
            data.append(key, formData[key]);
        });

        try {
            if (isEditing) {
                await api.patch(`${BASE_URL}/${currentSlideId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post(BASE_URL, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchSlides();
            resetForm();
        } catch (error) {
            console.error("Error saving slide:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (slide) => {
        setFormData({
            label: slide.label,
            subheading: slide.subheading,
            heading: slide.heading,
            cta: slide.cta,
            link: slide.link,
            order: slide.order,
            isActive: slide.isActive,
            image: null
        });
        setPreview(slide.image);
        setIsEditing(true);
        setCurrentSlideId(slide._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slide?")) return;
        try {
            await api.delete(`${BASE_URL}/${id}`);
            fetchSlides();
        } catch (error) {
            console.error("Error deleting slide:", error);
        }
    };

    const handleToggleStatus = async (slide) => {
        try {
            await api.patch(`${BASE_URL}/${slide._id}`, { isActive: !slide.isActive });
            fetchSlides();
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-[#0f172a]">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display mb-1">
                        Hero Slider Management
                    </h1>
                    <p className="text-slate-500 text-sm">Update and organize your homepage banner slides.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={20} />
                    ADD NEW SLIDE
                </button>
            </div>

            {/* Slides List */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            ) : (slides || []).length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border border-dashed border-slate-200 dark:border-slate-700">
                    <ImageIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">No Slides Found</h2>
                    <p className="text-slate-500 mb-8">Start by adding your first promotional banner slide.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {(slides || []).map((slide) => (
                        <motion.div
                            key={slide._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 group"
                        >
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <img loading="lazy" src={slide.image} alt={slide.heading} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${slide.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                            {slide.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                        <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase">ORDER: {slide.order}</span>
                                    </div>
                                    <div className="text-white">
                                        <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase mb-1 block">{slide.label}</span>
                                        <h3 className="text-2xl font-black uppercase tracking-tight font-display leading-tight">{slide.heading}</h3>
                                        <p className="text-xs text-white/70 uppercase tracking-widest mt-1">{slide.subheading}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(slide)}
                                        className={`p-2 rounded-xl transition-all ${slide.isActive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-400 bg-slate-50 dark:bg-slate-800'}`}
                                        title={slide.isActive ? "Deactivate" : "Activate"}
                                    >
                                        {slide.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(slide)}
                                        className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slide._id)}
                                        className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-500/10 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {isEditing ? 'Edit Slide' : 'Add New Slide'}
                                </h2>
                                <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Slide Image</label>
                                    <div className="relative group aspect-[16/6] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center transition-all hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        {preview ? (
                                            <>
                                                <img loading="lazy" src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 flex items-center gap-2">
                                                        <ImageIcon size={14} className="text-white" />
                                                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">Change Image</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                                                    <ImageIcon className="text-indigo-600" size={24} />
                                                </div>
                                                <div className="text-center px-4">
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Click to upload image</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-1">Perfect size: 1920x1080px</p>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            accept="image/*"
                                            required={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Label (Badge)</label>
                                        <input
                                            type="text"
                                            name="label"
                                            value={formData.label}
                                            onChange={handleInputChange}
                                            placeholder="e.g. NEW COLLECTION"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Subheading</label>
                                        <input
                                            type="text"
                                            name="subheading"
                                            value={formData.subheading}
                                            onChange={handleInputChange}
                                            placeholder="e.g. URBAN EXPLORATION"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Main Heading</label>
                                    <input
                                        type="text"
                                        name="heading"
                                        value={formData.heading}
                                        onChange={handleInputChange}
                                        placeholder="e.g. FENRIR ARCHIVE"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-display font-bold dark:text-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">CTA Label</label>
                                        <input
                                            type="text"
                                            name="cta"
                                            value={formData.cta}
                                            onChange={handleInputChange}
                                            placeholder="SHOP NOW"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Link URL</label>
                                        <input
                                            type="text"
                                            name="link"
                                            value={formData.link}
                                            onChange={handleInputChange}
                                            placeholder="/category/all"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Display Order</label>
                                        <input
                                            type="number"
                                            name="order"
                                            value={formData.order}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            id="isActive"
                                            className="w-5 h-5 rounded-lg border-none bg-slate-100 dark:bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer">Published / Active</label>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-[20px] font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all uppercase tracking-widest text-[10px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-indigo-600 text-white py-4 rounded-[20px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : isEditing ? <Save size={16} /> : <CheckCircle2 size={16} />}
                                        {isEditing ? 'Save Changes' : 'Create Slide'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminHeroSlider;
