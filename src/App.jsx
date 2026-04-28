import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OfferProvider } from "./context/OfferContext";

import AppRoutes from "./routes/AppRoutes";
import { store } from "./app/store";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchCurrentUser } from "./features/auth/authSlice";
import SmoothScroll from "./components/common/SmoothScroll";
import { Toaster } from "react-hot-toast";

function App() {

  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <>
      <OfferProvider>

          <CartProvider>
            <WishlistProvider>
              <Toaster position={isMobile ? "top-center" : "top-right"} />
              <SmoothScroll />
              <AppRoutes />
            </WishlistProvider>
          </CartProvider>

      </OfferProvider>
    </>
  );
}

export default App;
