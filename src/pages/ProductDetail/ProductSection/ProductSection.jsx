import { useCart } from "../../../context/CartContext";
import ProductCard from "../../../components/product/ProductCard/ProductCard";

export default function ProductSection({ products = [], activeColor }) {
  const { addToCart } = useCart();

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-12 py-8 lg:py-12">
      <div className="flex justify-between items-center mb-8 lg:mb-12">
        <p className="text-[9px] lg:text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
          {products.length} artifacts in collection
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.slug || product._id}
            product={product}
            addToCart={addToCart}
            activeColor={activeColor}
          />
        ))}
      </div>
    </div>
  );
}
