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
  const { cart, clearCart, appliedCoupon } = useCart();
  const { user } = useSelector((state) => state.auth);

  const directBuy = location.state?.directBuy;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("shipping");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [completedOrderId, setCompletedOrderId] = useState(null);

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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "ONLINE",
    deliveryMethod: "DELIVERY", // NEW: DELIVERY or PICKUP
    pickupTime: "", // NEW: Selected slot
  });

  const [selectedStore] = useState({
    name: "FENRIR Era Flagship Store",
    address: "245 Fifth Avenue, New York, NY 10016",
    mapLink: "https://maps.google.com/?q=245+Fifth+Avenue+New+York",
    hours: "10:00 AM - 08:00 PM",
  });

  // 🔝 Auto-scroll to top on step change and mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [checkoutStep]);

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
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.082; // 8.2% estimated tax like in mockup
  const total = Math.round(taxableAmount + tax);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goToPayment = () => {
    if (formData.deliveryMethod === "DELIVERY") {
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
    } else {
      // Pickup validation
      if (!formData.pickupTime) {
        alert("Please select a pickup time slot");
        return;
      }
    }
    setCheckoutStep("payment");
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
      } else if (formData.deliveryMethod === "DELIVERY") {
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
        shippingAddress: formData.deliveryMethod === "DELIVERY" ? shippingAddress : undefined,
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon?.code || "",
        discountAmount: appliedCoupon?.discountAmount || 0,
        orderType: formData.deliveryMethod,
        pickupDetails: formData.deliveryMethod === "PICKUP" ? {
          storeName: selectedStore.name,
          storeAddress: selectedStore.address,
          pickupTime: formData.pickupTime,
        } : undefined
      };

      const result = directBuy
        ? await orderService.directBuy({
          ...orderData,
          productId: directBuy.productId,
          variantId: directBuy.variantId,
          quantity: directBuy.quantity
        })
        : await orderService.cartCheckout(orderData);

      const orderId = result.data._id;
      setCompletedOrderId(orderId);

      // 💳 Razorpay Integration for Online Payments
      if (formData.paymentMethod !== "ONLINE") {
        if (!directBuy) clearCart();
        setCheckoutStep("done");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // Create Razorpay Order in Backend
      const razorpayOrder = await paymentService.createRazorpayOrder({ orderId });

      const options = {
        key: "rzp_test_SKiQG78TfTVFU7", // Test Key ID
        amount: razorpayOrder.data.amount,
        currency: razorpayOrder.data.currency,
        name: "Fenrir Era",
        description: "Payment for Order #" + orderId,
        order_id: razorpayOrder.data.id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId
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
          name: user?.fullName || shippingAddress?.fullName || "",
          email: user?.email || "",
          contact: shippingAddress?.phone || ""
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

    } catch (error) {
      console.error("Order Failed:", error);
      alert(error.message || "Something went wrong while placing order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background selection:bg-accent selection:text-white font-sans text-text-primary min-h-screen">

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* PROGRESS STEPPER */}
        <div className="flex items-center justify-center mb-12 sm:mb-20 max-w-3xl mx-auto px-4">
          <StepperItem
            label="Cart"
            active={false}
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
                  className="flex justify-between items-center mb-8 sticky top-20 bg-background/95 backdrop-blur-sm z-40 py-4 -mx-4 px-4 border-b border-border-subtle md:border-0 md:bg-transparent md:backdrop-blur-none"
                >
                  <h2 className="text-xl md:text-2xl font-primary uppercase tracking-tight leading-none">Shipping Interface</h2>
                  {user?.addresses?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                      className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-text-primary transition-all px-3 py-2 rounded-lg"
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
                  className="text-2xl font-primary uppercase tracking-tight mb-8 sticky top-20 bg-background/95 backdrop-blur-sm z-40 py-4 -mx-4 px-4 border-b border-border-subtle md:border-0 md:bg-transparent md:backdrop-blur-none"
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
                    {/* DELIVERY METHOD SELECTION */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryMethod: "DELIVERY" })}
                        className={`p-6 border-2 rounded-2xl transition-all duration-300 text-left relative overflow-hidden luxury-card ${formData.deliveryMethod === "DELIVERY" ? 'border-accent bg-secondary shadow-lg' : 'border-border-subtle opacity-60 hover:opacity-100'}`}
                      >
                        <span className="material-symbols-outlined text-accent mb-2">local_shipping</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">Home Delivery</p>
                        <p className="text-[8px] text-text-muted uppercase mt-1">3-5 Nodes Commitment</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryMethod: "PICKUP" })}
                        className={`p-6 border-2 rounded-2xl transition-all duration-300 text-left relative overflow-hidden luxury-card ${formData.deliveryMethod === "PICKUP" ? 'border-accent bg-secondary shadow-lg' : 'border-border-subtle opacity-60 hover:opacity-100'}`}
                      >
                        <span className="material-symbols-outlined text-accent mb-2">storefront</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">Store Pickup</p>
                        <p className="text-[8px] text-accent uppercase mt-1 font-bold">Ready in 2 Hours</p>
                      </button>
                    </div>

                    {formData.deliveryMethod === "DELIVERY" ? (
                      <>
                        {!showNewAddressForm && user?.addresses?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.addresses.map((addr) => (
                              <div
                                key={addr._id}
                                onClick={() => setSelectedAddressId(addr._id)}
                                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 relative group luxury-card ${selectedAddressId === addr._id ? 'border-accent bg-secondary shadow-lg' : 'border-border-subtle hover:border-accent/30'}`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">{addr.fullName}</p>
                                  {selectedAddressId === addr._id && (
                                    <span className="material-symbols-outlined text-accent text-lg">verified</span>
                                  )}
                                </div>
                                <p className="text-xs text-text-muted leading-relaxed uppercase tracking-wider">
                                  {addr.streetAddress},<br />
                                  {addr.city}, {addr.state} - {addr.pinCode}
                                </p>
                                <p className="mt-4 text-[10px] font-black text-text-tertiary tracking-widest">DIGITAL: {addr.phone}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/30 p-8 rounded-3xl border border-dashed border-border-subtle">
                            <div className="space-y-2 md:col-span-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">First Name</label>
                              <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required={showNewAddressForm}
                                className="luxury-input w-full"
                                placeholder="James"
                                type="text"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Last Name</label>
                              <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required={showNewAddressForm}
                                className="luxury-input w-full"
                                placeholder="Stirling"
                                type="text"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Digital Contact</label>
                              <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required={showNewAddressForm}
                                className="luxury-input w-full"
                                placeholder="+91 XXXXX XXXXX"
                                type="tel"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Street Domain</label>
                              <input
                                name="addressLine"
                                value={formData.addressLine}
                                onChange={handleInputChange}
                                required={showNewAddressForm}
                                className="luxury-input w-full"
                                placeholder="245 Fifth Avenue, Apartment 4B"
                                type="text"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Urban City</label>
                              <input
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required={showNewAddressForm}
                                className="luxury-input w-full"
                                placeholder="New York"
                                type="text"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Regional State</label>
                              <input
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required={showNewAddressForm}
                                className="luxury-input w-full"
                                placeholder="New York"
                                type="text"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Zip Protocol</label>
                              <input
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                required={showNewAddressForm}
                                className="luxury-input w-full"
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
                            className="luxury-button"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </>
                    ) : (
                      /* STORE PICKUP UI */
                      <div className="space-y-8 animate-fadeIn">
                        <div className="p-8 bg-secondary/50 rounded-3xl border border-border-subtle backdrop-blur-md relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                              <span className="material-symbols-outlined text-8xl">store</span>
                           </div>
                           <h3 className="text-xl font-primary uppercase tracking-tight mb-4">{selectedStore.name}</h3>
                           <div className="space-y-4 relative z-10">
                              <div className="flex items-start gap-4">
                                 <span className="material-symbols-outlined text-accent">location_on</span>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Location Protocol</p>
                                    <p className="text-xs font-bold leading-relaxed">{selectedStore.address}</p>
                                    <a href={selectedStore.mapLink} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-accent hover:underline mt-2 block tracking-widest">Open in Maps →</a>
                                 </div>
                              </div>
                              <div className="flex items-start gap-4">
                                 <span className="material-symbols-outlined text-accent">schedule</span>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Operational Window</p>
                                    <p className="text-xs font-bold">{selectedStore.hours}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">Select Capture Slot</h4>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {["Today, 2PM-4PM", "Today, 4PM-6PM", "Today, 6PM-8PM", "Tomorrow, 10AM-12PM", "Tomorrow, 12PM-2PM"].map((slot) => (
                                 <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, pickupTime: slot })}
                                    className={`p-4 border rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formData.pickupTime === slot ? 'border-accent bg-accent text-white shadow-lg' : 'border-border-subtle bg-background hover:border-accent/50'}`}
                                 >
                                    {slot}
                                 </button>
                              ))}
                           </div>
                           <p className="text-[9px] text-accent font-black uppercase tracking-widest text-center mt-6 animate-pulse">Your order will be ready for pickup at the selected time</p>
                        </div>
                        <div className="mt-12 flex justify-end">
                          <button
                            type="button"
                            onClick={goToPayment}
                            className="luxury-button"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </div>
                    )}
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
                    <section className="bg-secondary/50 p-8 rounded-2xl border border-border-subtle relative">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-primary uppercase tracking-tight">Review & Pay</h2>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep("shipping")}
                          className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-text-primary transition-all underline underline-offset-4"
                        >
                          Modify Destination
                        </button>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-accent text-xl">location_on</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">
                            {formData.deliveryMethod === "DELIVERY" ? "Shipping To" : "Pickup From"}
                          </p>
                          <p className="text-sm font-bold uppercase">
                            {formData.deliveryMethod === "DELIVERY" ? selectedAddress?.fullName : selectedStore.name}
                          </p>
                          <p className="text-sm text-text-muted uppercase tracking-wider mt-1">
                            {formData.deliveryMethod === "DELIVERY" 
                              ? `${selectedAddress?.streetAddress}, ${selectedAddress?.city}, ${selectedAddress?.state} - ${selectedAddress?.pinCode}, IN`
                              : selectedStore.address}
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
                          {formData.deliveryMethod === "PICKUP" ? (
                            <PaymentOption
                              id="CASH_ON_PICKUP"
                              title="Cash on Pickup"
                              desc="Pay at store during pickup"
                              icon="payments"
                              active={formData.paymentMethod === "CASH_ON_PICKUP"}
                              onClick={() => setFormData({ ...formData, paymentMethod: "CASH_ON_PICKUP" })}
                            />
                          ) : (
                            <PaymentOption
                              id="COD"
                              title="Cash on Delivery"
                              desc="Pay when delivered"
                              icon="payments"
                              active={formData.paymentMethod === "COD"}
                              onClick={() => setFormData({ ...formData, paymentMethod: "COD" })}
                            />
                          )}
                        </div>
                      </div>
                    </section>
                  </motion.div>
                ) : (
                  /* SUCCESS SECTION */
                  <motion.div
                    key="done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 md:py-24 text-center min-h-[60vh] relative overflow-hidden"
                  >
                    {/* Sparkle Particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.span
                          key={i}
                          className="material-symbols-outlined absolute text-accent/30 animate-sparkle"
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            fontSize: `${Math.random() * 20 + 20}px`,
                            animationDelay: `${i * 0.5}s`
                          }}
                        >
                          sparkle
                        </motion.span>
                      ))}
                    </div>

                    <div className="relative mb-12">
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-32 h-32 md:w-40 md:h-40 bg-text-primary rounded-full flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative z-10 animate-luxury-glow"
                      >
                        <motion.span
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="material-symbols-outlined text-primary text-6xl md:text-7xl"
                        >
                          verified
                        </motion.span>
                      </motion.div>
                      <div className="absolute -inset-4 border border-accent/20 rounded-full animate-ping opacity-20" />
                    </div>

                    <div className="space-y-6 max-w-lg mx-auto z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <h2 className="text-4xl md:text-6xl font-primary uppercase tracking-tighter leading-none mb-4">Order Confirmed</h2>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-accent">
                          {formData.paymentMethod === "CASH_ON_PICKUP" ? "Pay at Store during Pickup" : "Payment Verified • Bag Captured"}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="bg-secondary p-8 rounded-[2rem] border border-border-subtle mt-8 space-y-4"
                      >
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                          <span>Order Identifier</span>
                          <span className="text-text-primary">#{completedOrderId?.slice(-12).toUpperCase() || 'FENRIR-ERA-01'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                          <span>{formData.deliveryMethod === "DELIVERY" ? "Delivery Commitment" : "Pickup Slot"}</span>
                          <span className="text-text-primary">
                            {formData.deliveryMethod === "DELIVERY" ? "Standard • 3-5 Nodes" : formData.pickupTime}
                          </span>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
                      >
                        <Link to="/account/orders" className="luxury-button !px-12">View Timeline</Link>
                        <Link to="/" className="luxury-button !bg-background !text-text-primary border border-border-subtle hover:!bg-secondary !px-12">Continue Ritual</Link>
                      </motion.div>
                    </div>

                    <div className="mt-12 w-48 h-1 bg-border-subtle/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5 }}
                        className="h-full bg-accent"
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
                  <h3 className="text-2xl font-[Oswald] uppercase tracking-tight">Your Bag ({checkoutItems.length} {checkoutItems.length === 1 ? 'Item' : 'Items'})</h3>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {checkoutItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="w-20 aspect-[3/4] rounded-2xl overflow-hidden bg-background border border-border-subtle/50 flex-shrink-0 relative shadow-sm">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-all duration-700"
                          />
                        </div>
                        <div className="flex-1 py-1">
                          <p className="text-[11px] font-black uppercase tracking-widest truncate text-text-primary">{item.title}</p>
                          <p className="text-[10px] text-text-muted uppercase mt-1 tracking-widest font-bold">Qty: {item.qty || 1} | Size: {item.size}</p>
                          <p className="text-lg font-primary tracking-tight mt-2">₹{(item.price * (item.qty || 1)).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-border-subtle">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                      <span>Base Subtotal</span>
                      <span className="text-text-primary">₹{(subtotal - checkoutItems.reduce((acc, item) => acc + (item.price - (item.basePrice || item.price)) * (item.qty || 1), 0)).toLocaleString()}</span>
                    </div>
                    {checkoutItems.some(item => (item.price - (item.basePrice || item.price)) > 0) && (
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-accent">
                        <span>Customization</span>
                        <span className="font-bold">+₹{checkoutItems.reduce((acc, item) => acc + (item.price - (item.basePrice || item.price)) * (item.qty || 1), 0).toLocaleString()}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <span>Offer Discount ({appliedCoupon.code})</span>
                        <span className="font-bold">-₹{(appliedCoupon.discountAmount || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                      <span>{formData.deliveryMethod === "DELIVERY" ? "Shipping" : "Pickup Process"}</span>
                      <span className="text-accent font-bold uppercase">Complimentary</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                      <span>GST Estimation</span>
                      <span className="text-text-primary">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-8 border-t border-border-subtle flex justify-between items-end">
                      <span className="text-lg font-primary uppercase tracking-tighter">Total Due</span>
                      <span className="text-4xl font-primary tracking-tight text-text-primary">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {checkoutStep === "shipping" ? (
                    <button
                      type="button"
                      onClick={goToPayment}
                      className="luxury-button w-full h-20 flex items-center justify-center gap-3 animate-slideUp"
                    >
                      Continue to Payment
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="luxury-button w-full h-20 flex items-center justify-center gap-3 disabled:opacity-50 animate-slideUp"
                    >
                      {isProcessing ? "Validating Protocol..." : "Complete Ritual"}
                      {!isProcessing && <span className="material-symbols-outlined">shield_with_heart</span>}
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
              backgroundColor: completed ? "#B8860B" : active ? "#1A1A1A" : "#F4F2E9",
            }}
            className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm`}
          >
            {completed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="material-symbols-outlined text-[12px] text-white font-bold"
              >
                verified
              </motion.span>
            )}
          </motion.div>
          {active && (
            <motion.div
              layoutId="stepper-ring"
              className="absolute -inset-1.5 border border-accent/30 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${active || completed ? 'text-text-primary' : 'text-text-tertiary'}`}>
          {label}
        </span>
      </div>
      {showLine && (
        <div className="flex-1 h-[1px] bg-secondary mb-6 relative overflow-hidden mx-2">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: lineActive ? "100%" : "0%" }}
            className="absolute inset-0 bg-accent/20"
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
      className={`flex items-center justify-between p-6 border-2 rounded-3xl cursor-pointer transition-all duration-500 relative overflow-hidden group/opt luxury-card
        ${active ? 'border-accent bg-secondary shadow-lg' : 'border-border-subtle hover:border-accent/20'}
      `}
    >
      {active && (
        <motion.div
          layoutId="payment-active-bg"
          className="absolute inset-0 bg-accent/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${active ? 'border-accent bg-accent' : 'border-border-subtle'}
        `}>
          {active && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
        </div>
        <div>
          <p className={`text-sm font-black uppercase tracking-widest transition-colors ${active ? 'text-text-primary' : 'text-text-tertiary group-hover/opt:text-text-primary'}`}>{title}</p>
          <p className="text-[10px] text-text-muted uppercase mt-1 tracking-wider">{desc}</p>
        </div>
      </div>
      <span className={`material-symbols-outlined transition-all duration-300 relative z-10 
        ${active ? 'text-accent scale-110' : 'text-border-subtle group-hover/opt:text-accent'}`}>{icon}</span>
    </label>
  );
}
