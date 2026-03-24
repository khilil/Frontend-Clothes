import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import CategoryPage from "../pages/Category/CategoryPage";
import ProductListing from "../pages/ProductDetail/ProductListing";
import Checkout from "../pages/Checkout/Checkout";
import CheckoutDetails from "../pages/Checkout/CheckoutDetails";
import CartPage from "../pages/Cart/CartPage";
import AccountLayout from "../pages/Account/AccountLayout/AccountLayout";
import Orders from "../pages/Account/Orders";
import Dashboard from "../pages/Account/Dashboard/Dashboard";
import Wishlist from "../pages/Account/Wishlist/Wishlist";
import Addresses from "../pages/Account/Addresses/Addresses";
import Profile from "../pages/Account/Profile/Profile";
import OrderDetails from "../pages/Account/OrderDetails";
import About from "../pages/About";
import ContactUs from "../pages/ContactUs";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import ProductDetailPage from "../pages/ProductDetail/ProductDetailPage/ProductDetailPage";
import CustomizePage from "../pages/CustomizeShopPage/CustomizePage";
import TextEditorPage from "../pages/CustomizeShopPage/TextEditorPage";
import ShapeEditorPage from "../pages/CustomizeShopPage/ShapeEditorPage";
import CustomizeEditorLayout from "../pages/CustomizeShopPage/layouts/CustomizeEditorLayout";
import GraphicsEditorPage from "../pages/CustomizeShopPage/GraphicsEditorPage";
import PreviewPage from "../pages/CustomizeShopPage/components/Preview/PreviewPage";
import AdminLayout from "../Admin/AdminLayout";
import AdminDashboard from "../Admin/AdminDashboard";
import Inventory from "../Admin/Pages/Inventory/AdminInventory";
import MainLayout from "../pages/MainLayout";
import AdminProducts from "../Admin/Pages/Product/AdminProducts";
import ProductDetailsPage from "../Admin/Pages/Product/ProductDetailsPage";
import OrderManagement from "../Admin/Pages/Orders/OrderManagement";
import AdminOrderDetails from "../Admin/Pages/Orders/AdminOrderDetails";
import AdminCustomers from "../Admin/Pages/Customer/AdminCustomers";
import AdminCustomerDetail from "../Admin/Pages/Customer/AdminCustomerDetail";
import AdminAnalytics from "../Admin/Pages/Analytics/AdminAnalytics";
import AdminCategories from "../Admin/Pages/Category/AdminCategories";
import LoginAuth from "../Auth/Login";
import ForgotPassword from "../Auth/ForgotPassword";
import ResetPassword from "../Auth/ResetPassword";
import ProtectedRoute from "../components/ProtectedRoute";
// import AddProductPage from "../Admin/Pages/Product/ProductDetailsPage";
import AddProductLayout from "../Admin/Pages/Product/AddProductLayout";
import UpdateProductLayout from "../Admin/Pages/Product/UpdateProductLayout";
import AttributeManagement from "../Admin/Pages/Attributes/AttributeManagement";
import CustomizationManagement from "../Admin/Pages/Customization/CustomizationManagement";
import NewArrivals from "../pages/NewArrivals/NewArrivals";
import SalePage from "../pages/Sale/SalePage";
import AdminHeroSlider from "../Admin/Pages/HeroSlider/AdminHeroSlider";
import OfferManagement from "../Admin/Pages/Discounts/OfferManagement";


export default function AppRoutes() {
    return (
        <Routes>

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="attributes" element={<AttributeManagement />} />
                <Route path="customization" element={<CustomizationManagement />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="hero-slider" element={<AdminHeroSlider />} />
                <Route path="offers" element={<OfferManagement />} />
            </Route>

            <Route path="/admin/orders/:orderId" element={
                <ProtectedRoute allowedRole="admin">
                    <AdminOrderDetails />
                </ProtectedRoute>
            } />
            <Route path="/admin/customers/:id" element={
                <ProtectedRoute allowedRole="admin">
                    <AdminCustomerDetail />
                </ProtectedRoute>
            } />

            <Route path="/admin/products/new" element={
                <ProtectedRoute allowedRole="admin">
                    <AddProductLayout />
                </ProtectedRoute>
            } />

            <Route path="/admin/products/edit/:slug" element={
                <ProtectedRoute allowedRole="admin">
                    <UpdateProductLayout />
                </ProtectedRoute>
            } />

            <Route path="/admin/products/view/:slug" element={
                <ProtectedRoute allowedRole="admin">
                    <ProductDetailsPage />
                </ProtectedRoute>
            } />

            <Route path="/login" element={<LoginAuth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route element={<MainLayout />}>
                {/* NORMAL ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/shop" element={<Navigate to="/shop/all" replace />} />
                <Route path="/shop/:category" element={<ProductListing />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/sale" element={<SalePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={
                    <ProtectedRoute allowedRole="customer">
                        <Checkout />
                    </ProtectedRoute>
                } />
                <Route path="/checkout/details" element={
                    <ProtectedRoute allowedRole="customer">
                        <CheckoutDetails />
                    </ProtectedRoute>
                } />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* <Route path="/customize/:slug" element={<CustomizePage />} /> */}
                <Route path="/customize/:slug" element={<CustomizeEditorLayout />}>
                    <Route index element={<CustomizePage />} />
                    <Route path="preview" element={<PreviewPage />} />
                </Route>

                {/* ACCOUNT */}
                <Route
                    path="/account"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <AccountLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="orders" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:orderId" element={<OrderDetails />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="addresses" element={<Addresses />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Route>
        </Routes>
    );
}
