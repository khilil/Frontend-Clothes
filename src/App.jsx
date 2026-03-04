import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import AppRoutes from "./routes/AppRoutes";
import { store } from "./app/store";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCurrentUser } from "./features/auth/authSlice";
import SmoothScroll from "./components/common/SmoothScroll";


function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <>
      <CartProvider>
        <WishlistProvider>
          <SmoothScroll />
          <AppRoutes />
        </WishlistProvider>
      </CartProvider>
    </>
  );
}

export default App;
