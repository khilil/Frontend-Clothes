import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import * as orderService from "../../services/orderService";
import { QRCodeCanvas } from "qrcode.react";


const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    const reasons = [
        "Changed my mind",
        "Found a better price",
        "Incorrect size / color selected",
        "Shipping taking too long",
        "Other (please specify)"
    ];

    const handleCancelSubmit = async () => {
        const finalReason = selectedReason === "Other (please specify)" ? customReason : selectedReason;
        if (!finalReason) {
            alert("Please select or type a reason for cancellation");
            return;
        }

        setIsCancelling(true);
        try {
            await orderService.cancelOrder(orderId, finalReason);
            setOrder(prev => ({ ...prev, orderStatus: 'cancelled', cancellationReason: finalReason }));
            setShowCancelModal(false);
        } catch (error) {
            console.error("Cancel order failed:", error);
            alert(error.message || "Failed to cancel order");
        } finally {
            setIsCancelling(false);
        }
    };

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
        const sequence = order?.orderType === 'PICKUP' 
            ? ['placed', 'processing', 'ready-for-pickup', 'delivered']
            : ['placed', 'processing', 'in-production', 'ready-to-ship', 'shipped', 'delivered'];
        return sequence.indexOf(status?.toLowerCase());
    };

    const currentIdx = getStatusIndex(order.orderStatus);

    return (
        <div className="flex-1 pb-20 relative">


            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <Link to="/account/orders" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-black/30 hover:text-black mb-6 transition-all group/back">
                        <span className="material-symbols-outlined text-base group-hover/back:-translate-x-1 transition-transform">arrow_back</span>
                        Archive Retrieval
                    </Link>
                    <h2 className="text-4xl md:text-5xl font-impact tracking-tight mb-2 text-black">Protocol {order.orderNumber || `#MM-${order._id.slice(-8).toUpperCase()}`}</h2>
                    <p className="text-black/20 text-[10px] uppercase tracking-[0.4em] font-black">
                        Logged on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} // {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto mt-6 md:mt-0">
                    {!['shipped', 'delivered', 'cancelled'].includes(order.orderStatus?.toLowerCase()) && (
                        <button 
                            onClick={() => navigate(`/account/orders/cancel/${orderId}`)}
                            disabled={isCancelling}
                            className="flex items-center justify-center gap-3 px-8 py-4 border border-red-500/20 bg-red-500/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-500 hover:text-white transition-all group w-full sm:w-auto disabled:opacity-50 shadow-[0_10px_30px_rgba(239,68,68,0.1)]"
                        >
                            <span className="material-symbols-outlined text-base group-hover:rotate-90 transition-transform">close</span>
                            {isCancelling ? "Terminating..." : "Cancel Protocol"}
                        </button>
                    )}
                    <button className="flex items-center justify-center gap-3 px-8 py-4 border border-black/5 bg-black/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-black/60 hover:bg-black/10 hover:text-black transition-all group w-full sm:w-auto">
                        <span className="material-symbols-outlined text-base group-hover:translate-y-0.5 transition-transform">download</span>
                        Export Manifest
                    </button>
                    <button className="px-10 py-4 bg-black text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#8b7e6d] transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-full sm:w-auto">
                        Acquire Again
                    </button>
                </div>
            </header>

            {/* TIMELINE */}
            {order.orderStatus?.toLowerCase() === 'cancelled' ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 md:p-14 flex items-center gap-6 mb-10 shadow-[0_20px_50px_rgba(239,68,68,0.05)] relative overflow-hidden group/cancelled">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-600 shadow-lg shadow-red-500/20 group-hover/cancelled:scale-110 transition-transform duration-700">
                        <span className="material-symbols-outlined text-3xl">cancel</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-impact tracking-tight text-red-600 uppercase">Order Cancelled</h3>
                        <p className="text-red-500/60 text-[10px] uppercase tracking-[0.3em] font-black mt-2">
                            This protocol has been terminated. Stock has been restored to inventory.
                        </p>
                    </div>
                </div>
            ) : (
                /* TIMELINE */
                <div className="bg-white border border-black/[0.03] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 md:p-14 mb-10 relative overflow-hidden group/timeline shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                    <div className="absolute top-0 right-0 p-5 opacity-10 uppercase text-[8px] font-black tracking-widest text-black hidden sm:block">Status Stream active</div>
                    
                    {/* Desktop Horizontal Timeline */}
                    <div className="hidden sm:flex relative justify-between gap-4">
                        <div className="absolute top-[7px] left-0 w-full h-[1px] bg-black/5 -z-0"></div>
                        {order.orderType === 'PICKUP' ? (
                            ['Placed', 'Processing', 'Ready for Pickup', 'Finalized'].map((step, idx) => {
                                const isComplete = idx < currentIdx;
                                const isActive = idx === currentIdx;
                                return (
                                    <div key={step} className={`relative z-10 flex flex-col items-center gap-5 ${isActive ? 'text-black' : isComplete ? 'text-black/60' : 'text-black/20'} transition-colors duration-700`}>
                                        <div className={`w-3.5 h-3.5 rounded-full ring-8 ring-[#f8f9fa] transition-all duration-700 ${isActive ? 'bg-purple-500 scale-125 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : isComplete ? 'bg-black/40' : 'bg-black/5'}`}></div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{step}</p>
                                            {isActive && (
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            ['Placed', 'Processing', 'In Production', 'Ready', 'Shipped', 'Finalized'].map((step, idx) => {
                                const isComplete = idx < currentIdx;
                                const isActive = idx === currentIdx;

                                return (
                                    <div key={step} className={`relative z-10 flex flex-col items-center gap-5 ${isActive ? 'text-black' : isComplete ? 'text-black/60' : 'text-black/20'} transition-colors duration-700`}>
                                        <div className={`w-3.5 h-3.5 rounded-full ring-8 ring-[#f8f9fa] transition-all duration-700 ${isActive ? 'bg-[#8b7e6d] scale-125 shadow-[0_0_15px_rgba(139,126,109,0.5)]' : isComplete ? 'bg-black/40' : 'bg-black/5'}`}></div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{step}</p>
                                            {isActive && (
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#8b7e6d] rounded-full animate-ping"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Mobile Vertical Timeline */}
                    <div className="sm:hidden space-y-8 relative">
                        <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-black/5 -z-0"></div>
                        {['Placed', 'Processing', 'In Production', 'Ready', 'Shipped', 'Finalized'].map((step, idx) => {
                            const isComplete = idx < currentIdx;
                            const isActive = idx === currentIdx;

                            return (
                                <div key={step} className={`relative z-10 flex items-center gap-6 ${isActive ? 'text-black' : isComplete ? 'text-black/60' : 'text-black/20'} transition-colors duration-700`}>
                                    <div className={`w-3.5 h-3.5 rounded-full ring-8 ring-white transition-all duration-700 ${isActive ? 'bg-[#8b7e6d] scale-125 shadow-[0_0_15px_rgba(139,126,109,0.5)]' : isComplete ? 'bg-black/40' : 'bg-black/5'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{step}</p>
                                        {isActive && <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#8b7e6d] mt-1">Active Protocol Stage</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* DIGITAL PICKUP PASS (If Pickup & Ready) */}
            {order.orderType === 'PICKUP' && order.orderStatus === 'ready-for-pickup' && (
                <div className="relative mb-12 group/pass">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 bg-purple-600 rounded-[2.5rem] rotate-1 shadow-2xl shadow-purple-600/20 transition-transform group-hover/pass:rotate-0 duration-700"></div>
                    
                    <div className="relative bg-white border-2 border-purple-600 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl transition-transform group-hover/pass:-translate-y-1 duration-700">
                        {/* Left Section: Context & Title */}
                        <div className="flex-1 p-8 sm:p-12 border-b-2 md:border-b-0 md:border-r-2 border-dashed border-purple-100 relative">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-600 rounded-tl-3xl"></div>
                            
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                                    <span className="material-symbols-outlined text-xl">verified</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600">Active Authentication</span>
                            </div>

                            <h3 className="text-4xl sm:text-5xl font-impact tracking-tight text-black uppercase mb-4 leading-none">
                                Digital Pickup <span className="text-purple-600">Pass</span>
                            </h3>
                            <p className="text-black/40 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] max-w-xs leading-relaxed mb-8">
                                Present this encrypted token at the flagship store for priority acquisition.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-black/60 group/step">
                                    <span className="w-6 h-6 rounded-full border border-purple-200 flex items-center justify-center text-[10px] font-black group-hover/step:bg-purple-600 group-hover/step:text-white transition-all">01</span>
                                    <p className="text-[9px] font-black uppercase tracking-widest">Visit Store: {order.pickupDetails?.storeName}</p>
                                </div>
                                <div className="flex items-center gap-4 text-black/60 group/step">
                                    <span className="w-6 h-6 rounded-full border border-purple-200 flex items-center justify-center text-[10px] font-black group-hover/step:bg-purple-600 group-hover/step:text-white transition-all">02</span>
                                    <p className="text-[9px] font-black uppercase tracking-widest">Show QR to Staff</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: The QR Token */}
                        <div className="w-full md:w-80 bg-purple-50/30 p-8 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            {/* Animated Background Pulse */}
                            <div className="absolute inset-0 bg-purple-200/20 animate-pulse"></div>

                            <div className="relative z-10 w-full">
                                <div className="bg-white p-4 rounded-3xl shadow-xl shadow-purple-200/50 mb-6 group-hover/pass:scale-105 transition-transform duration-700 inline-block border-2 border-purple-100">
                                    <QRCodeCanvas 
                                        value={`ORDER_ID:${order._id}|TOKEN:V-${order._id.slice(-6).toUpperCase()}`}
                                        size={140}
                                        level={"H"}
                                        includeMargin={false}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">Verification Token</p>
                                    <p className="text-2xl font-impact tracking-widest text-purple-600">#V-{order._id.slice(-6).toUpperCase()}</p>
                                </div>

                                <button 
                                    onClick={() => window.print()}
                                    className="mt-8 w-full py-4 bg-black text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all flex items-center justify-center gap-2 group/btn shadow-xl shadow-black/10"
                                >
                                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">print</span>
                                    Print Credentials
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-10">
                {/* ITEMS LIST */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white border border-black/[0.03] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden group/list shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                        <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-black/[0.03] bg-black/[0.01] flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Acquisition Items ({order.items?.length || 0})</h3>
                        </div>
                        <div className="divide-y divide-black/[0.03]">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="p-6 sm:p-10 md:p-14 flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start group/item hover:bg-black/[0.01] transition-all">
                                    <div className="flex flex-col items-center gap-3 flex-shrink-0">
                                        <div className="w-24 h-32 sm:w-28 sm:h-36 md:w-40 md:h-52 bg-black/[0.02] rounded-2xl sm:rounded-3xl overflow-hidden border border-black/5 group-hover/item:border-black/10 transition-all duration-1000 p-2">
                                            <img loading="lazy" 
                                                alt={item.title}
                                                className="w-full h-full object-cover rounded-xl sm:rounded-2xl grayscale group-hover/item:grayscale-0 group-hover/item:scale-110 transition-all duration-1000"
                                                src={item.customizations?.displayPreviews?.front || item.customizations?.displayImage || item.customizations?.previews?.front || item.imageURL || "https://placeholder.com/100"}
                                            />
                                        </div>
                                        {(item.customizations?.displayPreviews?.front || item.customizations?.displayPreviews?.back || item.customizations?.previews?.front || item.customizations?.previews?.back) && (
                                            <div className="flex gap-2">
                                                {["front", "back"].map((side) => {
                                                    const sideImage = item.customizations?.displayPreviews?.[side] || item.customizations?.previews?.[side];
                                                    if (!sideImage) return null;

                                                    return (
                                                        <div
                                                            key={side}
                                                            className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl overflow-hidden border border-black/5 bg-black/[0.02] p-1"
                                                        >
                                                            <img loading="lazy" 
                                                                src={sideImage}
                                                                alt={`${item.title} ${side}`}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between h-full py-2 sm:py-4 text-center sm:text-left w-full">
                                        <div>
                                            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-3 sm:mb-4 gap-3">
                                                <h4 className="text-xl sm:text-2xl md:text-3xl font-impact tracking-tight text-black uppercase group-hover/item:text-[#8b7e6d] transition-colors leading-none">{item.title}</h4>
                                                {item.designReference && (
                                                    <span className="text-[8px] sm:text-[9px] font-black bg-[#8b7e6d] text-white px-3 py-1 rounded-full tracking-[0.2em] uppercase shadow-[0_10px_20px_rgba(139,126,109,0.2)]">Custom</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] sm:text-[11px] text-black/30 uppercase tracking-[0.3em] font-black mb-4 sm:mb-6">
                                                {item.size && `Dim: ${item.size}`} {item.color && ` // Chroma: ${item.color}`}
                                            </p>
                                            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="flex justify-between items-center sm:items-end mt-6 sm:mt-8 border-t sm:border-t-0 border-black/[0.03] pt-4 sm:pt-0">
                                            <p className="text-xl sm:text-2xl font-impact tracking-tight text-black">₹{(item.priceAtPurchase || item.price * item.quantity).toLocaleString()}</p>
                                            <button className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-black/20 hover:text-black transition-colors underline underline-offset-8 decoration-black/10 group-hover/item:decoration-[#8b7e6d]">Feedback Protocol</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SUMMARY & LOGISTICS */}
                <div className="space-y-10">
                    {/* ORDER SUMMARY */}
                    <div className="bg-white border border-black/[0.03] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden group/summary shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                        <div className="px-6 sm:px-10 py-5 sm:py-6 border-b border-black/[0.03] bg-black/[0.01] flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Statement Summary</h3>
                            <span className="material-symbols-outlined text-black/10 text-sm">receipt</span>
                        </div>
                        <div className="p-6 sm:p-10 space-y-5 sm:space-y-6">
                            <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-black/30">
                                <span>Sub-Total Log</span>
                                <span className="text-black/60">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-black/30">
                                <span>Logistics Protocol</span>
                                <span className="text-[#8b7e6d] animate-pulse">Standard Compulsory</span>
                            </div>
                            <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-black/30">
                                <span>Chroma Tax</span>
                                <span className="text-black/60">₹0.00</span>
                            </div>
                            <div className="pt-6 sm:pt-8 border-t border-black/[0.03] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.4em] text-black">Total Investment</span>
                                <span className="text-2xl sm:text-3xl font-impact tracking-tight text-[#8b7e6d]">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* DESTINATION / PICKUP INFO */}
                    <div className="bg-white border border-black/[0.03] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden group/address shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                        <div className="px-6 sm:px-10 py-5 sm:py-6 border-b border-black/[0.03] bg-black/[0.01] flex justify-between items-center text-black/40">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">{order.orderType === 'PICKUP' ? 'Collection Node' : 'Destination Protocol'}</h3>
                            <span className="material-symbols-outlined text-sm">{order.orderType === 'PICKUP' ? 'storefront' : 'location_on'}</span>
                        </div>
                        <div className="p-6 sm:p-10">
                            {order.orderType === 'PICKUP' ? (
                                <>
                                    <p className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.4em] text-black mb-4 sm:mb-6">{order.pickupDetails?.storeName}</p>
                                    <p className="text-[10px] sm:text-[11px] text-black/30 font-black uppercase tracking-[0.3em] leading-loose">
                                        {order.pickupDetails?.storeAddress}
                                    </p>
                                    <div className="mt-8 flex flex-col gap-4">
                                        <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10">
                                            <p className="text-[8px] font-black uppercase text-purple-400 tracking-widest mb-1">Scheduled Window</p>
                                            <p className="text-[10px] font-black uppercase text-purple-600">{order.pickupDetails?.pickupTime}</p>
                                        </div>
                                        <a href={`https://maps.google.com/?q=${encodeURIComponent(order.pickupDetails?.storeAddress)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-accent transition-all">
                                            <span className="material-symbols-outlined text-sm">directions</span> Get Directions
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.4em] text-black mb-4 sm:mb-6">{order.shippingAddress?.fullName}</p>
                                    <p className="text-[10px] sm:text-[11px] text-black/30 font-black uppercase tracking-[0.3em] leading-loose">
                                        {order.shippingAddress?.addressLine},<br />
                                        {order.shippingAddress?.city} // {order.shippingAddress?.state},<br />
                                        REGION PC: {order.shippingAddress?.pincode}
                                    </p>
                                    <div className="mt-8 sm:mt-10 flex items-center gap-4 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.03]">
                                        <span className="material-symbols-outlined text-black/20 text-sm">phone</span>
                                        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-black/60">{order.shippingAddress?.phone}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* PAYMENT METHOD */}
                    <div className="bg-white border border-black/[0.03] rounded-[2.5rem] overflow-hidden group/payment shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                        <div className="px-10 py-6 border-b border-black/[0.03] bg-black/[0.01] flex justify-between items-center text-black/40">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Funding Source</h3>
                            <span className="material-symbols-outlined text-sm">payments</span>
                        </div>
                        <div className="p-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-10 bg-black text-white rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                                    {order.paymentMethod === 'COD' || order.paymentMethod === 'CASH_ON_PICKUP' ? 'CASH' : 'DPAL'}
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black">
                                        {['COD', 'CASH_ON_PICKUP'].includes(order.paymentMethod) ? 'Physical Currency' : 'Digital Protocol'}
                                    </p>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-3 ${order.paymentStatus?.toLowerCase() === 'paid' ? 'text-emerald-600' : 'text-[#8b7e6d]'}`}>Status: {order.paymentStatus}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* CANCELLATION MODAL */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 transform transition-all scale-100">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Please select the reason for cancellation:
                            </p>

                            <div className="space-y-3 mb-6">
                                {reasons.map((reason) => (
                                    <label 
                                        key={reason}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedReason === reason ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900' : 'border-gray-100 hover:border-gray-200 text-gray-700'}`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="cancelReason" 
                                            value={reason} 
                                            checked={selectedReason === reason}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="hidden"
                                        />
                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedReason === reason ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                            {selectedReason === reason && (
                                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                            )}
                                        </span>
                                        <span className="text-sm font-medium">{reason}</span>
                                    </label>
                                ))}
                            </div>

                            {selectedReason === "Other (please specify)" && (
                                <div className="mb-6">
                                    <textarea 
                                        placeholder="Please provide cancellation details..."
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        className="w-full h-24 p-3.5 border border-gray-200 rounded-xl text-sm font-normal focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none resize-none bg-gray-50/50"
                                    />
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-all text-center"
                                >
                                    Don't Cancel
                                </button>
                                <button 
                                    onClick={handleCancelSubmit}
                                    disabled={isCancelling || !selectedReason || (selectedReason === "Other (please specify)" && !customReason)}
                                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed shadow-md shadow-red-500/10"
                                >
                                    {isCancelling ? "Processing..." : "Cancel Order"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
