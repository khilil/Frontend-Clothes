import React, { useState, useEffect } from 'react';
import {
    Palette,
    Plus,
    Trash2,
    RefreshCcw,
    Loader2,
    CheckCircle2,
    X,
    Image as ImageIcon,
    Type,
    Upload,
    DollarSign,
    Settings
} from 'lucide-react';
import {
    getGraphics,
    addGraphic,
    deleteGraphic,
    getFonts,
    addFont,
    deleteFont,
    getSettings,
    updateSettings
} from '../../../services/customizationService';
import { motion, AnimatePresence } from 'framer-motion';

const CustomizationManagement = () => {
    const [graphics, setGraphics] = useState([]);
    const [fonts, setFonts] = useState([]);
    const [settings, setSettings] = useState({ basePrice: 100, textPricePerElement: 20 });
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('graphics');

    const [newGraphic, setNewGraphic] = useState({ name: '', price: 50, file: null });
    const [newFont, setNewFont] = useState({ label: '', value: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [graphicsData, fontsData, settingsData] = await Promise.all([
                getGraphics().catch(() => []),
                getFonts().catch(() => []),
                getSettings().catch(() => ({ basePrice: 100, textPricePerElement: 20 }))
            ]);
            setGraphics(graphicsData || []);
            setFonts(fontsData || []);
            setSettings(settingsData);
        } catch (error) {
            showNotification('error', 'Failed to fetch customization data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddGraphic = async (e) => {
        e.preventDefault();
        if (!newGraphic.name || !newGraphic.file) return;
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', newGraphic.name);
        formData.append('price', newGraphic.price);
        formData.append('file', newGraphic.file);
        try {
            await addGraphic(formData);
            setNewGraphic({ name: '', price: 50, file: null });
            showNotification('success', 'Graphic added successfully');
            fetchData();
        } catch (error) {
            showNotification('error', 'Failed to add graphic');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddFont = async (e) => {
        e.preventDefault();
        if (!newFont.label || !newFont.value) return;
        setIsSubmitting(true);
        try {
            await addFont(newFont);
            setNewFont({ label: '', value: '' });
            showNotification('success', 'Font added successfully');
            fetchData();
        } catch (error) {
            showNotification('error', 'Failed to add font');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGraphic = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await deleteGraphic(id);
            showNotification('success', 'Graphic deleted');
            fetchData();
        } catch (error) {
            showNotification('error', 'Failed to delete');
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateSettings(settings);
            showNotification('success', 'Global pricing updated');
            fetchData();
        } catch (error) {
            showNotification('error', 'Failed to update pricing');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFont = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await deleteFont(id);
            showNotification('success', 'Font deleted');
            fetchData();
        } catch (error) {
            showNotification('error', 'Failed to delete font');
        }
    };

    // Shared input class
    const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customization Studio Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage assets for the frontend T-shirt customizer.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                    <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px">
                {['graphics', 'fonts', 'pricing'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-2 text-sm font-bold tracking-wider uppercase transition-all relative ${
                            activeTab === tab
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {tab === 'fonts' ? 'Typography' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                            <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ─── Form Panel ─── */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm sticky top-8">
                        <div className="flex items-center gap-2.5 mb-6 text-indigo-500 dark:text-indigo-400">
                            {activeTab === 'graphics' ? <ImageIcon size={20} /> : activeTab === 'pricing' ? <DollarSign size={20} /> : <Type size={20} />}
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {activeTab === 'graphics' ? 'Add New Graphic' : activeTab === 'pricing' ? 'Customization Pricing' : 'Add New Font'}
                            </h2>
                        </div>

                        <form
                            onSubmit={activeTab === 'graphics' ? handleAddGraphic : activeTab === 'pricing' ? handleUpdateSettings : handleAddFont}
                            className="space-y-6"
                        >
                            {activeTab === 'fonts' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Font Display Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Oswald (Bold)"
                                            className={`${inputCls} font-bold`}
                                            value={newFont.label}
                                            onChange={(e) => setNewFont({ ...newFont, label: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Google Font Family Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Oswald"
                                            className={`${inputCls} font-mono`}
                                            value={newFont.value}
                                            onChange={(e) => setNewFont({ ...newFont, value: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Must exactly match Google Fonts name</p>
                                    </div>
                                </>
                            ) : activeTab === 'pricing' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Base Customization Fee</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">₹</span>
                                            <input
                                                type="number"
                                                className={`${inputCls} pl-8 font-bold`}
                                                value={settings.basePrice}
                                                onChange={(e) => setSettings({ ...settings, basePrice: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">One-time fee for any custom design</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Price per Text Element</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">₹</span>
                                            <input
                                                type="number"
                                                className={`${inputCls} pl-8 font-bold`}
                                                value={settings.textPricePerElement}
                                                onChange={(e) => setSettings({ ...settings, textPricePerElement: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Asset Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Vintage Skull"
                                            className={`${inputCls} font-bold`}
                                            value={newGraphic.name}
                                            onChange={(e) => setNewGraphic({ ...newGraphic, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Print Price (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 50"
                                            className={inputCls}
                                            value={newGraphic.price}
                                            onChange={(e) => setNewGraphic({ ...newGraphic, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Upload SVG/PNG</label>
                                        <div className="relative group/upload">
                                            <input
                                                type="file"
                                                accept=".svg,.png,.jpg"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setNewGraphic({ ...newGraphic, file: e.target.files[0] })}
                                            />
                                            <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 group-hover/upload:border-indigo-500/50 transition-all bg-slate-50 dark:bg-slate-950/50">
                                                <Upload size={24} className="text-slate-400 dark:text-slate-600 group-hover/upload:text-indigo-500 transition-all" />
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    {newGraphic.file?.name || 'Choose File'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : activeTab === 'pricing' ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                                {activeTab === 'pricing' ? 'Update Pricing' : 'Upload Asset'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ─── List Panel ─── */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 min-h-[400px] shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-6">
                            {activeTab === 'pricing'
                                ? 'Pricing Overview'
                                : `Existing ${activeTab} (${activeTab === 'graphics' ? graphics.length : fonts.length})`}
                        </h3>

                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="animate-spin text-indigo-500" size={32} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">

                                {/* Graphics Tab */}
                                {activeTab === 'graphics' && (
                                    graphics.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-600 italic text-sm">No graphics found.</div>
                                    ) : (
                                        graphics.map(item => (
                                            <div
                                                key={item._id}
                                                className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-all hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-sm overflow-hidden"
                                            >
                                                <div className="aspect-square flex items-center justify-center mb-4 bg-white dark:bg-slate-900 rounded-xl p-2">
                                                    <img src={item.url} alt={item.name} className="max-w-full max-h-full object-contain" />
                                                </div>
                                                <div className="px-1 text-center">
                                                    <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase truncate mb-1">{item.name}</p>
                                                    <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">₹{item.price || 0}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteGraphic(item._id)}
                                                    className="absolute top-2 right-2 p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )
                                )}

                                {/* Pricing Tab */}
                                {activeTab === 'pricing' && (
                                    <div className="col-span-full space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-2">Base Studio Fee</p>
                                                <p className="text-3xl font-black text-slate-900 dark:text-white">₹{settings.basePrice}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-2">Price Per Text</p>
                                                <p className="text-3xl font-black text-slate-900 dark:text-white">₹{settings.textPricePerElement}</p>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 p-6 rounded-2xl">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
                                                <Settings size={14} /> Printing Methods
                                            </h4>
                                            <div className="space-y-3">
                                                {settings.printingMethods?.map((method, idx) => (
                                                    <div key={method.id} className="bg-white dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    className="bg-transparent border-none text-[10px] font-black uppercase text-slate-900 dark:text-white outline-none focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors"
                                                                    value={method.label}
                                                                    onChange={(e) => {
                                                                        const newMethods = [...settings.printingMethods];
                                                                        newMethods[idx].label = e.target.value;
                                                                        setSettings({ ...settings, printingMethods: newMethods });
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="block bg-transparent border-none text-[8px] text-slate-400 dark:text-slate-500 outline-none w-full"
                                                                    value={method.description}
                                                                    onChange={(e) => {
                                                                        const newMethods = [...settings.printingMethods];
                                                                        newMethods[idx].description = e.target.value;
                                                                        setSettings({ ...settings, printingMethods: newMethods });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">₹</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[10px] font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                                                                    value={method.price}
                                                                    onChange={(e) => {
                                                                        const newMethods = [...settings.printingMethods];
                                                                        newMethods[idx].price = e.target.value;
                                                                        setSettings({ ...settings, printingMethods: newMethods });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 p-6 rounded-2xl">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
                                                <ImageIcon size={14} /> Individual Graphic Prices
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {graphics.map(g => (
                                                    <div key={g._id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/50">
                                                        <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[60%]">{g.name}</span>
                                                        <span className="text-[9px] font-black text-slate-900 dark:text-white">₹{g.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Fonts Tab */}
                                {activeTab === 'fonts' && (
                                    fonts.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-600 italic text-sm">No fonts added.</div>
                                    ) : (
                                        fonts.map(item => (
                                            <div
                                                key={item._id}
                                                className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-sm overflow-hidden flex flex-col justify-center items-center gap-4"
                                            >
                                                <div className="w-full text-center">
                                                    <p className="text-2xl text-slate-900 dark:text-white truncate px-2" style={{ fontFamily: item.value }}>Aa</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase truncate">{item.label}</p>
                                                    <p className="text-[8px] text-slate-400 dark:text-slate-500 font-mono mt-1">{item.value}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteFont(item._id)}
                                                    className="absolute top-2 right-2 p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 pr-6 shadow-2xl backdrop-blur-xl"
                    >
                        <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{notification.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomizationManagement;
