import React, { useState, useEffect } from 'react';
import { getAllCategories } from '../../../../services/categoryService';
import { Loader2, X, Search, CheckCircle2 } from 'lucide-react';

const ProductInfo = ({ data, onChange }) => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const res = await getAllCategories();
                setCategories(res.data || []);
            } catch (err) {
                console.error("Failed to load categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCategoryToggle = (categoryName) => {
        const currentCategories = Array.isArray(data.categories) ? data.categories : [];
        let newCategories;
        if (currentCategories.includes(categoryName)) {
            newCategories = currentCategories.filter(c => c !== categoryName);
        } else {
            newCategories = [...currentCategories, categoryName];
        }
        onChange('categories', newCategories);
    };

    const removeCategory = (categoryName) => {
        const currentCategories = Array.isArray(data.categories) ? data.categories : [];
        const newCategories = currentCategories.filter(c => c !== categoryName);
        onChange('categories', newCategories);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-slate-800 px-6 py-5">
                <h2 className="text-lg font-bold text-white">Product Information</h2>
            </div>
            <div className="grid gap-6 p-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-semibold text-slate-400">Product Title</label>
                    <input
                        type="text"
                        id="title"
                        placeholder="e.g. Premium Cotton Oversized T-shirt"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-600"
                        value={data.title}
                        onChange={(e) => onChange('title', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="slug" className="text-sm font-semibold text-slate-400">Slug (Auto-generated)</label>
                        <div className="flex overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                            <span className="flex items-center px-4 text-xs font-medium text-slate-500 select-none">myshop.com/products/</span>
                            <input
                                type="text"
                                id="slug"
                                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:bg-slate-900/50"
                                value={data.slug}
                                onChange={(e) => onChange('slug', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="productType" className="text-sm font-semibold text-slate-400">Product Type</label>
                        <select
                            id="productType"
                            required
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                            value={data.productType || ''}
                            onChange={(e) => onChange('productType', e.target.value)}
                        >
                            <option value="" disabled className="bg-slate-900 text-slate-500">Select Type</option>
                            <option value="tshirt" className="bg-slate-900">T-Shirt</option>
                            <option value="jeans" className="bg-slate-900">Jeans</option>
                            <option value="hoodie" className="bg-slate-900">Hoodie</option>
                            <option value="shirt" className="bg-slate-900">Shirt</option>
                            <option value="jacket" className="bg-slate-900">Jacket</option>
                            <option value="trousers" className="bg-slate-900">Trousers</option>
                            <option value="cargo" className="bg-slate-900">Cargo</option>
                            <option value="blazer" className="bg-slate-900">Blazer</option>
                            <option value="shorts" className="bg-slate-900">Shorts</option>
                            <option value="sweater" className="bg-slate-900">Sweater</option>
                            <option value="joggers" className="bg-slate-900">Joggers</option>
                            <option value="shoes" className="bg-slate-900">Shoes</option>
                            <option value="accessory" className="bg-slate-900">Accessory</option>
                            <option value="other" className="bg-slate-900">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="brand" className="text-sm font-semibold text-slate-400">Brand</label>
                        <input
                            type="text"
                            id="brand"
                            placeholder="Brand Name"
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-600"
                            value={data.brand}
                            onChange={(e) => onChange('brand', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-400">Categories</label>
                            {loadingCategories && <Loader2 size={14} className="animate-spin text-indigo-500" />}
                        </div>

                        {/* Searchable Multi-select Input */}
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex min-h-[46px] w-full flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm transition-all cursor-pointer ${isDropdownOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'hover:border-slate-700'}`}
                            >
                                {data.categories && data.categories.length > 0 ? (
                                    data.categories.map((catName) => (
                                        <span
                                            key={catName}
                                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-400 shadow-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {catName}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeCategory(catName);
                                                }}
                                                className="hover:text-white transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-600 self-center">Select categories...</span>
                                )}
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2">
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Search categories..."
                                                className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                            {filteredCategories.length === 0 ? (
                                                <div className="py-8 text-center text-xs text-slate-500">
                                                    No results found for "{searchTerm}"
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-1">
                                                    {filteredCategories.map((cat) => {
                                                        const isSelected = data.categories?.includes(cat.name);
                                                        return (
                                                            <button
                                                                key={cat._id}
                                                                type="button"
                                                                onClick={() => handleCategoryToggle(cat.name)}
                                                                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all ${isSelected
                                                                    ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                                                                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                                                                    }`}
                                                            >
                                                                <span>{cat.name}</span>
                                                                {isSelected && <CheckCircle2 size={14} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="gender" className="text-sm font-semibold text-slate-400">Gender</label>
                        <select
                            id="gender"
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                            value={data.gender}
                            onChange={(e) => onChange('gender', e.target.value)}
                        >
                            <option value="unisex" className="bg-slate-900">Unisex</option>
                            <option value="men" className="bg-slate-900">Men</option>
                            <option value="women" className="bg-slate-900">Women</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="material" className="text-sm font-semibold text-slate-400">Fabric / Material</label>
                        <input
                            type="text"
                            id="material"
                            placeholder="e.g. 100% Organic Cotton"
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-600"
                            value={data.material}
                            onChange={(e) => onChange('material', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="shortDescription" className="text-sm font-semibold text-slate-400">Short Description</label>
                    <textarea
                        id="shortDescription"
                        rows="2"
                        placeholder="A brief summary for product cards..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none placeholder:text-slate-600"
                        value={data.shortDescription}
                        onChange={(e) => onChange('shortDescription', e.target.value)}
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label htmlFor="composition" className="text-sm font-semibold text-slate-400">Composition & Care</label>
                    <textarea
                        id="composition"
                        rows="2"
                        placeholder="e.g. 100% Organic Cotton. Cold wash only..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none placeholder:text-slate-600"
                        value={data.composition || ''}
                        onChange={(e) => onChange('composition', e.target.value)}
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label htmlFor="shippingInfo" className="text-sm font-semibold text-slate-400">Global Shipping Info</label>
                    <textarea
                        id="shippingInfo"
                        rows="2"
                        placeholder="e.g. Ships within 24-48 hours..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none placeholder:text-slate-600"
                        value={data.shippingInfo || ''}
                        onChange={(e) => onChange('shippingInfo', e.target.value)}
                    ></textarea>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400">Full Description (Rich Text)</label>
                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                        <div className="flex gap-2 border-b border-slate-800 bg-slate-900/50 p-2">
                            <button type="button" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-indigo-400 shadow-sm transition-all hover:bg-indigo-500/10 hover:border-indigo-500/30">B</button>
                            <button type="button" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs italic text-slate-400 shadow-sm transition-all hover:bg-slate-700 hover:text-white">I</button>
                            <button type="button" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs underline text-slate-400 shadow-sm transition-all hover:bg-slate-700 hover:text-white">U</button>
                            <div className="w-px bg-slate-800 mx-1"></div>
                            <button type="button" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-400 shadow-sm transition-all hover:bg-slate-700 hover:text-white">List</button>
                            <button type="button" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-400 shadow-sm transition-all hover:bg-slate-700 hover:text-white">Link</button>
                        </div>
                        <textarea
                            rows="6"
                            placeholder="Describe your product in detail..."
                            className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none transition-all resize-none placeholder:text-slate-600"
                            value={data.fullDescription}
                            onChange={(e) => onChange('fullDescription', e.target.value)}
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;
