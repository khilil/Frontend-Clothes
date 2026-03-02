import { CartProvider } from "./context/CartContext";
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
        <SmoothScroll />
        <AppRoutes />
      </CartProvider>
    </>
  );
}

export default App;
