import React from "react";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import ProductCard from "../../../components/product/ProductCard/ProductCard";
import { Link } from "react-router-dom";
import "./Wishlist.css";

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
      <div className="wishlist flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse font-[Oswald] text-2xl tracking-widest uppercase opacity-20">
          Retrieving Archives...
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist">
      {/* 🏛️ ARCHIVES: SAVED PROTOCOLS */}
      <header className="mb-20 border-b-2 border-black pb-8">
        <h1 className="font-[Oswald] text-7xl font-bold uppercase tracking-tighter leading-[0.85]">
          Wishlist
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-4 gap-6">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-black/40">
            Saved Collection & Desired Assets ({wishlist.length})
          </p>
          {wishlist.length > 0 && (
            <button
              onClick={handleDeployAll}
              className="text-[9px] font-black uppercase tracking-widest px-8 py-4 bg-black text-white hover:bg-gray-800 transition-all duration-500 shadow-lg"
            >
              Deploy All to Cart
            </button>
          )}
        </div>
      </header>

      {/* GRID */}
      <div className="wishlist-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wishlist.length > 0 ? (
          wishlist.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <span className="material-symbols-outlined text-5xl text-gray-200 mb-4">heart_broken</span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Your Archives are Empty</p>
            <Link to="/shop" className="text-accent text-[9px] font-black uppercase tracking-widest mt-4 inline-block border-b border-accent/20 pb-1">
              Explore Collection
            </Link>
          </div>
        )}
      </div>

      {/* LOAD MORE */}
      {wishlist.length > 12 && (
        <div className="wishlist-footer">
          <button className="load-more">
            View More from Wishlist
            <span className="material-symbols-outlined">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
