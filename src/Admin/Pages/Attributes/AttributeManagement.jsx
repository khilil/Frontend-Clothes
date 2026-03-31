import React, { useState, useEffect } from 'react';
import {
    Palette,
    Ruler,
    Plus,
    Trash2,
    RefreshCcw,
    Loader2,
    CheckCircle2,
    X,
    Hash
} from 'lucide-react';
import { getAllColors, createColor, deleteColor } from '../../../services/colorService';
import { getAllSizes, createSize, deleteSize } from '../../../services/sizeService';
import { COLOR_CATEGORIES, getMainColorFromHex, normalizeHex } from '../../../utils/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';

const AttributeManagement = () => {
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Form states
    const [newColor, setNewColor] = useState({ 
        name: '', 
        hexCode: '#000000',
        mainColor: 'BLACK' // 🎨 New Field
    });
    const [newSize, setNewSize] = useState({ name: '', categoryType: 'topwear' });
    const [isSubmittingColor, setIsSubmittingColor] = useState(false);
    const [isSubmittingSize, setIsSubmittingSize] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [colorsData, sizesData] = await Promise.all([
                getAllColors(),
                getAllSizes()
            ]);
            setColors(colorsData.data || []);
            setSizes(sizesData.data || []);
        } catch (error) {
            showNotification('error', 'Failed to fetch attributes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleHexChange = (e) => {
        let hex = e.target.value;
        if (!hex.startsWith('#')) hex = `#${hex}`;
        
        const suggestedMain = getMainColorFromHex(hex);
        setNewColor(prev => ({ 
            ...prev, 
            hexCode: hex,
            mainColor: suggestedMain 
        }));
    };

    const handleCreateColor = async (e) => {
        e.preventDefault();
        if (!newColor.name || !newColor.hexCode) return;

        setIsSubmittingColor(true);
        try {
            await createColor({
                ...newColor,
                hexCode: normalizeHex(newColor.hexCode)
            });
            setNewColor({ name: '', hexCode: '#000000', mainColor: 'BLACK' });
            showNotification('success', 'Color created successfully');
            fetchData();
        } catch (error) {
            showNotification('error', error.message || 'Failed to create color');
        } finally {
            setIsSubmittingColor(false);
        }
    };

    const handleCreateSize = async (e) => {
        e.preventDefault();
        if (!newSize.name || !newSize.categoryType) return;

        setIsSubmittingSize(true);
        try {
            await createSize(newSize);
            setNewSize({ name: '', categoryType: 'topwear' });
            showNotification('success', 'Size created successfully');
            fetchData();
        } catch (error) {
            showNotification('error', error.message || 'Failed to create size');
        } finally {
            setIsSubmittingSize(false);
        }
    };

    const handleDeleteColor = async (id) => {
        if (!window.confirm('Are you sure you want to delete this color?')) return;
        try {
            await deleteColor(id);
            showNotification('success', 'Color deleted');
            fetchData();
        } catch (error) {
            showNotification('error', 'Failed to delete color');
        }
    };

    const handleDeleteSize = async (id) => {
        if (!window.confirm('Are you sure you want to delete this size?')) return;
        try {
            await deleteSize(id);
            showNotification('success', 'Size deleted');
            fetchData();
        } catch (error) {
            showNotification('error', 'Failed to delete size');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Attribute Management</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage global sizes and colors for product variants.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    title="Refresh Data"
                >
                    <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Colors Section */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2.5 mb-6 text-indigo-400">
                            <Palette size={20} />
                            <h2 className="text-lg font-bold text-white">Manage Colors</h2>
                        </div>

                        <form onSubmit={handleCreateColor} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mb-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Color Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Midnight Blue"
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    value={newColor.name}
                                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hex Code</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            <Hash size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="FFFFFF"
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-4 py-2.5 text-sm font-mono text-slate-200 outline-none focus:border-indigo-500 transition-all"
                                            value={newColor.hexCode.replace('#', '')}
                                            onChange={(e) => setNewColor({ ...newColor, hexCode: `#${e.target.value.replace('#', '')}` })}
                                        />
                                    </div>
                                </div>
                                <div className="h-[42px] w-[42px] rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                                    <input
                                        type="color"
                                        className="h-[60px] w-[60px] -mt-[9px] -ml-[9px] cursor-pointer"
                                        value={newColor.hexCode}
                                        onChange={(e) => handleHexChange(e)}
                                    />
                                </div>
                            </div>

                            {/* 🎨 Main Color Selection (Group) */}
                            <div className="sm:col-span-2 space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">Filtering Category (Main Color)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <select
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                        value={newColor.mainColor}
                                        onChange={(e) => setNewColor({ ...newColor, mainColor: e.target.value })}
                                    >
                                        {COLOR_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-500 italic">
                                        💡 Group similar shades under a main category for better filtering performance.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmittingColor}
                                className="sm:col-span-2 w-full mt-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmittingColor ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Add Color
                            </button>
                        </form>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4 px-1">Current Colors</h3>
                            {colors.length === 0 ? (
                                <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                                    No colors added yet
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {colors.map(color => (
                                        <div key={color._id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg shadow-inner ring-1 ring-white/10" style={{ backgroundColor: color.hexCode }}></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{color.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] font-mono text-slate-500 uppercase">{color.hexCode}</p>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold tracking-tighter">
                                                            {color.mainColor || 'GREY'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteColor(color._id)}
                                                className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sizes Section */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2.5 mb-6 text-indigo-400">
                            <Ruler size={20} />
                            <h2 className="text-lg font-bold text-white">Manage Sizes</h2>
                        </div>

                        <form onSubmit={handleCreateSize} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mb-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Size Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Large / 42"
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                                    value={newSize.name}
                                    onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category Type</label>
                                <select
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                                    value={newSize.categoryType}
                                    onChange={(e) => setNewSize({ ...newSize, categoryType: e.target.value })}
                                >
                                    <option value="topwear">Topwear (T-Shirts, Shirts, etc.)</option>
                                    <option value="bottomwear">Bottomwear (Jeans, Pants, etc.)</option>
                                    <option value="footwear">Footwear (Shoes, etc.)</option>
                                    <option value="accessory">Accessory</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmittingSize}
                                className="sm:col-span-2 w-full mt-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmittingSize ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Add Size
                            </button>
                        </form>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4 px-1">Current Sizes</h3>
                            {sizes.length === 0 ? (
                                <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                                    No sizes added yet
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {sizes.map(size => (
                                        <div key={size._id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-[10px]">
                                                    {size.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{size.name}</p>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium capitalize">
                                                        {size.categoryType}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSize(size._id)}
                                                className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 pr-6 shadow-2xl backdrop-blur-xl"
                    >
                        <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                        </div>
                        <p className="text-sm font-bold text-white">{notification.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AttributeManagement;
