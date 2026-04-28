import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ArrowRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CustomToast = ({ t, product, actionType = 'cart' }) => {
  const navigate = useNavigate();
  
  const isCart = actionType === 'cart';
  const productImage = product.image || product.images?.[0]?.url || "/images/product_placeholder.png";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } w-[95vw] sm:max-w-[420px] bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_20px_rgba(184,134,11,0.1)] rounded-2xl pointer-events-auto flex flex-col overflow-hidden mx-auto sm:mx-0`}
    >
      <div className="flex p-3 sm:p-4 gap-4 items-center">
        {/* Product Image */}
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10">
          <img loading="lazy" 
            src={productImage} 
            alt={product.title} 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isCart ? (
              <ShoppingBag className="h-3 w-3 text-accent" />
            ) : (
              <Heart className="h-3 w-3 text-accent" fill="currentColor" />
            )}
            <span className="text-[9px] font-black tracking-[0.2em] text-accent uppercase">
              {isCart ? 'ADDED TO BAG' : 'SAVED TO WISHLIST'}
            </span>
          </div>
          <h4 className="text-[13px] sm:text-[14px] font-bold text-white truncate font-primary uppercase tracking-tight">
            {product.title}
          </h4>
          <p className="text-[10px] text-white/50 font-medium mt-0.5 uppercase tracking-wider">
            {isCart ? 'Ready for checkout' : 'Added to your archive'}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            toast.dismiss(t.id);
            navigate(isCart ? '/cart' : '/account/wishlist');
          }}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent flex items-center justify-center text-primary hover:scale-110 active:scale-90 transition-all shadow-[0_0_15px_rgba(184,134,11,0.4)] group"
        >
          <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Close Link */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="absolute top-2 right-2 p-1 text-white/20 hover:text-white/60 transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress Bar */}
      <div className="h-[2px] w-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: 0 }}
          transition={{ duration: 3.5, ease: 'linear' }}
          className="h-full bg-accent shadow-[0_0_10px_rgba(184,134,11,0.5)]"
        />
      </div>
    </motion.div>
  );
};

export default CustomToast;
