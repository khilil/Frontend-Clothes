import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Plus,
    X,
    Trash2,
    Edit3,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Ticket,
    Tag,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllOffers, createOffer, updateOffer, deleteOffer } from '../../../services/offerService';

export default function OfferManagement() {
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [activeTab, setActiveTab] = useState('IDENTITY');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        code: '',
        icon: 'local_offer',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minPurchaseAmount: '',
        maxDiscountAmount: '',
        isActive: true,
        offerType: 'COUPON',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        applicableCategories: '',
        bannerConfig: {
            showBanner: false,
            imageUrl: '',
            bannerText: '',
            position: 'BETWEEN_SECTIONS'
        },
        buyXGetYConfig: {
            buyQty: '',
            getQty: ''
        },
        durationHours: ''
    });


    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchOffers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllOffers();
            setOffers(data.data || []);
        } catch (error) {
            console.error("Fetch error:", error);
            showNotification('error', 'Failed to load offers');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const filteredOffers = useMemo(() => {
        return offers.filter(o => {
            const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (o.description && o.description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            if (!matchesSearch) return false;

            if (filterStatus === 'ALL') return true;

            const isExpired = o.endDate && new Date(o.endDate) < new Date();
            
            if (filterStatus === 'EXPIRED') return isExpired;
            if (filterStatus === 'ACTIVE') return o.isActive && !isExpired;
            if (filterStatus === 'INACTIVE') return !o.isActive && !isExpired;

            return true;
        });
    }, [offers, searchTerm, filterStatus]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Prepare submission data
        const submissionData = {
            ...formData,
            discountValue: formData.discountValue ? Number(formData.discountValue) : 0,
            minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : 0,
            maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : 0,
            durationHours: formData.durationHours ? Number(formData.durationHours) : 0,
            applicableCategories: formData.applicableCategories 
                ? formData.applicableCategories.split(',').map(c => c.trim()).filter(c => c)
                : [],
            buyXGetYConfig: {
                buyQty: formData.buyXGetYConfig.buyQty ? Number(formData.buyXGetYConfig.buyQty) : 0,
                getQty: formData.buyXGetYConfig.getQty ? Number(formData.buyXGetYConfig.getQty) : 0
            }
        };

        try {
            if (editingOffer) {
                await updateOffer(editingOffer._id, submissionData);
                showNotification('success', 'Offer updated successfully');
            } else {
                await createOffer(submissionData);
                showNotification('success', 'Offer created successfully');
            }
            fetchOffers();
            handleCloseModal();
        } catch (error) {
            showNotification('error', error.response?.data?.message || 'Action failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (offer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            description: offer.description || '',
            code: offer.code,
            icon: offer.icon || 'local_offer',
            discountType: offer.discountType || 'PERCENTAGE',
            discountValue: offer.discountValue || '',
            minPurchaseAmount: offer.minPurchaseAmount || '',
            maxDiscountAmount: offer.maxDiscountAmount || '',
            isActive: offer.isActive,
            offerType: offer.offerType || 'COUPON',
            startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
            applicableCategories: Array.isArray(offer.applicableCategories) ? offer.applicableCategories.join(', ') : '',
            bannerConfig: offer.bannerConfig || { showBanner: false, imageUrl: '', bannerText: '', position: 'BETWEEN_SECTIONS' },
            buyXGetYConfig: offer.buyXGetYConfig || { buyQty: '', getQty: '' },
            durationHours: offer.durationHours || ''
        });
        setActiveTab('IDENTITY');
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingOffer(null);
        setActiveTab('IDENTITY');
        setFormData({ 
            title: '', 
            description: '', 
            code: '', 
            icon: 'local_offer', 
            discountType: 'PERCENTAGE',
            discountValue: '',
            minPurchaseAmount: '',
            maxDiscountAmount: '',
            isActive: true,
            offerType: 'COUPON',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            applicableCategories: '',
            bannerConfig: { showBanner: false, imageUrl: '', bannerText: '', position: 'BETWEEN_SECTIONS' },
            buyXGetYConfig: { buyQty: '', getQty: '' },
            durationHours: ''
        });
    };

    const handleDeleteClick = (offer) => {
        setDeleteModal({
            isOpen: true,
            id: offer._id,
            title: offer.title
        });
    };

    const confirmDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteOffer(deleteModal.id);
            setOffers(offers.filter(o => o._id !== deleteModal.id));
            showNotification('success', 'Offer deleted');
            setDeleteModal({ isOpen: false, id: null, title: '' });
        } catch (error) {
            showNotification('error', error.response?.data?.message || 'Delete failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDiscountVisible = !['FREE_SHIPPING', 'BUY_X_GET_Y'].includes(formData.offerType);

    return (
        <div className="flex h-full flex-col bg-slate-950 font-sans text-slate-200">
            {/* Header Area */}
            <div className="border-b border-slate-800 bg-slate-900/50 px-8 py-6 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white uppercase">Offer management</h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">Manage discounts and promotional offers for customers</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 active:scale-95"
                    >
                        <Plus size={18} />
                        Add Offer
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {/* Filters and Search Bar */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    filterStatus === status 
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm ring-1 ring-white/5">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-600"
                                placeholder="Search offers or codes..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl ring-1 ring-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-800 bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Offer details</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Code</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Discount</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Min Purchase</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <Loader2 size={32} className="mx-auto animate-spin text-indigo-500" />
                                        </td>
                                    </tr>
                                ) : filteredOffers.length > 0 ? (
                                    filteredOffers.map((offer) => {
                                        return (
                                            <tr
                                                key={offer._id}
                                                className="group transition-all duration-200 hover:bg-slate-800/40"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
                                                            <span className="material-symbols-outlined text-sm">{offer.icon}</span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-black uppercase tracking-tight text-white">
                                                                    {offer.title}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-slate-500 line-clamp-1">{offer.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2 py-1 text-[10px] font-mono font-black uppercase text-indigo-400 border border-indigo-500/20">
                                                        {offer.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-black text-white">
                                                            {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                            {offer.discountType}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-xs font-bold text-slate-400">
                                                        ₹{offer.minPurchaseAmount || 0}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {offer.endDate && new Date(offer.endDate) < new Date() ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-rose-500 border border-rose-500/20">
                                                            <div className="h-1 w-1 rounded-full bg-rose-500" />
                                                            Expired
                                                        </span>
                                                    ) : offer.isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-500 border border-emerald-500/20">
                                                            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500 border border-slate-700">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEditClick(offer)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-800 hover:text-indigo-400"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(offer)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-rose-500/10 hover:text-rose-400"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            No offers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-8 right-8 z-[110] flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 pr-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle2 className="text-emerald-500" />
                        ) : (
                            <AlertCircle className="text-rose-500" />
                        )}
                        <span className="text-xs font-bold text-white">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="border-b border-slate-800 p-6 flex items-center justify-between">
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                        {editingOffer ? 'Edit Offer' : 'New Offer'}
                                    </h2>
                                    <button type="button" onClick={handleCloseModal} className="text-slate-500 hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-slate-800 px-6">
                                    {[
                                        { id: 'IDENTITY', label: 'Identity', icon: <Tag size={14} /> },
                                        { id: 'RULES', label: 'Rules & Logic', icon: <Activity size={14} /> },
                                        { id: 'PROMO', label: 'Visuals & Banners', icon: <Search size={14} /> },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                            {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
                                    {activeTab === 'IDENTITY' && (
                                        <div className="space-y-6 animate-fadeIn">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Offer Title</label>
                                                <input
                                                    required
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleFormChange}
                                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                                                    placeholder="e.g. Festival Season Sale"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Offer Type</label>
                                                    <select
                                                        name="offerType"
                                                        value={formData.offerType}
                                                        onChange={handleFormChange}
                                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 appearance-none"
                                                    >
                                                        <option value="COUPON">DISCOUNT CODE</option>
                                                        <option value="SEASONAL">SEASONAL EVENT</option>
                                                        <option value="FLASH_SALE">FLASH SALE (TIMED)</option>
                                                        <option value="FREE_SHIPPING">FREE SHIPPING</option>
                                                        <option value="BUY_MORE_SAVE_MORE">BUY MORE SAVE MORE</option>
                                                        <option value="BUY_X_GET_Y">BUY X GET Y (BOGO)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Promo Code</label>
                                                    <input
                                                        required
                                                        name="code"
                                                        value={formData.code}
                                                        onChange={handleFormChange}
                                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 font-mono outline-none focus:border-indigo-500"
                                                        placeholder="FENRIR2026"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Icon (Material Icon Name)</label>
                                                <input
                                                    name="icon"
                                                    value={formData.icon}
                                                    onChange={handleFormChange}
                                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                                                    placeholder="e.g. local_offer, payments, celebration"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Status & Global Visibility</label>
                                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/20 border border-slate-800">
                                                    <input
                                                        type="checkbox"
                                                        id="isActive"
                                                        name="isActive"
                                                        checked={formData.isActive}
                                                        onChange={handleFormChange}
                                                        className="h-5 w-5 rounded-lg bg-slate-950 text-indigo-600 outline-none ring-offset-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    />
                                                    <label htmlFor="isActive" className="text-[10px] font-black uppercase tracking-widest text-slate-300 cursor-pointer">
                                                        Enable this offer for all customers
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'RULES' && (
                                        <div className="space-y-6 animate-fadeIn">
                                            {isDiscountVisible && (
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Value Type</label>
                                                        <select
                                                            name="discountType"
                                                            value={formData.discountType}
                                                            onChange={handleFormChange}
                                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                                        >
                                                            <option value="PERCENTAGE">PERCENTAGE (%)</option>
                                                            <option value="FLAT">FLAT AMOUNT (₹)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Discount Value</label>
                                                        <input
                                                            required
                                                            type="number"
                                                            name="discountValue"
                                                            value={formData.discountValue}
                                                            onChange={handleFormChange}
                                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                                            placeholder="20"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Min. Purchase (₹)</label>
                                                    <input
                                                        type="number"
                                                        name="minPurchaseAmount"
                                                        value={formData.minPurchaseAmount}
                                                        onChange={handleFormChange}
                                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                                        placeholder="999"
                                                    />
                                                </div>
                                                {formData.discountType === 'PERCENTAGE' && (
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Cap Discount (₹)</label>
                                                        <input
                                                            type="number"
                                                            name="maxDiscountAmount"
                                                            value={formData.maxDiscountAmount}
                                                            onChange={handleFormChange}
                                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                                            placeholder="500"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Available From</label>
                                                    <input
                                                        type="date"
                                                        name="startDate"
                                                        value={formData.startDate}
                                                        onChange={handleFormChange}
                                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Expires On</label>
                                                    <input
                                                        type="date"
                                                        name="endDate"
                                                        value={formData.endDate}
                                                        onChange={handleFormChange}
                                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Restricted Categories</label>
                                                <input
                                                    name="applicableCategories"
                                                    value={formData.applicableCategories}
                                                    onChange={handleFormChange}
                                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                                    placeholder="T-Shirts, Hoodies (Leave blank for all)"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'PROMO' && (
                                        <div className="space-y-8 animate-fadeIn">
                                            {formData.offerType === 'BUY_X_GET_Y' && (
                                                <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-4">
                                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">BOGO Configuration</h3>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-indigo-300 uppercase">Buy Quantity</label>
                                                            <input
                                                                type="number"
                                                                value={formData.buyXGetYConfig.buyQty}
                                                                onChange={(e) => setFormData({ ...formData, buyXGetYConfig: { ...formData.buyXGetYConfig, buyQty: e.target.value }})}
                                                                className="w-full rounded-xl border border-indigo-500/30 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-indigo-300 uppercase">Get Free Quantity</label>
                                                            <input
                                                                type="number"
                                                                value={formData.buyXGetYConfig.getQty}
                                                                onChange={(e) => setFormData({ ...formData, buyXGetYConfig: { ...formData.buyXGetYConfig, getQty: e.target.value }})}
                                                                className="w-full rounded-xl border border-indigo-500/30 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Public Promotion Banner</label>
                                                    <div 
                                                        onClick={() => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, showBanner: !formData.bannerConfig.showBanner }})}
                                                        className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${formData.bannerConfig.showBanner ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                                    >
                                                        <motion.div 
                                                            animate={{ x: formData.bannerConfig.showBanner ? 24 : 4 }}
                                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                                        />
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {formData.bannerConfig.showBanner && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="space-y-4 overflow-hidden"
                                                        >
                                                            <input
                                                                placeholder="Banner Image URL (e.g. Unsplash URL)"
                                                                value={formData.bannerConfig.imageUrl}
                                                                onChange={(e) => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, imageUrl: e.target.value }})}
                                                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 outline-none"
                                                            />
                                                            <input
                                                                placeholder="Call to Action (e.g. FLASH SALE - 50% OFF)"
                                                                value={formData.bannerConfig.bannerText}
                                                                onChange={(e) => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, bannerText: e.target.value }})}
                                                                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 outline-none"
                                                            />
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Home Page Position</label>
                                                                <select
                                                                    value={formData.bannerConfig.position}
                                                                    onChange={(e) => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, position: e.target.value }})}
                                                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 outline-none"
                                                                >
                                                                    <option value="HERO">HERO SECTION (TOP)</option>
                                                                    <option value="BETWEEN_SECTIONS">MIDDLE (BETWEEN GRIDS)</option>
                                                                    <option value="TOP_GRID">TOP OF PRODUCT GRID</option>
                                                                </select>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Customer Description</label>
                                                <textarea
                                                    required
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleFormChange}
                                                    rows="2"
                                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                                    placeholder="Tell customers what they get with this offer..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 p-6 bg-slate-900 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 rounded-xl border border-slate-800 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] rounded-xl bg-indigo-600 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="mx-auto animate-spin" size={18} /> : (editingOffer ? 'Save Changes' : 'Launch Offer')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
                        >
                            <Trash2 className="text-rose-500 mx-auto mb-4" size={48} />
                            <h2 className="text-xl font-black text-white text-center mb-2 uppercase tracking-tight">Delete Offer?</h2>
                            <p className="text-slate-400 text-center mb-8 font-medium">Are you sure you want to delete <span className="text-white font-bold">"{deleteModal.title}"</span>?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
                                    className="flex-1 rounded-xl border border-slate-800 py-3 text-sm font-bold text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-rose-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
