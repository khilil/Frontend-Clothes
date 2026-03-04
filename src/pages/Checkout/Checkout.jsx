import { useState, useMemo, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, addUserAddress } from "../../features/auth/authSlice";
import * as orderService from "../../services/orderService";
import { motion, AnimatePresence } from "framer-motion";

import * as paymentService from "../../services/paymentService";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { cart, clearCart } = useCart();
  const { user } = useSelector((state) => state.auth);

  const directBuy = location.state?.directBuy;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("shipping"); // "shipping" | "payment"
  const [selectedAddress, setSelectedAddress] = useState(null);

  // 🛡️ Load Razorpay Script Dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 📝 Form State for New Address
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "ONLINE"
  });

  // 🔄 Auto-fetch profile
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  // 🔄 Handle Initial Selection
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr._id);
      setSelectedAddress(defaultAddr);
      setShowNewAddressForm(false);
    } else {
      setShowNewAddressForm(true);
    }
  }, [user?.addresses]);

  // Update selectedAddress when selectedAddressId changes
  useEffect(() => {
    if (user?.addresses && selectedAddressId) {
      const addr = user.addresses.find(a => a._id === selectedAddressId);
      if (addr) setSelectedAddress(addr);
    }
  }, [selectedAddressId, user?.addresses]);

  // 🏁 Handle Redirection after "Done" animation
  useEffect(() => {
    if (checkoutStep === "done") {
      const timer = setTimeout(() => {
        navigate("/account/orders", { state: { orderSuccess: true } });
      }, 3500); // Wait for animation to complete
      return () => clearTimeout(timer);
    }
  }, [checkoutStep, navigate]);

  // Calculate Summary
  const checkoutItems = useMemo(() => {
    if (directBuy) {
      return [{
        id: directBuy.productId,
        variantId: directBuy.variantId,
        title: directBuy.title,
        price: directBuy.price,
        qty: directBuy.quantity,
        size: directBuy.size,
        image: directBuy.image
      }];
    }
    return cart;
  }, [cart, directBuy]);

  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || item.quantity || 1), 0);
  const tax = subtotal * 0.082; // 8.2% estimated tax like in mockup
  const total = Math.round(subtotal + tax);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goToPayment = () => {
    if (showNewAddressForm) {
      // Validate form
      if (!formData.firstName || !formData.addressLine || !formData.pincode) {
        alert("Please complete the address form");
        return;
      }
      setSelectedAddress({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        streetAddress: formData.addressLine,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pincode
      });
    } else if (!selectedAddressId) {
      alert("Please select an existing address or add a new one.");
      return;
    }
    setCheckoutStep("payment");
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let shippingAddress;

      if (showNewAddressForm && !selectedAddressId) {
        // Save new address first
        const newAddrData = {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          streetAddress: formData.addressLine,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pincode
        };
        await dispatch(addUserAddress(newAddrData)).unwrap();
        shippingAddress = {
          fullName: newAddrData.fullName,
          phone: newAddrData.phone,
          addressLine: newAddrData.streetAddress,
          city: newAddrData.city,
          state: newAddrData.state,
          pincode: newAddrData.pinCode
        };
      } else {
        const selectedAddr = user.addresses.find(a => a._id === selectedAddressId);
        shippingAddress = {
          fullName: selectedAddr.fullName,
          phone: selectedAddr.phone,
          addressLine: selectedAddr.streetAddress,
          city: selectedAddr.city,
          state: selectedAddr.state,
          pincode: selectedAddr.pinCode
        };
      }

      const orderData = {
        shippingAddress,
        paymentMethod: formData.paymentMethod
      };

      let result;
      if (directBuy) {
        result = await orderService.directBuy({
          ...orderData,
          productId: directBuy.productId,
          variantId: directBuy.variantId,
          quantity: directBuy.quantity
        });
      } else {
        result = await orderService.cartCheckout(orderData);
      }

      // 💳 Razorpay Integration for Online Payments
      if (formData.paymentMethod === "ONLINE" || formData.paymentMethod === "UPI") {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert("Razorpay SDK failed to load. Are you online?");
          setIsProcessing(false);
          return;
        }

        // Create Razorpay Order in Backend
        const razorpayOrder = await paymentService.createRazorpayOrder({
          orderId: result.data._id
        });

        const options = {
          key: "rzp_test_SKiQG78TfTVFU7", // Test Key ID
          amount: razorpayOrder.data.amount,
          currency: razorpayOrder.data.currency,
          name: "GenZ Cloths",
          description: "Payment for Order #" + result.data._id,
          order_id: razorpayOrder.data.id,
          handler: async function (response) {
            try {
              setIsProcessing(true);
              const verificationData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: result.data._id
              };

              // Verify Signature in Backend
              await paymentService.verifyRazorpayPayment(verificationData);
              if (!directBuy) clearCart();
              setCheckoutStep("done");
            } catch (error) {
              console.error("Payment Verification Failed:", error);
              alert("Payment verification failed. Please contact support.");
              navigate("/account/orders", { state: { orderSuccess: false } });
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: user.fullName,
            email: user.email,
            contact: shippingAddress.phone
          },
          theme: {
            color: "#000000"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error("Payment Failed:", response.error);
          alert("Payment failed: " + response.error.description);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Cash on Delivery flow
        if (!directBuy) clearCart();
        setCheckoutStep("done");
      }

    } catch (error) {
      console.error("Order Failed:", error);
      alert(error.message || "Something went wrong while placing order");
    } finally {
      if (formData.paymentMethod === "COD") {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="bg-white selection:bg-[#d4c4b1] selection:text-black font-sans text-black min-h-screen">

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* PROGRESS STEPPER */}
        <div className="flex items-center justify-center mb-12 sm:mb-20 max-w-3xl mx-auto px-4">
          <StepperItem
            label="Cart"
            active={true}
            completed={true}
            showLine={true}
            lineActive={true}
          />
          <StepperItem
            label="Shipping"
            active={checkoutStep === 'shipping'}
            completed={checkoutStep === 'payment' || checkoutStep === 'done'}
            showLine={true}
            lineActive={checkoutStep === 'payment' || checkoutStep === 'done'}
          />
          <StepperItem
            label="Payment"
            active={checkoutStep === 'payment'}
            completed={checkoutStep === 'done'}
            showLine={true}
            lineActive={checkoutStep === 'done'}
          />
          <StepperItem
            label="Done"
            active={checkoutStep === 'done'}
            completed={checkoutStep === 'done'}
            showLine={false}
            lineActive={false}
          />
        </div>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-20">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {checkoutStep === "shipping" ? (
                <motion.div
                  key="ship-header"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-between items-center mb-8 sticky top-20 bg-white/95 backdrop-blur-sm z-40 py-4 -mx-4 px-4 border-b border-gray-50 md:border-0 md:bg-transparent md:backdrop-blur-none"
                >
                  <h2 className="text-xl md:text-2xl font-[Oswald] uppercase tracking-tight leading-none">Shipping Interface</h2>
                  {user?.addresses?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                      className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#d4c4b1] hover:text-black transition-all hover:bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      {showNewAddressForm ? "Select Existing" : "+ Add New Address"}
                    </button>
                  )}
                </motion.div>
              ) : checkoutStep === "payment" ? (
                <motion.h2
                  key="pay-header"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl font-[Oswald] uppercase tracking-tight mb-8 sticky top-20 bg-white/95 backdrop-blur-sm z-40 py-4 -mx-4 px-4 border-b border-gray-50 md:border-0 md:bg-transparent md:backdrop-blur-none"
                >
                  Payment Methodology
                </motion.h2>
              ) : null}
            </AnimatePresence>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                {checkoutStep === "shipping" ? (
                  /* SHIPPING SECTION */
                  <motion.section
                    key="shipping"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="relative"
                  >

                    {!showNewAddressForm && user?.addresses?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.addresses.map((addr) => (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 relative group ${selectedAddressId === addr._id ? 'border-black bg-gray-50/50 shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-black">{addr.fullName}</p>
                              {selectedAddressId === addr._id && (
                                <span className="material-symbols-outlined text-black text-lg">check_circle</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
                              {addr.streetAddress},<br />
                              {addr.city}, {addr.state} - {addr.pinCode}
                            </p>
                            <p className="mt-4 text-[10px] font-black text-gray-400 tracking-widest">PHONE: {addr.phone}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30 p-8 rounded-3xl border border-dashed border-gray-200">
                        <div className="space-y-2 md:col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">First Name</label>
                          <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required={showNewAddressForm}
                            className="w-full border-gray-100 bg-white rounded-xl py-4 px-5 text-sm focus:border-black focus:ring-0 transition-all outline-none"
                            placeholder="James"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Last Name</label>
                          <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required={showNewAddressForm}
                            className="w-full border-gray-100 bg-white rounded-xl py-4 px-5 text-sm focus:border-black focus:ring-0 transition-all outline-none"
                            placeholder="Stirling"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Digital Contact</label>
                          <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required={showNewAddressForm}
                            className="w-full border-gray-100 bg-white rounded-xl py-4 px-5 text-sm focus:border-black focus:ring-0 transition-all outline-none"
                            placeholder="+91 XXXXX XXXXX"
                            type="tel"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Street Domain</label>
                          <input
                            name="addressLine"
                            value={formData.addressLine}
                            onChange={handleInputChange}
                            required={showNewAddressForm}
                            className="w-full border-gray-100 bg-white rounded-xl py-4 px-5 text-sm focus:border-black focus:ring-0 transition-all outline-none"
                            placeholder="245 Fifth Avenue, Apartment 4B"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Urban City</label>
                          <input
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required={showNewAddressForm}
                            className="w-full border-gray-100 bg-white rounded-xl py-4 px-5 text-sm focus:border-black focus:ring-0 transition-all outline-none"
                            placeholder="New York"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Regional State</label>
                          <input
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required={showNewAddressForm}
                            className="w-full border-gray-100 bg-white rounded-xl py-4 px-5 text-sm focus:border-black focus:ring-0 transition-all outline-none"
                            placeholder="New York"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Zip Protocol</label>
                          <input
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            required={showNewAddressForm}
                            className="w-full border-gray-100 bg-white rounded-xl py-4 px-5 text-sm focus:border-black focus:ring-0 transition-all outline-none"
                            placeholder="100116"
                            type="text"
                          />
                        </div>
                      </div>
                    )}
                    <div className="mt-12 flex justify-end">
                      <button
                        type="button"
                        onClick={goToPayment}
                        className="h-16 px-12 bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] hover:bg-[#d4c4b1] hover:text-black transition-all rounded-xl shadow-xl shadow-black/10"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </motion.section>
                ) : checkoutStep === "payment" ? (
                  /* PAYMENT SECTION */
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-12"
                  >
                    {/* REVIEW CARD */}
                    <section className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 relative">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-[Oswald] uppercase tracking-tight">Review & Pay</h2>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep("shipping")}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all border-b border-gray-200 hover:border-black"
                        >
                          Edit Address
                        </button>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-gray-400 text-xl">location_on</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Shipping To</p>
                          <p className="text-sm font-bold uppercase">{selectedAddress?.fullName}</p>
                          <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">
                            {selectedAddress?.streetAddress}, {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pinCode}, IN
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="relative">
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <PaymentOption
                            id="ONLINE"
                            title="Online Payment"
                            desc="UPI, Card, NetBanking"
                            icon="payments"
                            active={formData.paymentMethod === "ONLINE"}
                            onClick={() => setFormData({ ...formData, paymentMethod: "ONLINE" })}
                          />
                          <PaymentOption
                            id="COD"
                            title="Cash"
                            desc="Pay on arrival"
                            icon="local_shipping"
                            active={formData.paymentMethod === "COD"}
                            onClick={() => setFormData({ ...formData, paymentMethod: "COD" })}
                          />
                        </div>
                      </div>
                    </section>
                  </motion.div>
                ) : (
                  /* SUCCESS SECTION */
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center justify-center py-12 md:py-24 text-center space-y-8 min-h-[50vh]"
                  >
                    <div className="relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.2
                        }}
                        className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-full flex items-center justify-center shadow-2xl relative z-10"
                      >
                        <motion.span
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="material-symbols-outlined text-white text-4xl md:text-6xl font-bold"
                        >
                          check
                        </motion.span>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 border-2 border-black rounded-full"
                      />
                    </div>
                    <div className="space-y-4 px-6">
                      <h2 className="text-3xl md:text-5xl font-[Oswald] uppercase tracking-tighter leading-none">Order Captured</h2>
                      <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-400">Synchronizing with account history...</p>
                    </div>
                    <div className="w-40 md:w-64 h-[1px] bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                        className="h-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SUMMARY SIDEBAR */}
          <AnimatePresence>
            {checkoutStep !== "done" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:w-[450px]"
              >
                <div className="sticky top-32 bg-gray-50 border border-gray-100 p-8 md:p-10 rounded-3xl space-y-10 shadow-sm">
                  <h3 className="text-2xl font-[Oswald] uppercase tracking-tight">Order Synopsis</h3>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {checkoutItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-all duration-700"
                          />
                        </div>
                        <div className="flex-1 py-1">
                          <p className="text-[11px] font-black uppercase tracking-widest truncate">{item.title}</p>
                          <p className="text-[10px] text-gray-500 uppercase mt-1 tracking-widest">Qty: {item.qty || 1} | Size: {item.size}</p>
                          <p className="text-lg font-[Oswald] tracking-tight mt-2 italic">₹{(item.price * (item.qty || 1)).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-gray-200">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <span>Base Subtotal</span>
                      <span className="text-black">₹{(subtotal - checkoutItems.reduce((acc, item) => acc + (item.price - (item.basePrice || item.price)) * (item.qty || 1), 0)).toLocaleString()}</span>
                    </div>
                    {checkoutItems.some(item => (item.price - (item.basePrice || item.price)) > 0) && (
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#d4c4b1] drop-shadow-[0_0_10px_rgba(212,196,177,0.2)]">
                        <span>Customization Architecture</span>
                        <span className="font-bold">+₹{checkoutItems.reduce((acc, item) => acc + (item.price - (item.basePrice || item.price)) * (item.qty || 1), 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <span>Shipping Architecture</span>
                      <span className="text-emerald-600 font-bold uppercase">Complimentary</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <span>VAT Estimation</span>
                      <span className="text-black">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-8 border-t border-gray-200 flex justify-between items-end">
                      <span className="text-lg font-[Oswald] uppercase tracking-tighter italic">Total Due</span>
                      <span className="text-4xl font-[Oswald] tracking-tight">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {checkoutStep === "shipping" ? (
                    <button
                      type="button"
                      onClick={goToPayment}
                      className="w-full h-20 bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] hover:bg-[#d4c4b1] hover:text-black transition-all rounded-2xl shadow-2xl shadow-black/10 flex items-center justify-center gap-3"
                    >
                      Continue to Payment
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full h-20 bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] hover:bg-[#d4c4b1] hover:text-black transition-all rounded-2xl shadow-2xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isProcessing ? "Validating..." : "Complete Order"}
                      {!isProcessing && <span className="material-symbols-outlined">shield</span>}
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[#d4c4b1] text-lg">verified_user</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-center text-gray-400">Secure SSL</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[#d4c4b1] text-lg">public</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-center text-gray-400">Global Node</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </main>

    </div >
  );
}

function StepperItem({ label, active, completed, showLine, lineActive }) {
  return (
    <div className={`flex flex-1 items-center gap-4 ${!showLine ? 'flex-none' : ''}`}>
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <motion.div
            initial={false}
            animate={{
              scale: active ? 1.2 : 1,
              backgroundColor: completed ? "#000000" : active ? "#000000" : "#F3F4F6",
            }}
            className={`w-4 h-4 rounded-full flex items-center justify-center`}
          >
            {completed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="material-symbols-outlined text-[10px] text-white font-bold"
              >
                check
              </motion.span>
            )}
          </motion.div>
          {active && (
            <motion.div
              layoutId="stepper-ring"
              className="absolute -inset-1 border border-black rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${active || completed ? 'text-black' : 'text-gray-300'}`}>
          {label}
        </span>
      </div>
      {showLine && (
        <div className="flex-1 h-[2px] bg-gray-100 mb-6 relative overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: lineActive ? "100%" : "0%" }}
            className="absolute inset-0 bg-black"
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      )}
    </div>
  );
}

function PaymentOption({ id, title, desc, icon, active, onClick }) {
  return (
    <label
      onClick={onClick}
      className={`flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 relative overflow-hidden group/opt
        ${active ? 'border-black bg-gray-50/50 shadow-lg' : 'border-gray-100 hover:border-gray-200'}
      `}
    >
      {active && (
        <motion.div
          layoutId="payment-active-bg"
          className="absolute inset-0 bg-black/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${active ? 'border-black bg-black' : 'border-gray-200'}
        `}>
          {active && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
        </div>
        <div>
          <p className={`text-sm font-black uppercase tracking-widest transition-colors ${active ? 'text-black' : 'text-gray-400 group-hover/opt:text-gray-600'}`}>{title}</p>
          <p className="text-[10px] text-gray-500 uppercase mt-1 tracking-wider">{desc}</p>
        </div>
      </div>
      <span className={`material-symbols-outlined transition-all duration-300 relative z-10 
        ${active ? 'text-black scale-110' : 'text-gray-200 group-hover/opt:text-gray-400'}
      `}>{icon}</span>
    </label>
  );
}
