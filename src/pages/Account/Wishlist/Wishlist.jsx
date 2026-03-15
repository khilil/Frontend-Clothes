import React from "react";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import ProductCard from "../../../components/product/ProductCard/ProductCard";
// import { Link } from "react-router-dom";
import { Link } from "react-router-dom";
const Wishlist = () => {
  const { wishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleDeployAll = () => {
    wishlist.forEach(item => {
      const variantId = item.variants?.[0]?.sku || item.variants?.[0]?._id;
      if (variantId) {
        addToCart(item, {
          variantId,
          size: item.variants?.[0]?.size?.name || "N/A",
          color: item.variants?.[0]?.color?.name || "N/A"
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse font-impact text-2xl tracking-[0.3em] uppercase opacity-20 text-black">
          Accessing Archives...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-8">
      {/* 🏛️ ARCHIVES: SAVED PROTOCOLS */}
      <div className="wishlist-header mb-12 md:mb-16 border-b border-black/[0.03] pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div className="pt-4 md:pt-0">
          <h1 className="font-impact text-5xl md:text-6xl uppercase tracking-tight text-black">
            Saved Protocols
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-black/30 mt-4">
            Curated Assets // Future Acquisition Registry ({wishlist.length.toString().padStart(2, '0')})
          </p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={handleDeployAll}
            className="w-full md:w-auto mt-6 md:mt-0 px-4 md:px-10 py-5 bg-black text-white rounded-xl md:rounded-2xl text-[12px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#8b7e6d] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
          >
            Deploy All to Cart
          </button>
        )}
      </div>

      {/* GRID */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-10">
        {wishlist.length > 0 ? (
          wishlist.map((product) => (
            <div key={product._id || product.id} className="group/card relative">
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center border border-dashed border-black/10 rounded-[3rem] bg-black/[0.01]">
            <span className="material-symbols-outlined text-6xl text-black/10 mb-6 animate-pulse">heart_broken</span>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-black/20">Archive currently empty</p>
            <Link to="/shop" className="group/link mt-8 flex items-center gap-3 px-8 py-3 bg-black/5 border border-black/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-black/60 hover:bg-black hover:text-white transition-all">
              Initialize Discovery
              <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>

      {/* LOAD MORE */}
      {wishlist.length > 12 && (
        <div className="mt-20 flex justify-center border-t border-black/[0.03] pt-10">
          <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-black/20 hover:text-black transition-all group">
            Extend Registry
            <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
