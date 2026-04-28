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
    Layers,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../../services/categoryService';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentCategory: '',
        displayOrder: 0
    });

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data.data || []);
        } catch (error) {
            console.error("Fetch error:", error);
            showNotification('error', 'Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [categories, searchTerm]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('parentCategory', formData.parentCategory);
        data.append('displayOrder', formData.displayOrder);
        if (image) {
            data.append('image', image);
        }

        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, data);
                showNotification('success', 'Category updated successfully');
            } else {
                await createCategory(data);
                showNotification('success', 'Category created successfully');
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            showNotification('error', error.message || 'Action failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            parentCategory: category.parentCategory?._id || category.parentCategory || '',
            displayOrder: category.displayOrder || 0
        });
        if (category.image) {
            setImagePreview(category.image);
        }
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', parentCategory: '', displayOrder: 0 });
        setImage(null);
        setImagePreview(null);
    };

    const handleDeleteClick = (category) => {
        setDeleteModal({ isOpen: true, id: category._id, name: category.name });
    };

    const confirmDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteCategory(deleteModal.id);
            setCategories(categories.filter(c => c._id !== deleteModal.id));
            showNotification('success', 'Category deleted');
            setDeleteModal({ isOpen: false, id: null, name: '' });
        } catch (error) {
            showNotification('error', error.message || 'Delete failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300">

            {/* Header Area */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 px-8 py-6 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Category Management</h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">Organize your product catalog with taxonomy and hierarchies</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 active:scale-95"
                    >
                        <Plus size={18} />
                        Add Category
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {/* Search Bar */}
                <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="Search categories..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {filteredCategories.length} categories
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Category Details</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Parent</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Order</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Slug</th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <Loader2 size={32} className="mx-auto animate-spin text-indigo-500" />
                                        </td>
                                    </tr>
                                ) : filteredCategories.length > 0 ? (
                                    filteredCategories.map((category) => {
                                        const isSubCategory = !!category.parentCategory;
                                        return (
                                            <tr
                                                key={category._id}
                                                className={`group transition-all duration-200 ${isSubCategory
                                                    ? 'bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                    : 'bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-l-2 border-indigo-400 dark:border-indigo-500/30'
                                                    }`}
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isSubCategory
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                            : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-300 dark:ring-indigo-500/30'
                                                            }`}>
                                                            {isSubCategory ? <ChevronRight size={18} /> : <Layers size={20} />}
                                                        </div>
                                                        <div className={isSubCategory ? "pl-4" : ""}>
                                                            <div className="flex items-center gap-2">
                                                                <p className={`text-sm font-black uppercase tracking-tight ${isSubCategory ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                                    {category.name}
                                                                </p>
                                                                {!isSubCategory && (
                                                                    <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/30">
                                                                        Root
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{category.description || 'No description'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {category.parentCategory ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                                            {category.parentCategory.name || 'Parent'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                                        {category.displayOrder || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{category.slug}</span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEditClick(category)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(category)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500"
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
                                        <td colSpan="5" className="py-20 text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            No categories found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-8 right-8 z-[110] flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-6 shadow-2xl backdrop-blur-xl"
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle2 className="text-emerald-500" />
                        ) : (
                            <AlertCircle className="text-rose-500" />
                        )}
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{notification.message}</span>
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
                            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="border-b border-slate-200 dark:border-slate-800 p-6">
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {editingCategory ? 'Edit Category' : 'New Category'}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Name</label>
                                        <input
                                            required
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500 placeholder:text-slate-400"
                                            placeholder="e.g. Mens T-Shirts"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Hero Background Image</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-24 w-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50">
                                                {imagePreview ? (
                                                    <>
                                                        <img loading="lazy" src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); setImage(null); setImagePreview(null); }}
                                                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-600">
                                                        <ImageIcon size={24} />
                                                        <span className="text-[10px] font-bold uppercase tracking-tighter">No Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="image-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                                                >
                                                    <Plus size={14} />
                                                    {imagePreview ? 'Change Image' : 'Choose Background'}
                                                </label>
                                                <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-600 font-medium italic">Used as background for this category's page</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Parent Category (Optional)</label>
                                        <select
                                            name="parentCategory"
                                            value={formData.parentCategory}
                                            onChange={handleFormChange}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500"
                                        >
                                            <option value="">None</option>
                                            {categories
                                                .filter(c => c._id !== editingCategory?._id)
                                                .map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            rows="3"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500 placeholder:text-slate-400"
                                            placeholder="Briefly describe this category..."
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Display Order</label>
                                        <input
                                            type="number"
                                            name="displayOrder"
                                            value={formData.displayOrder}
                                            onChange={handleFormChange}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500"
                                            placeholder="0"
                                        />
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Lower numbers appear first (e.g. 0, 1, 2...)</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-6 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="mx-auto animate-spin" size={18} /> : (editingCategory ? 'Update' : 'Create')}
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
                            onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl"
                        >
                            <Trash2 className="text-rose-500 mx-auto mb-4" size={48} />
                            <h2 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2 uppercase tracking-tight">Delete Category?</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 font-medium">
                                Are you sure you want to delete <span className="text-slate-900 dark:text-white font-bold">"{deleteModal.name}"</span>?
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
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
