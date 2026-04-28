import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import * as orderService from "../../services/orderService";

const CancelOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    const reasons = [
        "Changed my mind",
        "Found a better price",
        "Incorrect size / color selected",
        "Shipping taking too long",
        "Other (please specify)"
    ];

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await orderService.getOrderById(orderId);
                setOrder(res.data);
                if (['shipped', 'delivered', 'cancelled'].includes(res.data?.orderStatus?.toLowerCase())) {
                    alert("This order cannot be cancelled.");
                    navigate(`/account/orders/${orderId}`);
                }
            } catch (error) {
                console.error("Fetch order details failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, navigate]);

    const handleCancelSubmit = async () => {
        const finalReason = selectedReason === "Other (please specify)" ? customReason : selectedReason;
        if (!finalReason) {
            alert("Please select or type a reason for cancellation");
            return;
        }

        setIsCancelling(true);
        try {
            await orderService.cancelOrder(orderId, finalReason);
            navigate(`/account/orders/${orderId}`);
        } catch (error) {
            console.error("Cancel order failed:", error);
            alert(error.message || "Failed to cancel order");
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 pb-20 flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-black/10 border-t-black animate-spin"></div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-black/40">Loading Protocol...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex-1 pb-20 text-center py-40">
                <p className="text-black/20 uppercase tracking-[0.5em] text-[10px] font-black">Order Not Found</p>
                <Link to="/account/orders" className="inline-block mt-8 text-[9px] font-black uppercase tracking-widest bg-black text-white px-8 py-4 rounded-xl hover:bg-accent hover:text-black transition-all">
                    Return to Archive
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 pb-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* HEADER */}
            <header className="mb-12 flex items-center justify-between">
                <div>
                    <Link to={`/account/orders/${orderId}`} className="text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black flex items-center gap-2 mb-4 transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Details
                    </Link>
                    <h2 className="text-3xl sm:text-4xl font-impact tracking-tight mb-2 text-black uppercase">Cancel Protocol</h2>
                    <p className="text-black/30 text-[9px] uppercase tracking-[0.4em] font-black">
                        Order ID: {order.orderNumber || `#MM-${order._id.slice(-8).toUpperCase()}`}
                    </p>
                </div>
            </header>

            {/* ORDER ITEMS SUMMARY */}
            <div className="bg-black/[0.01] border border-black/[0.03] rounded-[1.5rem] p-6 mb-8 flex items-center gap-6">
                <div className="flex gap-2 flex-shrink-0">
                    {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-16 h-20 bg-white rounded-xl overflow-hidden border border-black/5 p-1">
                            <img 
                                src={item.customizations?.displayPreviews?.front || item.customizations?.displayImage || item.customizations?.previews?.front || item.imageURL || "https://placeholder.com/100"} 
                                alt={item.title}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                    ))}
                    {order.items?.length > 3 && (
                        <div className="w-16 h-20 bg-white rounded-xl border border-dashed border-black/10 flex items-center justify-center">
                            <p className="text-[8px] font-black text-black/30">+{order.items.length - 3}</p>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">Items Included</p>
                    <p className="text-sm font-bold text-black uppercase leading-tight line-clamp-2">
                        {order.items?.[0]?.title} {order.items?.length > 1 && `[ +${order.items.length - 1} MORE ]`}
                    </p>
                    <p className="text-xs font-bold text-black/60 mt-1">Total Amount: ₹{order.totalAmount?.toLocaleString()}</p>
                </div>
            </div>

            {/* SELECTION BODY */}
            <div className="bg-white border border-black/[0.03] rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black/40 mb-6">Select a reason for cancellation:</p>

                <div className="space-y-3 mb-8">
                    {reasons.map((reason) => (
                        <label 
                            key={reason}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedReason === reason ? 'border-black bg-black/[0.02] text-black' : 'border-black/[0.03] hover:border-black/10 text-black/60'}`}
                        >
                            <input 
                                type="radio" 
                                name="cancelReason" 
                                value={reason} 
                                checked={selectedReason === reason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="hidden"
                            />
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedReason === reason ? 'border-black bg-black' : 'border-gray-300'}`}>
                                {selectedReason === reason && (
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                )}
                            </span>
                            <span className="text-sm font-bold tracking-wide uppercase">{reason}</span>
                        </label>
                    ))}
                </div>

                {selectedReason === "Other (please specify)" && (
                    <div className="mb-8 animate-fade-in">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">Additional Comments</p>
                        <textarea 
                            placeholder="Type details here..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="w-full h-32 p-4 border border-black/10 rounded-2xl text-sm font-medium focus:border-black outline-none resize-none bg-black/[0.01]"
                        />
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/[0.03]">
                    <button 
                        onClick={() => navigate(`/account/orders/${orderId}`)}
                        className="flex-1 py-4 border border-black/10 hover:bg-black/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-black transition-all text-center"
                    >
                        Retain Transaction
                    </button>
                    <button 
                        onClick={handleCancelSubmit}
                        disabled={isCancelling || !selectedReason || (selectedReason === "Other (please specify)" && !customReason)}
                        className="flex-1 py-4 bg-black hover:bg-[#8b7e6d] disabled:bg-black/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2"
                    >
                        {isCancelling ? (
                            <>
                                <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                Processing...
                            </>
                        ) : "Confirm Cancellation"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrder;
