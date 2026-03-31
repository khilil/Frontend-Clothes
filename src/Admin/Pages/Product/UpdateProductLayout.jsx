import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    Search,
    Bell,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Trash2,
    Plus
} from 'lucide-react';
import ProductInfo from './components/ProductInfo';
import Pricing from './components/Pricing';
import Variants from './components/Variants';
import VariantImages from './components/VariantImages';
import { InventorySettings, ProductFlags, SEOSettings } from './components/Settings';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductBySlug, updateProduct } from '../../../services/productService';

// 🗺️ Category to SKU Code Mapping
const CATEGORY_MAP = {
    'tshirt': 'TEE',
    'jeans': 'JN',
    'hoodie': 'HD',
    'shirt': 'SHRT',
    'jacket': 'JKT',
    'trousers': 'TR',
    'cargo': 'CRG',
    'blazer': 'BLZ',
    'shorts': 'SHR',
    'sweater': 'SWTR',
    'joggers': 'JOG',
    'shoes': 'SHOE',
    'accessory': 'ACC',
    'other': 'MISC'
};

// 🏛️ Advanced SKU Generator: [BRAND]-[CAT]-[DESIGN]-[COLOR]-[SIZE]
const generateSKU = (brandCode, category, designId, colorName, sizeName) => {
    const brand = (brandCode || 'FE').toUpperCase();
    const cat = (CATEGORY_MAP[category] || 'GEN').toUpperCase();
    const design = (designId || '01').toString().padStart(2, '0');
    
    // Clean and shorten color/size
    const color = (colorName || '').substring(0, 3).toUpperCase() || 'XXX';
    const size = (sizeName || '').toUpperCase() || 'OS';
    
    return `${brand}-${cat}-${design}-${color}-${size}`;
};

function UpdateProductLayout() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [productId, setProductId] = useState(null);

    const [productData, setProductData] = useState({
        title: '',
        slug: '',
        productType: 'tshirt',
        garmentType: 'top',
        brand: '',
        categories: [],
        gender: 'unisex',
        material: '',
        shortDescription: '',
        fullDescription: '',
        composition: '',
        shippingInfo: '',
        price: '',
        compareAtPrice: '',
        trackInventory: true,
        globalThreshold: 5,
        isActive: true,
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        isOnSale: false,
        isSeasonalSale: false,
        isCustomizable: false,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        brandCode: 'FE',
        designId: '01',
    });

    const [variants, setVariants] = useState([]);
    const [seoExpanded, setSeoExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notification, setNotification] = useState(null);

    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const [sizesRes, colorsRes] = await Promise.all([
                    api.get(`/sizes`),
                    api.get(`/colors`)
                ]);
                setAvailableSizes(sizesRes.data.data || []);
                setAvailableColors(colorsRes.data.data || []);
            } catch (err) {
                console.error("Failed to fetch sizes/colors:", err);
            }
        };
        fetchAttributes();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const data = await getProductBySlug(slug, true);
                const product = data.data || data.product || data;

                setProductId(product._id || product.id);

                setProductData({
                    title: product.title || '',
                    slug: product.slug || '',
                    productType: product.productType || 'tshirt',
                    brand: product.brand || '',
                    categories: Array.isArray(product.categories) ? product.categories : (product.category ? [product.category] : []),
                    gender: product.gender || 'unisex',
                    material: product.material || '',
                    shortDescription: product.shortDescription || '',
                    fullDescription: product.fullDescription || '',
                    composition: product.composition || '',
                    shippingInfo: product.shippingInfo || '',
                    price: product.price || '',
                    compareAtPrice: product.compareAtPrice || '',
                    trackInventory: product.trackInventory ?? true,
                    globalThreshold: product.globalThreshold || 5,
                    isActive: product.isActive ?? true,
                    isFeatured: product.isFeatured ?? false,
                    isNewArrival: product.isNewArrival ?? true,
                    isBestSeller: product.isBestSeller ?? false,
                    isOnSale: product.isOnSale ?? false,
                    isSeasonalSale: product.isSeasonalSale ?? false,
                    isCustomizable: product.isCustomizable ?? false,
                    metaTitle: product.metaTitle || '',
                    metaDescription: product.metaDescription || '',
                    metaKeywords: product.metaKeywords || '',
                    garmentType: product.garmentType || 'top',
                    brandCode: 'FE', // Default
                    designId: '01'   // Default
                });

                // 🧪 Try to parse Brand and Design from existing SKUs
                if (product.variants && product.variants.length > 0) {
                    const firstSku = product.variants[0].sku || '';
                    const parts = firstSku.split('-');
                    if (parts.length >= 3) {
                        setProductData(prev => ({
                            ...prev,
                            brandCode: parts[0],
                            designId: parts[2]
                        }));
                    }
                }

                // Map variants
                if (product.variants && Array.isArray(product.variants)) {
                    setVariants(product.variants.map(v => ({
                        ...v,
                        id: v._id || v.id || Date.now().toString() + Math.random(),
                        size: v.size?._id || v.size, // Handle if populated or not
                        color: v.color?._id || v.color,
                        price: v.price || product.price || 0,
                        stock: v.stock || 0,
                        sku: v.sku || '',
                        isSkuManual: true, // Existing products usually have manual/fixed SKUs
                        isExpanded: false,
                        measurements: {
                            garmentType: v.measurements?.garmentType || product.garmentType || 'top',
                            top: v.measurements?.top || { chest: 0, frontLength: 0, sleeveLength: 0, shoulder: 0, waist: 0, hips: 0, custom: {} },
                            bottom: v.measurements?.bottom || { waist: 0, outseamLength: 0, hips: 0, thigh: 0, inseam: 0, custom: {} }
                        },
                        images: (v.images || []).map(img => ({
                            ...img,
                            id: img._id || img.id || Date.now().toString() + Math.random(),
                            existing: true // CRITICAL: Flag existing variant images
                        }))
                    })));
                }

            } catch (err) {
                console.error("Fetch Product Error:", err);
                showNotification('error', 'Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    // Handlers for Variants (Reused from AddProductLayout)
    const handleAddVariant = () => {
        const newVariant = {
            id: Date.now().toString(),
            size: '',
            color: '',
            sku: '',
            price: productData.price || 0,
            isSkuManual: false,
            images: [],
            stock: 0,
            reservedStock: 0,
            lowStockThreshold: 5,
            allowBackorder: false,
            measurements: {
                garmentType: productData.garmentType || 'top',
                top: { chest: 0, frontLength: 0, sleeveLength: 0, shoulder: 0, waist: 0, hips: 0, custom: {} },
                bottom: { waist: 0, outseamLength: 0, hips: 0, thigh: 0, inseam: 0, custom: {} }
            },
            isExpanded: true
        };
        setVariants([...variants, newVariant]);
    };

    const handleDeleteVariant = (variantId) => {
        setVariants(variants.filter(v => (v.id || v._id) !== variantId));
    };

    const handleVariantChange = (variantId, field, value) => {
        setVariants(variants.map(v => {
            if ((v.id || v._id) === variantId) {
                let updated = { ...v };

                if (field.startsWith('meas_')) {
                    if (field === 'meas_add_custom') {
                        const type = updated.measurements.garmentType;
                        updated.measurements = {
                            ...updated.measurements,
                            [type]: {
                                ...updated.measurements[type],
                                custom: { ...updated.measurements[type].custom, '': '' }
                            }
                        };
                    } else if (field.startsWith('meas_custom_rename_')) {
                        const oldKey = field.replace('meas_custom_rename_', '');
                        const type = updated.measurements.garmentType;
                        const custom = { ...updated.measurements[type].custom };
                        const val = custom[oldKey];
                        delete custom[oldKey];
                        custom[value] = val;
                        updated.measurements = {
                            ...updated.measurements,
                            [type]: { ...updated.measurements[type], custom }
                        };
                    } else if (field.startsWith('meas_custom_val_')) {
                        const key = field.replace('meas_custom_val_', '');
                        const type = updated.measurements.garmentType;
                        updated.measurements = {
                            ...updated.measurements,
                            [type]: {
                                ...updated.measurements[type],
                                custom: { ...updated.measurements[type].custom, [key]: value }
                            }
                        };
                    } else if (field.startsWith('meas_custom_remove_')) {
                        const key = field.replace('meas_custom_remove_', '');
                        const type = updated.measurements.garmentType;
                        const custom = { ...updated.measurements[type].custom };
                        delete custom[key];
                        updated.measurements = {
                            ...updated.measurements,
                            [type]: { ...updated.measurements[type], custom }
                        };
                    } else {
                        const [_, type, mField] = field.split('_');
                        updated.measurements = {
                            ...updated.measurements,
                            [type]: {
                                ...updated.measurements[type],
                                [mField]: value
                            }
                        };
                    }
                } else if (field === 'garmentType') {
                    updated.measurements = {
                        ...updated.measurements,
                        garmentType: value
                    };
                } else {
                    updated[field] = value;
                }

                // 🔄 Auto-generate SKU if not manual
                if ((field === 'size' || field === 'color') && !updated.isSkuManual) {
                    const sizeObj = availableSizes.find(s => s._id === updated.size);
                    const colorObj = availableColors.find(c => c._id === updated.color);
                    updated.sku = generateSKU(
                        productData.brandCode, 
                        productData.productType, 
                        productData.designId, 
                        colorObj?.name, 
                        sizeObj?.name
                    );
                }

                if (field === 'sku') {
                    updated.isSkuManual = true;
                }

                return updated;
            }
            return v;
        }));
    };

    const handleResetSku = (variantId) => {
        setVariants(variants.map(v => {
            if ((v.id || v._id) === variantId) {
                const sizeObj = availableSizes.find(s => s._id === v.size);
                const colorObj = availableColors.find(c => c._id === v.color);
                return {
                    ...v,
                    sku: generateSKU(
                        productData.brandCode, 
                        productData.productType, 
                        productData.designId, 
                        colorObj?.name, 
                        sizeObj?.name
                    ),
                    isSkuManual: false
                };
            }
            return v;
        }));
    };

    const toggleVariantExpand = (variantId) => {
        setVariants(variants.map(v =>
            (v.id || v._id) === variantId ? { ...v, isExpanded: !v.isExpanded } : v
        ));
    };

    const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

    // Handlers for Variant Images
    const handleAddVariantImage = (variantId, files) => {
        const newImages = Array.from(files).map(file => ({
            id: Date.now().toString() + Math.random(),
            file,
            url: URL.createObjectURL(file),
            isPrimary: false,
            existing: false
        }));

        setVariants(variants.map(v => {
            if ((v.id || v._id) === variantId) {
                const combinedImages = [...(v.images || []), ...newImages];
                if ((v.images?.length || 0) === 0 && combinedImages.length > 0) {
                    combinedImages[0].isPrimary = true;
                }
                return { ...v, images: combinedImages };
            }
            return v;
        }));
    };

    const handleDeleteVariantImage = (variantId, imageId) => {
        setVariants(variants.map(v => {
            if ((v.id || v._id) === variantId) {
                return { ...v, images: v.images.filter(img => (img.id || img._id) !== imageId) };
            }
            return v;
        }));
    };

    const handleSetPrimaryVariantImage = (variantId, imageId) => {
        setVariants(variants.map(v => {
            if ((v.id || v._id) === variantId) {
                return {
                    ...v,
                    images: v.images.map(img => ({
                        ...img,
                        isPrimary: (img.id || img._id) === imageId
                    }))
                };
            }
            return v;
        }));
    };

    const handleDataChange = (field, value) => {
        setProductData(prev => {
            const newData = { ...prev, [field]: value };
            // 🔄 Auto-Update Variants if identifying fields change
            if (field === 'brandCode' || field === 'designId' || field === 'productType') {
                setVariants(prevVariants => prevVariants.map(v => {
                    if (v.isSkuManual) return v;
                    const sizeObj = availableSizes.find(s => s._id === v.size);
                    const colorObj = availableColors.find(c => c._id === v.color);
                    return {
                        ...v,
                        sku: generateSKU(
                            field === 'brandCode' ? value : prev.brandCode,
                            field === 'productType' ? value : prev.productType,
                            field === 'designId' ? value : prev.designId,
                            colorObj?.name,
                            sizeObj?.name
                        )
                    };
                }));
            }
            return newData;
        });
    };

    const handleUpdate = async () => {
        // 🔹 Basic Validation
        if (!productData.title || !productData.slug || !productData.price) {
            showNotification('error', 'Title, Slug and Price are required');
            return;
        }

        if (variants.length > 0) {
            const invalidVariant = variants.find(v => !v.size || !v.color || !v.sku);
            if (invalidVariant) {
                showNotification('error', 'All variants must have a Size, Color, and SKU');
                return;
            }
        }

        setIsUpdating(true);
        try {
            const formData = new FormData();

            // Append basic data
            Object.keys(productData).forEach(key => {
                if (productData[key] !== undefined && productData[key] !== null) {
                    if (Array.isArray(productData[key])) {
                        formData.append(key, JSON.stringify(productData[key]));
                    } else if (key === 'categories') {
                        formData.append('categories', JSON.stringify(productData.categories || []));
                    } else {
                        formData.append(key, productData[key]);
                    }
                }
            });

            // Map variants for partial update
            const variantsMetadata = variants.map(v => {
                // Sort images: primary image first
                const sortedImages = [...(v.images || [])].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
                const newImages = sortedImages.filter(img => !img.existing && img.file) || [];

                return {
                    id: v._id || v.id,
                    size: v.size,
                    color: v.color,
                    sku: v.sku,
                    stock: v.stock,
                    price: v.price,
                    reservedStock: v.reservedStock,
                    lowStockThreshold: v.lowStockThreshold,
                    allowBackorder: v.allowBackorder,
                    measurements: v.measurements,
                    existingImages: sortedImages.filter(img => img.existing).map(img => ({ url: (img.url || img.preview), isPrimary: img.isPrimary })) || [],
                    newImageCount: newImages.length
                };
            });
            formData.append('variants', JSON.stringify(variantsMetadata));

            // Append new variant images in sorted order
            variants.forEach(v => {
                const sortedImages = [...(v.images || [])].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
                sortedImages.forEach(img => {
                    if (!img.existing && img.file) {
                        formData.append('variantImages', img.file);
                    }
                });
            });

            // DEBUG: Log FormData entries
            for (let [key, value] of formData.entries()) {
                console.log(`📤 FormData [${key}]:`, value instanceof File ? `File: ${value.name}` : value);
            }

            await updateProduct(productId, formData);
            showNotification('success', 'Product updated successfully!');
            setTimeout(() => navigate('/admin/products'), 1500);

        } catch (error) {
            console.error("Update Error:", error);
            showNotification('error', error.response?.data?.message || "Failed to update product");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-indigo-500" />
                    <p className="text-sm font-bold text-slate-400">Loading product details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            <main className="flex-1">
                <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-8 py-5">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <nav className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span onClick={() => navigate('/admin/products')} className="hover:text-slate-300 cursor-pointer transition-colors">Products</span>
                                <ChevronRight size={12} />
                                <span className="text-slate-300">Edit Product</span>
                            </nav>
                            <h1 className="text-2xl font-bold text-white">Edit: {productData.title}</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
                                <Bell size={20} />
                            </button>
                            <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-700 ring-1 ring-slate-800"></div>
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-8">
                                <ProductInfo data={productData} onChange={handleDataChange} />
                                <Variants
                                    variants={variants}
                                    productType={productData.productType}
                                    onAdd={handleAddVariant}
                                    onDelete={handleDeleteVariant}
                                    onChange={handleVariantChange}
                                    onResetSku={handleResetSku}
                                    onToggleExpand={toggleVariantExpand}
                                    availableSizes={availableSizes}
                                    availableColors={availableColors}
                                    garmentType={productData.garmentType}
                                    onGarmentTypeChange={(val) => handleDataChange('garmentType', val)}
                                />
                                <VariantImages
                                    variants={variants}
                                    onAddImage={handleAddVariantImage}
                                    onDeleteImage={handleDeleteVariantImage}
                                    onSetPrimary={handleSetPrimaryVariantImage}
                                    availableSizes={availableSizes}
                                    availableColors={availableColors}
                                />
                            </div>

                            <div className="space-y-8">
                                <Pricing data={productData} onChange={handleDataChange} />
                                <InventorySettings
                                    data={productData}
                                    onChange={handleDataChange}
                                    totalStock={totalStock}
                                />
                                <ProductFlags data={productData} onChange={handleDataChange} />
                                <SEOSettings
                                    data={productData}
                                    onChange={handleDataChange}
                                    isExpanded={seoExpanded}
                                    onToggle={() => setSeoExpanded(!seoExpanded)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-0 right-0 z-50 w-full border-t border-slate-800 bg-slate-900 p-4 lg:left-64 lg:w-[calc(100%-16rem)] shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <button onClick={() => navigate('/admin/products')} className="px-6 py-2.5 text-sm font-semibold text-slate-400 transition-all hover:text-white">
                        Cancel
                    </button>
                    <div className="flex gap-4">
                        <button
                            disabled={isUpdating}
                            className={`rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/40 flex items-center gap-2 ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={handleUpdate}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 right-8 z-[100] flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 pr-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
                    >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">
                                {notification.type === 'success' ? 'Success!' : 'Error'}
                            </span>
                            <span className="text-xs text-slate-400">{notification.message}</span>
                        </div>
                        <button onClick={() => setNotification(null)} className="ml-4 text-slate-500 transition-colors hover:text-white">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UpdateProductLayout;
