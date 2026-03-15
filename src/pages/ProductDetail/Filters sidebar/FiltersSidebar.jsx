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
  onClear,
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
  return (
    <div className={`${isMobile ? "space-y-10" : "p-5 space-y-10"}`}>
      {!isMobile && (
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Filters</h4>
          <button
            onClick={onClear}
            className="text-[9px] font-black text-accent uppercase tracking-widest hover:text-white transition-all flex items-center gap-2 group"
          >
            <span className="w-1 h-1 bg-accent rounded-full group-hover:bg-white transition-colors"></span>
            Reset
          </button>
        </div>
      )}

      {/* CATEGORY FILTER */}
      {onCategoryChange && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-white/5 pb-8">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90 group-hover:text-accent transition-colors">Category</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.category ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`space-y-3 transition-all duration-300 overflow-hidden ${activeSections.category ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {["T-Shirts", "Jeans", "Hoodies", "Shirts", "Jackets", "Trousers"].map(cat => (
              <label key={cat} className="flex items-center group cursor-pointer py-1">
                <input
                  type="radio"
                  name="category"
                  className="hidden"
                  checked={filters?.category === cat.toLowerCase()}
                  onChange={() => onCategoryChange(cat.toLowerCase())}
                />
                <div
                  className={`w-4 h-4 border rounded-full transition-all flex items-center justify-center mr-4 ${filters?.category === cat.toLowerCase()
                    ? "border-accent"
                    : "border-white/20 group-hover:border-white/40"
                    }`}
                >
                  {filters?.category === cat.toLowerCase() && (
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filters?.category === cat.toLowerCase() ? "text-white" : "text-white/40 group-hover:text-white/80"
                    }`}
                >
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* BRAND FILTER */}
      {onBrandChange && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-white/5 pb-8">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90 group-hover:text-accent transition-colors">Brand</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.brand ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`space-y-3 transition-all duration-300 overflow-hidden ${activeSections.brand ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {["GEN-Z", "STREET", "LUXE", "CORE"].map(brand => (
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
                    : "bg-white/5 border-white/20 group-hover:border-white/40"
                    }`}
                >
                  {(filters?.brand || []).includes(brand) && (
                    <span className="material-symbols-outlined text-[12px] text-black font-black">check</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${(filters?.brand || []).includes(brand) ? "text-white" : "text-white/40 group-hover:text-white/80"
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
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-white/5 pb-8">
          <button
            onClick={() => toggleSection('fit')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90 group-hover:text-accent transition-colors">Fit</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.fit ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`space-y-3 transition-all duration-300 overflow-hidden ${activeSections.fit ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {availableFits.map(fit => (
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
                    : "bg-white/5 border-white/20 group-hover:border-white/40"
                    }`}
                >
                  {(filters?.fit || []).includes(fit.toLowerCase()) && (
                    <span className="material-symbols-outlined text-[12px] text-black font-black">check</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${(filters?.fit || []).includes(fit.toLowerCase()) ? "text-white" : "text-white/40 group-hover:text-white/80"
                    }`}
                >
                  {fit}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* COLOR FILTER */}
      {onColorChange && availableColors.length > 0 && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-white/5 pb-8">
          <button
            onClick={() => toggleSection('color')}
            className="w-full flex items-center justify-between mb-6 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90 group-hover:text-accent transition-colors">Color</span>
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.color ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`grid grid-cols-5 gap-4 transition-all duration-300 overflow-hidden ${activeSections.color ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {availableColors.map(color => (
              <button
                key={color.name}
                onClick={() => onColorChange(color.name)}
                className="group/color relative flex flex-col items-center gap-2"
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${filters?.color === color.name
                    ? "border-accent scale-110 shadow-[0_0_15px_rgba(197,160,89,0.4)]"
                    : "border-white/10 group-hover/color:border-white/30"
                    }`}
                  style={{ backgroundColor: color.hexCode.startsWith('#') ? color.hexCode : `#${color.hexCode}` }}
                >
                  {filters?.color === color.name && (
                    <span className="material-symbols-outlined text-[14px] text-white drop-shadow-md">check</span>
                  )}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${filters?.color === color.name ? "text-accent" : "text-white/30 group-hover/color:text-white/60"}`}>
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SIZE FILTER */}
      <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-white/5 pb-8">
        <button
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between mb-6 group"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90 group-hover:text-accent transition-colors">Size</span>
          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${activeSections.size ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <div className={`grid grid-cols-4 gap-2 transition-all duration-300 overflow-hidden ${activeSections.size ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {(availableSizes.length > 0 ? availableSizes : ["S", "M", "L", "XL", "2XL"]).map(size => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`h-12 flex items-center justify-center text-[10px] font-black transition-all border ${filters?.sizes?.includes(size)
                ? "bg-accent border-accent text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]"
                : "bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:text-white"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* SORT FILTER */}
      {onSortChange && (
        <div className="transition-all duration-300 ease mb-6 last:border-b-0 border-b border-white/5 pb-8">
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
                className={`w-full text-left py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${filters?.sort === option.value ? "text-accent" : "text-white/40 hover:text-white/80"}`}
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
              <div className="relative h-1 bg-white/10 rounded-full mb-8">
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
                  <span className="text-[8px] text-white/20 uppercase font-black tracking-widest mb-1">Min</span>
                  <span className="text-[13px] font-impact text-white/60">₹0</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[8px] text-white/20 uppercase font-black tracking-widest mb-1">Max</span>
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
