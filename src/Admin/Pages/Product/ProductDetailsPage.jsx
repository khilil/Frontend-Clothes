import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronLeft,
    Edit3,
    Layers,
    Package,
    Calendar,
    Tag,
    DollarSign,
    Box,
    Info,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Hash,
    TrendingUp,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductBySlug } from '../../../services/productService';

export default function ProductDetailsPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const response = await getProductBySlug(slug, true);
                const data = response.data || response;
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images.find(img => img.isMain)?.url || data.images[0].url);
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Failed to load product details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-indigo-500" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">GATHERING PRODUCT DATA...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950 p-6">
                <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center shadow-2xl">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-6">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Product Not Found</h2>
                    <p className="text-slate-400 mb-8 font-medium">{error || "The product you're looking for doesn't exist or was removed."}</p>
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <ChevronLeft size={18} />
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
    const lowStockVariants = product.variants?.filter(v => v.stock <= (v.lowStockThreshold || 5)) || [];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-8 py-4">
                <div className="flex items-center justify-between mx-auto max-w-[1440px]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">Product Detail</span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${product.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase mt-1">{product.title || product.name}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/admin/products/edit/${product.slug}`}
                            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800"
                        >
                            <Edit3 size={18} />
                            Edit Product
                        </Link>
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95">
                            <Tag size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column - Media & Flags */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Main Image Viewer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative aspect-square overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 shadow-2xl ring-1 ring-white/5"
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="h-full w-full object-cover p-4"
                                src={activeImage || 'https://premium-clothing.com/placeholder.jpg'}
                                alt={product.title}
                            />
                        </AnimatePresence>

                        {/* Status Badges Overlay */}
                        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                            {product.isFeatured && <span className="rounded-lg bg-amber-500/90 px-3 py-1 text-[9px] font-black uppercase text-white shadow-lg backdrop-blur-sm">Featured</span>}
                            {product.isNewArrival && <span className="rounded-lg bg-indigo-600/90 px-3 py-1 text-[9px] font-black uppercase text-white shadow-lg backdrop-blur-sm">New Arrival</span>}
                            {product.isBestSeller && <span className="rounded-lg bg-emerald-600/90 px-3 py-1 text-[9px] font-black uppercase text-white shadow-lg backdrop-blur-sm">Best Seller</span>}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-8 opacity-0 transition-opacity group-hover:opacity-100 font-bold text-xs uppercase text-indigo-400 tracking-widest">
                            Primary Image View
                        </div>
                    </motion.div>

                    {/* Thumbnail Gallery */}
                    <div className="grid grid-cols-5 gap-4">
                        {product.images?.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img.url)}
                                className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${activeImage === img.url ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <img src={img.url} className="h-full w-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all" alt="" />
                                {img.isMain && (
                                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Specifications Section */}
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                <ImageIcon size={20} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Product Specs</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brand</p>
                                <p className="text-sm font-bold text-white">{product.brand || 'No Brand'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gender</p>
                                <p className="text-sm font-bold text-white uppercase">{product.gender || 'Unisex'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Material</p>
                                <p className="text-sm font-bold text-white">{product.material || 'Standard'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</p>
                                <p className="text-sm font-bold text-white uppercase">{product.productType || 'Other'}</p>
                            </div>
                            <div className="col-span-2 space-y-2 pt-2 border-t border-slate-800/50">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categories</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.categories && product.categories.length > 0 ? (
                                        product.categories.map((cat, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                                                {cat}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-500 font-medium italic">No categories assigned</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column - Product Info & Variants */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Price</p>
                            <p className="text-2xl font-black text-white">₹{product.price?.toFixed(2)}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Stock</p>
                            <p className="text-2xl font-black text-white">{totalStock}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Variants</p>
                            <p className="text-2xl font-black text-white">{product.variants?.length || 0}</p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <section className="rounded-[2.5rem] border border-slate-800 bg-slate-900 p-8 shadow-xl ring-1 ring-white/5">
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Description</h3>
                            {product.shortDescription && (
                                <p className="text-lg font-black text-white leading-tight uppercase tracking-tight mb-4">
                                    {product.shortDescription}
                                </p>
                            )}
                            <p className="text-slate-400 leading-relaxed font-medium text-sm border-l-2 border-slate-800 pl-4 py-1">
                                {product.fullDescription || product.description || "No full description available."}
                            </p>
                        </div>

                        <div className="pt-8 border-t border-slate-800/50 grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={14} className="text-indigo-400" />
                                    Inventory Logic
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Track Inventory</span>
                                        <span className={`h-2 w-2 rounded-full ${product.trackInventory ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Global Threshold</span>
                                        <span className="text-xs font-bold text-white">{product.globalThreshold || 5} Units</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={14} className="text-indigo-400" />
                                    Important Dates
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Listed On</span>
                                        <span className="text-xs font-bold text-white">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Last Update</span>
                                        <span className="text-xs font-bold text-white">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Variants Section */}
                    <section className="rounded-[2.5rem] border border-slate-800 bg-slate-900 overflow-hidden shadow-xl ring-1 ring-white/5">
                        <div className="p-8 border-b border-slate-800/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                                        <Layers size={24} />
                                    </div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Media & Stock Grid</h2>
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Scroll to view all</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/20">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Variant Details</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Inventory Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Variant Media</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Identifier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {product.variants?.map((v, idx) => (
                                        <tr key={idx} className="group transition-colors hover:bg-slate-800/20">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {v.attributes ? (
                                                        Object.entries(v.attributes).map(([key, val]) => (
                                                            <div key={key} className="flex flex-col">
                                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1">{key}</span>
                                                                <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 uppercase tracking-tight">
                                                                    {val}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs font-bold text-slate-500 italic">No attributes</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-lg font-black ${v.stock <= (v.lowStockThreshold || 5) ? 'text-rose-400' : 'text-slate-200'}`}>
                                                            {v.stock} <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1 font-bold">Units</span>
                                                        </p>
                                                    </div>
                                                    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${v.stock > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {v.stock > 0 ? 'Available' : 'Out of Stock'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex -space-x-2 overflow-hidden hover:space-x-1 transition-all">
                                                    {(v.images && v.images.length > 0 ? v.images : [{ url: 'https://premium-clothing.com/placeholder.jpg' }]).map((img, i) => (
                                                        <motion.div
                                                            key={i}
                                                            whileHover={{ y: -5, zIndex: 10, scale: 1.1 }}
                                                            onClick={() => setActiveImage(img.url)}
                                                            className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border-2 border-slate-900 bg-slate-800 shadow-xl overflow-hidden"
                                                        >
                                                            <img src={img.url} className="h-full w-full object-cover" alt="" />
                                                        </motion.div>
                                                    ))}
                                                    {v.images?.length > 4 && (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-slate-900 bg-slate-800 text-[10px] font-black text-slate-400">
                                                            +{v.images.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="font-mono text-[10px] font-black text-indigo-400/80 bg-indigo-500/5 px-3 py-1.5 rounded-xl inline-block uppercase tracking-tighter border border-indigo-500/10">
                                                    {v.sku}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
