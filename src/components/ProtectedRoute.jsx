import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute — Role-based access control
 *
 * Usage:
 *   allowedRoles={['admin']}              → Only admin
 *   allowedRoles={['admin', 'employee']}  → Admin + Employee
 *   allowedRoles={['customer']}           → Customers
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, role, loading } = useSelector((state) => state.auth);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Authenticating...</p>
                </div>
            </div>
        );
    }

    // 🚫 Not logged in → redirect to correct login page
    if (!user) {
        const isAdminPath = window.location.pathname.startsWith('/admin');
        return <Navigate to={isAdminPath ? "/admin/login" : "/login"} replace />;
    }

    // 🚫 Role mismatch → redirect appropriately
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        if (role === 'admin') {
            // Admin trying to access customer-only → go to admin dashboard
            return <Navigate to="/admin" replace />;
        }
        if (role === 'employee') {
            // Employee trying to access admin-only page → go to their orders page
            return <Navigate to="/admin/orders" replace />;
        }
        // Customer trying to access admin → go to home
        return <Navigate to="/" replace />;
    }

    // ✅ Allow access
    return children;
}