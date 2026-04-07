import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
export default function FiltersSidebar({
  filters,
  onSizeChange,
  onBrandChange,
  onFitChange,
  onPriceChange,
  onColorChange,
  onCategoryChange,
  onSortChange,
  onCustomizableChange,
  onClear,
  availableCategories = [],
  availableBrands = [],
  availableSizes = [],
  availableFits = [],
  availableColors = [],
  maxPrice = 1000,
  isMobile = false
}) {
  const [activeSections, setActiveSections] = useState({
    category: true,
    brand: true,
    fit: true,
    color: true,
    size: true,
    price: true,
    sort: true
  });

  const toggleSection = (section) => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price-low-high" },
    { label: "Price: High to Low", value: "price-high-low" }
  ];

  const bottomwearKeywords = ['jean', 'trouser', 'pant', 'short', 'cargo', 'bottom', 'lower'];
  
  const isSelectedCategoryBottomwear = bottomwearKeywords.some(kw => 
    filters?.category?.toLowerCase()?.includes(kw)
  );
  
  const isSelectedCategoryTopwear = filters?.category && 
    filters.category !== 'all' && 
    !isSelectedCategoryBottomwear;

  // Improved visibility flags for category sections
  const showTopwear = !isSelectedCategoryBottomwear || filters?.category === 'all' || filters?.category === 'clothing';
  const showBottomwear = isSelectedCategoryBottomwear || filters?.category === 'all' || filters?.category === 'clothing';

  return (
    <div className={`${isMobile ? "space-y-10" : "p-5 space-y-10"}`}>
      {!isMobile && (
        <div className="flex items-center justify-between border-b border-border-subtle pb-6 mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-primary">Filters</h4>
          <button
            onClick={onClear}
            className="text-[9px] font-black text-accent uppercase tracking-widest hover:text-text-primary transition-all flex items-center gap-2 group"
          >
            <span className="w-1 h-1 bg-accent rounded-full group-hover:bg-text-primary transition-colors"></span>
            Reset
          </button>
        </div>
      )}

      {/* CUSTOMIZABLE TOGGLE */}
      {filters && typeof filters.isCustomizable !== 'undefined' && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-border-subtle pb-8">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-primary group-hover:text-accent transition-colors">
              Customizable Only
            </span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={filters.isCustomizable || false}
                onChange={(e) => {
                  if (onCustomizableChange) {
                      onCustomizableChange(e.target.checked);
                  }
                }}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${filters.isCustomizable ? 'bg-accent' : 'bg-secondary border border-border-subtle'}`}></div>
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.isCustomizable ? 'translate-x-4 bg-background' : ''}`}></div>
            </div>
          </label>
        </div>
      )}

      {/* CATEGORY FILTER */}
      {(onCategoryChange && availableCategories.length > 0) && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-border-subtle pb-8">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-primary group-hover:text-accent transition-colors">Category</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.category ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`space-y-6 transition-all duration-300 overflow-hidden ${activeSections.category ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <label className="flex items-center group cursor-pointer py-1">
              <input
                type="radio"
                name="category"
                className="hidden"
                checked={filters?.category === 'all'}
                onChange={() => onCategoryChange('all')}
              />
              <div
                className={`w-4 h-4 border rounded-full transition-all flex items-center justify-center mr-4 ${filters?.category === 'all'
                  ? "border-accent"
                  : "border-border-subtle group-hover:border-accent"
                  }`}
              >
                {filters?.category === 'all' && (
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                )}
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filters?.category === 'all' ? "text-text-primary" : "text-text-secondary/60 group-hover:text-text-primary"
                  }`}
              >
                All Products
              </span>
            </label>

            {/* Topwear Categories */}
            {(showTopwear && availableCategories.filter(cat => !bottomwearKeywords.some(id => (typeof cat === 'string' ? cat : cat.name).toLowerCase().includes(id))).length > 0) && (
              <div className="space-y-3 pl-2">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-1 block">Topwear</span>
                {availableCategories.filter(cat => !bottomwearKeywords.some(id => (typeof cat === 'string' ? cat : cat.name).toLowerCase().includes(id))).map(cat => {
                  const catName = typeof cat === 'string' ? cat : cat.name;
                  const catSlug = typeof cat === 'string' ? cat.toLowerCase() : (cat.slug || cat.name.toLowerCase());
                  return (
                    <label key={catSlug} className="flex items-center group cursor-pointer py-1">
                      <input
                        type="radio"
                        name="category"
                        className="hidden"
                        checked={filters?.category === catSlug}
                        onChange={() => onCategoryChange(catSlug)}
                      />
                      <div
                        className={`w-4 h-4 border rounded-full transition-all flex items-center justify-center mr-4 ${filters?.category === catSlug
                          ? "border-accent"
                          : "border-border-subtle group-hover:border-accent"
                          }`}
                      >
                        {filters?.category === catSlug && (
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filters?.category === catSlug ? "text-text-primary" : "text-text-secondary/60 group-hover:text-text-primary"
                          }`}
                      >
                        {catName}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Bottomwear Categories */}
            {(showBottomwear && availableCategories.filter(cat => bottomwearKeywords.some(id => (typeof cat === 'string' ? cat : cat.name).toLowerCase().includes(id))).length > 0) && (
              <div className="space-y-3 pl-2">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-1 block">Bottomwear</span>
                {availableCategories.filter(cat => bottomwearKeywords.some(id => (typeof cat === 'string' ? cat : cat.name).toLowerCase().includes(id))).map(cat => {
                  const catName = typeof cat === 'string' ? cat : cat.name;
                  const catSlug = typeof cat === 'string' ? cat.toLowerCase() : (cat.slug || cat.name.toLowerCase());
                  return (
                    <label key={catSlug} className="flex items-center group cursor-pointer py-1">
                      <input
                        type="radio"
                        name="category"
                        className="hidden"
                        checked={filters?.category === catSlug}
                        onChange={() => onCategoryChange(catSlug)}
                      />
                      <div
                        className={`w-4 h-4 border rounded-full transition-all flex items-center justify-center mr-4 ${filters?.category === catSlug
                          ? "border-accent"
                          : "border-border-subtle group-hover:border-accent"
                          }`}
                      >
                        {filters?.category === catSlug && (
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filters?.category === catSlug ? "text-text-primary" : "text-text-secondary/60 group-hover:text-text-primary"
                          }`}
                      >
                        {catName}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BRAND FILTER */}
      {(onBrandChange && availableBrands.length > 0) && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-border-subtle pb-8">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-primary group-hover:text-accent transition-colors">Brand</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.brand ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`space-y-3 transition-all duration-300 overflow-hidden ${activeSections.brand ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center group cursor-pointer py-1">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={(filters?.brand || []).includes(brand)}
                  onChange={() => onBrandChange(brand)}
                />
                <div
                  className={`w-4 h-4 border transition-all flex items-center justify-center mr-4 ${(filters?.brand || []).includes(brand)
                    ? "bg-accent border-accent"
                    : "bg-secondary border-border-subtle group-hover:border-accent"
                    }`}
                >
                  {(filters?.brand || []).includes(brand) && (
                    <span className="material-symbols-outlined text-[12px] text-background font-black">check</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${(filters?.brand || []).includes(brand) ? "text-text-primary" : "text-text-secondary/60 group-hover:text-text-primary"
                    }`}
                >
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FIT FILTER */}
      {onFitChange && availableFits.length > 0 && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-border-subtle pb-8">
          <button
            onClick={() => toggleSection('fit')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-primary group-hover:text-accent transition-colors">Fit / Style</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.fit ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`space-y-6 transition-all duration-300 overflow-hidden ${activeSections.fit ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {/* Topwear Fits */}
            {(showTopwear && availableFits.filter(f => !bottomwearKeywords.some(id => f.toLowerCase().includes(id))).length > 0) && (
              <div className="space-y-3">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-2 block">Topwear</span>
                {availableFits.filter(f => !bottomwearKeywords.some(id => f.toLowerCase().includes(id))).map(fit => (
                  <label key={fit} className="flex items-center group cursor-pointer py-1">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={(filters?.fit || []).includes(fit.toLowerCase())}
                      onChange={() => onFitChange(fit.toLowerCase())}
                    />
                    <div
                      className={`w-4 h-4 border transition-all flex items-center justify-center mr-4 ${(filters?.fit || []).includes(fit.toLowerCase())
                        ? "bg-accent border-accent"
                        : "bg-secondary border-border-subtle group-hover:border-accent"
                        }`}
                    >
                      {(filters?.fit || []).includes(fit.toLowerCase()) && (
                        <span className="material-symbols-outlined text-[12px] text-background font-black">check</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest transition-colors ${(filters?.fit || []).includes(fit.toLowerCase()) ? "text-text-primary" : "text-text-secondary/60 group-hover:text-text-primary"
                        }`}
                    >
                      {fit}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Bottomwear Fits */}
            {(showBottomwear && availableFits.filter(f => bottomwearKeywords.some(id => f.toLowerCase().includes(id))).length > 0) && (
              <div className="space-y-3">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-2 block">Bottomwear</span>
                {availableFits.filter(f => bottomwearKeywords.some(id => f.toLowerCase().includes(id))).map(fit => (
                  <label key={fit} className="flex items-center group cursor-pointer py-1">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={(filters?.fit || []).includes(fit.toLowerCase())}
                      onChange={() => onFitChange(fit.toLowerCase())}
                    />
                    <div
                      className={`w-4 h-4 border transition-all flex items-center justify-center mr-4 ${(filters?.fit || []).includes(fit.toLowerCase())
                        ? "bg-accent border-accent"
                        : "bg-secondary border-border-subtle group-hover:border-accent"
                        }`}
                    >
                      {(filters?.fit || []).includes(fit.toLowerCase()) && (
                        <span className="material-symbols-outlined text-[12px] text-background font-black">check</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest transition-colors ${(filters?.fit || []).includes(fit.toLowerCase()) ? "text-text-primary" : "text-text-secondary/60 group-hover:text-text-primary"
                        }`}
                    >
                      {fit}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COLOR FILTER */}
      {onColorChange && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-border-subtle pb-8">
          <button
            onClick={() => toggleSection('color')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-primary group-hover:text-accent transition-colors">Color</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.color ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`space-y-6 transition-all duration-300 overflow-hidden ${activeSections.color ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {/* Topwear Colors */}
            {showTopwear && (availableColors?.top?.length > 0 || Array.isArray(availableColors)) && (
              <div className="space-y-3">
                {showBottomwear && <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-2 block">Topwear</span>}
                <div className="grid grid-cols-5 gap-4">
                  {(Array.isArray(availableColors) ? availableColors : (availableColors.top || [])).map(color => (
                    <button
                      key={color.id}
                      onClick={() => onColorChange(color.id)}
                      className="group/color relative flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${filters?.color === color.id
                          ? "border-accent scale-110 shadow-[0_0_15px_rgba(184,134,11,0.4)]"
                          : "border-border-subtle group-hover/color:border-accent"
                          }`}
                        style={{ background: color.hex }}
                      >
                        {filters?.color === color.id && (
                          <span className="material-symbols-outlined text-[14px] text-white drop-shadow-md">check</span>
                        )}
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${filters?.color === color.id ? "text-accent" : "text-text-secondary/60 group-hover/color:text-accent"}`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottomwear Colors */}
            {(showBottomwear && (availableColors?.bottom?.length > 0)) && (
                <div className="space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-2 block">
                        {(showTopwear || filters?.category === 'all') ? "Bottomwear" : "Available Colors"}
                    </span>
                    <div className="grid grid-cols-5 gap-4">
                        {(availableColors.bottom || []).map(color => (
                            <button
                                key={color.id}
                                onClick={() => onColorChange(color.id)}
                                className="group/color relative flex flex-col items-center gap-2"
                            >
                                <div
                                    className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${filters?.color === color.id
                                        ? "border-accent scale-110 shadow-[0_0_15px_rgba(184,134,11,0.4)]"
                                        : "border-border-subtle group-hover/color:border-accent"
                                        }`}
                                    style={{ background: color.hex }}
                                >
                                    {filters?.color === color.id && (
                                        <span className="material-symbols-outlined text-[14px] text-white drop-shadow-md">check</span>
                                    )}
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${filters?.color === color.id ? "text-accent" : "text-text-secondary/60 group-hover/color:text-accent"}`}>
                                    {color.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      )}

      {/* SIZE FILTER */}
      <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-border-subtle pb-8">
        <button
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between mb-6 group"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-text-primary group-hover:text-accent transition-colors">Size</span>
          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.size ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <div className={`space-y-6 transition-all duration-300 overflow-hidden ${activeSections.size ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {/* Topwear Sizes */}
          {(showTopwear && availableSizes.filter(s => isNaN(s) || s.match(/^[XSML]+$/i)).length > 0) && (
            <div className="space-y-3">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-2 block">Topwear</span>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.filter(s => isNaN(s) || s.match(/^[XSML]+$/i)).map(size => (
                  <button
                    key={size}
                    onClick={() => onSizeChange(size)}
                    className={`h-12 flex items-center justify-center text-[10px] font-black transition-all border ${filters?.sizes?.includes(size) || filters?.size === size
                      ? "bg-accent border-accent text-background shadow-[0_0_20px_rgba(184,134,11,0.3)]"
                      : "bg-secondary border-border-subtle text-text-secondary hover:border-accent hover:text-text-primary"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottomwear Sizes */}
          {(showBottomwear && availableSizes.filter(s => !isNaN(s) && !s.match(/^[XSML]+$/i)).length > 0) && (
            <div className="space-y-3">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-2 block">Bottomwear</span>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.filter(s => !isNaN(s) && !s.match(/^[XSML]+$/i)).map(size => (
                  <button
                    key={size}
                    onClick={() => onSizeChange(size)}
                    className={`h-12 flex items-center justify-center text-[10px] font-black transition-all border ${filters?.sizes?.includes(size) || filters?.size === size
                      ? "bg-accent border-accent text-background shadow-[0_0_20px_rgba(184,134,11,0.3)]"
                      : "bg-secondary border-border-subtle text-text-secondary hover:border-accent hover:text-text-primary"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SORT FILTER */}
      {onSortChange && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-border-subtle pb-8">
          <button
            onClick={() => toggleSection('sort')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90 group-hover:text-accent transition-colors">Sort By</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.sort ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`space-y-3 transition-all duration-300 overflow-hidden ${activeSections.sort ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={`w-full text-left py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${filters?.sort === option.value ? "text-accent" : "text-text-secondary/60 hover:text-text-primary"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRICE RANGE */}
      <div className="transition-all duration-300 ease mb-6 last:border-b-0">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between mb-8 group"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90 group-hover:text-accent transition-colors">Price Range</span>
          <motion.span
            animate={{ rotate: activeSections.price ? 180 : 0 }}
            className="material-symbols-outlined text-[18px]"
          >
            expand_more
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {activeSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="relative h-1 bg-border-subtle rounded-full mb-8">
                <div
                  className="absolute top-0 left-0 h-full bg-accent"
                  style={{ width: `${(filters.price / maxPrice) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters?.price || maxPrice}
                  onChange={(e) => onPriceChange(Number(e.target.value))}
                  className="absolute top-0 left-0 w-full h-1 bg-transparent appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(197,160,89,0.4)] [&::-webkit-slider-thumb]:-mt-1.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(197,160,89,0.4)]"
                />
              </div>

              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] text-text-secondary/40 uppercase font-black tracking-widest mb-1">Min</span>
                  <span className="text-[13px] font-impact text-text-secondary/60">₹0</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[8px] text-text-secondary/40 uppercase font-black tracking-widest mb-1">Max</span>
                  <span className="text-[13px] font-impact text-accent">₹{filters?.price || maxPrice}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isMobile && (
        <div className="pt-10">
          <button
            onClick={onClear}
            className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
