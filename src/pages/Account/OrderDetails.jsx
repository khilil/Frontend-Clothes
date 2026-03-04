import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import * as orderService from "../../services/orderService";

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await orderService.getOrderById(orderId);
                setOrder(res.data);
            } catch (error) {
                console.error("Fetch order details failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-40 min-h-screen">
                <div className="animate-pulse text-black uppercase tracking-[0.6em] font-black text-[10px]">
                    [ RETRIEVING PROTOCOL DATA ]
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-40 min-h-screen">
                <p className="text-black/20 uppercase tracking-[0.5em] text-[10px] font-black">
                    Error: Protocol Trace Not Found
                </p>
                <Link to="/account/orders" className="inline-block mt-8 text-[9px] font-black uppercase tracking-widest bg-black text-white px-8 py-4 rounded-xl hover:bg-accent hover:text-black transition-all">
                    Return to Archives
                </Link>
            </div>
        );
    }

    const getStatusIndex = (status) => {
        const sequence = ['placed', 'processing', 'in-production', 'ready-to-ship', 'shipped', 'delivered'];
        return sequence.indexOf(status?.toLowerCase());
    };

    const currentIdx = getStatusIndex(order.orderStatus);

    return (
        <div className="flex-1 pb-20">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <Link to="/account/orders" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-black mb-4 transition-colors">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to History
                    </Link>
                    <h2 className="text-4xl font-impact tracking-tight mb-1">Order #MM-{order._id.slice(-8).toUpperCase()}</h2>
                    <p className="text-muted text-[10px] uppercase tracking-widest font-bold">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all bg-white">
                        <span className="material-symbols-outlined text-base">download</span>
                        Download Invoice
                    </button>
                    <button className="px-8 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all">
                        Buy Again
                    </button>
                </div>
            </header>

            {/* TIMELINE */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 mb-8 shadow-sm">
                <div className="relative flex justify-between">
                    <div className="absolute top-2 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
                    {['Placed', 'Processing', 'In Production', 'Ready', 'Shipped', 'Delivered'].map((step, idx) => {
                        const sequence = ['placed', 'processing', 'in-production', 'ready-to-ship', 'shipped', 'delivered'];
                        const internalStatus = sequence[idx];
                        const isComplete = idx < currentIdx;
                        const isActive = idx === currentIdx;

                        return (
                            <div key={step} className={`relative z-10 flex flex-col items-center gap-4 ${isActive ? 'text-black font-bold' : isComplete ? 'text-black' : 'text-muted'}`}>
                                <div className={`w-4 h-4 rounded-full ring-4 ring-white transition-all duration-500 ${isActive ? 'bg-black scale-125 border-4 border-white ring-1 ring-black' : isComplete ? 'bg-black' : 'bg-gray-100'}`}></div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black uppercase tracking-tighter sm:tracking-widest whitespace-nowrap">{step}</p>
                                    {isActive && (
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rounded-full animate-bounce"></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TRACKING INFO (If Shipped) */}
            {order.trackingNumber && (
                <div className="bg-black text-white rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-accent text-2xl">local_shipping</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4c4b1] mb-1">Active Shipment Trace</p>
                            <h3 className="text-xl font-impact tracking-tight uppercase">{order.courierService || "Express Logistics"}</h3>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Waybill Number</p>
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-mono font-bold tracking-tighter underline underline-offset-4 decoration-[#d4c4b1]">{order.trackingNumber}</span>
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* ITEMS LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Order Items ({order.items?.length || 0})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="p-8 flex gap-6">
                                    <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            src={item.customizations?.previews?.front || item.imageURL || "https://placeholder.com/100"}
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold uppercase tracking-tight mb-1">{item.title}</h4>
                                                {item.designReference && (
                                                    <span className="text-[8px] font-black bg-black text-white px-2 py-0.5 rounded tracking-widest uppercase">Customized</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted uppercase tracking-widest mb-3">
                                                {item.size && `Size: ${item.size}`} {item.color && ` / Color: ${item.color}`}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-sm font-impact tracking-tight">₹{(item.priceAtPurchase || item.price * item.quantity).toLocaleString()}</p>
                                            <button className="text-[9px] font-black uppercase tracking-widest text-muted hover:text-black underline underline-offset-4">Write a Review</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SUMMARY & LOGISTICS */}
                <div className="space-y-6">
                    {/* ORDER SUMMARY */}
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Order Summary</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex justify-between text-[11px] uppercase tracking-widest font-medium text-muted">
                                <span>Subtotal</span>
                                <span>₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] uppercase tracking-widest font-medium text-muted">
                                <span>Shipping</span>
                                <span className="text-emerald-600 font-bold uppercase">Free</span>
                            </div>
                            <div className="flex justify-between text-[11px] uppercase tracking-widest font-medium text-muted">
                                <span>Estimated Tax</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-[12px] font-black uppercase tracking-widest">Total</span>
                                <span className="text-2xl font-impact tracking-tight">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* SHIPPING ADDRESS */}
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Shipping Address</h3>
                        </div>
                        <div className="p-8">
                            <p className="text-[11px] font-black uppercase tracking-widest mb-2">{order.shippingAddress?.fullName}</p>
                            <p className="text-[11px] text-muted uppercase tracking-widest leading-loose">
                                {order.shippingAddress?.addressLine},<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.state},<br />
                                {order.shippingAddress?.pincode}<br />
                                India
                            </p>
                            <p className="text-[11px] font-bold uppercase tracking-widest mt-4">{order.shippingAddress?.phone}</p>
                        </div>
                    </div>

                    {/* PAYMENT METHOD */}
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Payment Method</h3>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-black rounded-md flex items-center justify-center text-white text-[8px] font-black uppercase tracking-tighter">
                                    {order.paymentMethod === 'COD' ? 'CASH' : 'VISA'}
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest">
                                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                    </p>
                                    <p className="text-[9px] text-muted uppercase tracking-widest mt-1">Status: {order.paymentStatus}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
