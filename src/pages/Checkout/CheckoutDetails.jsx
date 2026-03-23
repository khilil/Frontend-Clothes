import { useState } from "react";

import { Link, useLocation } from "react-router-dom";

export default function CheckoutDetails() {
    const [delivery, setDelivery] = useState("standard");
    const [payment, setPayment] = useState("upi");

    const location = useLocation();

    const {
        cart = [],
        subtotal = 0,
        tax = 0,
        total = 0,
        payment: initialPayment = "card"
    } = location.state || {};

    const deliveryCharge =
        delivery === "express" ? 150 : 0;
    const finalTotal = subtotal + tax + deliveryCharge;


    return (
        <div className="min-h-screen bg-white text-black font-[Inter] m-0 p-0">

            {/* PROGRESS */}
            <div className="flex justify-center gap-6 mx-auto px-8 py-14 max-w-7xl">
                <Step label="Cart" active />
                <Step label="Shipping" active />
                <Step label="Payment" />
                <Step label="Done" muted />
            </div>

            {/* MAIN */}
            <main className="flex flex-col lg:flex-row gap-16 pb-20 mx-auto px-8 max-w-7xl">
                {/* LEFT */}
                <div className="flex-1 flex flex-col gap-14">
                    <Section step="01" title="Customer Details">
                        <div className="bg-white border border-[#e5e5e5] rounded-[28px] p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Full Name" placeholder="Arjun Kapoor" full />
                            <PhoneField />
                            <Field label="Email Address (Optional)" placeholder="arjun@example.com" />
                        </div>
                    </Section>

                    <Section step="02" title="Shipping Address">
                        <div className="bg-white border border-[#e5e5e5] rounded-[28px] p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Pincode" placeholder="400001" accent />
                            <p className="text-[10px] text-[#717171] italic flex items-end">Automatic City / State detection enabled</p>
                            <Field label="House / Street" placeholder="Flat 402, Worli" full />
                            <Field label="City" placeholder="Mumbai" />
                            <Field label="State" placeholder="Maharashtra" />
                        </div>
                    </Section>

                    <Section step="03" title="Delivery Method">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Delivery
                                active={delivery === "standard"}
                                onClick={() => setDelivery("standard")}
                                icon="local_shipping"
                                title="Standard Delivery"
                                subtitle="Estimated: Oct 24 – Oct 26"
                                price="FREE"
                                free
                            />
                            <Delivery
                                active={delivery === "express"}
                                onClick={() => setDelivery("express")}
                                icon="bolt"
                                title="Express Priority"
                                subtitle="Estimated: Oct 21 – Oct 22"
                                price="₹150.00"
                            />
                        </div>
                    </Section>

                    <Section step="04" title="Payment Method">
                        <Payment
                            active={payment === "upi"}
                            onClick={() => setPayment("upi")}
                            title="UPI Payment"
                            subtitle="Google Pay, PhonePe, Paytm"
                        />
                        <Payment
                            active={payment === "card"}
                            onClick={() => setPayment("card")}
                            title="Credit / Debit Card"
                            subtitle="Visa, Mastercard, RuPay"
                            icon="credit_card"
                        />
                    </Section>
                </div>

                {/* RIGHT */}
                <aside className="w-full lg:w-[450px] bg-[#f7f7f7] rounded-[32px] p-9 sticky top-[120px] self-start">
                    <h3 className="font-[Oswald] text-2xl mb-8 uppercase tracking-[-0.02em]">ORDER SUMMARY</h3>

                    <div className="flex flex-col gap-5 mb-6">
                        {cart.map(item => (
                            <SummaryItem
                                key={item.id}
                                title={item.title}
                                size={item.size}
                                price={`₹ ${(item.price * item.qty).toFixed(2)}`}
                                image={item.image}   // ✅ ADD THIS
                            />
                        ))}
                    </div>


                    <div className="flex justify-between text-[10px] font-black tracking-[0.15em] uppercase mt-3.5">
                        <span>Subtotal</span>
                        <span>₹ {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-[10px] font-black tracking-[0.15em] uppercase mt-3.5">
                        <span>Shipping</span>
                        <span className={deliveryCharge === 0 ? "text-[#059669]" : ""}>
                            {deliveryCharge === 0 ? "Free" : `₹ ${deliveryCharge.toFixed(2)}`}
                        </span>
                    </div>

                    <div className="flex justify-between text-[10px] font-black tracking-[0.15em] uppercase mt-3.5">
                        <span>GST</span>
                        <span>₹ {tax.toFixed(2)}</span>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#ddd] flex justify-between items-end">
                        <span className="font-[Oswald] text-lg">Total</span>
                        <strong className="font-[Oswald] text-3xl tracking-tight">₹ {finalTotal.toFixed(2)}</strong>
                    </div>



                    <button className="w-full h-16 mt-8 bg-black text-white rounded-[16px] text-xs font-black tracking-[0.3em] uppercase flex items-center justify-center gap-3 cursor-pointer transition-colors duration-250 hover:bg-[#d4c4b1] hover:text-black">
                        Place Order
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </aside>
            </main>

        </div>
    );
}

/* COMPONENTS */

const Step = ({ label, active, muted }) => (
    <div className={`flex items-center gap-3 text-[10px] font-black tracking-[0.25em] uppercase ${muted ? "opacity-30" : ""}`}>
        <span>{label}</span>
        {!muted && <div className={`w-16 h-0.5 bg-[#eee] ${active ? "!bg-[#000]" : ""}`} />}
    </div>
);

const Section = ({ step, title, children }) => (
    <section>
        <div className="flex items-center gap-3 mb-7">
            <span className="w-8 h-8 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">{step}</span>
            <h2 className="font-[Oswald] text-2xl tracking-[-0.02em]">{title}</h2>
        </div>
        {children}
    </section>
);

const Field = ({ label, placeholder, full, accent }) => (
    <div className={full ? "col-span-1 md:col-span-2" : ""}>
        <label className="text-[10px] font-black tracking-[0.18em] uppercase text-[#717171] block mb-2">{label}</label>
        <input className={`w-full p-4 rounded-[14px] border border-[#ddd] text-[13px] focus:outline-none focus:border-black ${accent ? "!border-2 !border-[#d4c4b1] bg-[#faf7f3] font-bold" : ""}`} placeholder={placeholder} />
    </div>
);

const PhoneField = () => (
    <div>
        <label className="text-[10px] font-black tracking-[0.18em] uppercase text-[#717171] block mb-2">Mobile Number</label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 border-r border-[#ddd] pr-2.5 font-bold">+91</span>
            <input className="w-full pl-[70px] pr-[100px] p-4 rounded-[14px] border border-[#ddd] text-[13px] focus:outline-none focus:border-black" placeholder="9876543210" />
            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black text-white text-[9px] font-black tracking-[0.2em] px-3.5 py-2 rounded-lg cursor-pointer hover:bg-[#d4c4b1] hover:text-black transition-colors">Get OTP</button>
        </div>
    </div>
);

const Delivery = ({ icon, title, subtitle, price, free, active, onClick }) => (
    <label className={`border rounded-[20px] p-6 cursor-pointer transition-colors duration-200 bg-white ${active ? "border-2 border-black bg-[#f7f7f7]" : "border-[#ddd] hover:border-black"}`} onClick={onClick}>
        <span className="material-symbols-outlined mb-2 block">{icon}</span>
        <strong className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase">{title}</strong>
        <p className="text-[10px] text-[#717171] mt-1.5">{subtitle}</p>
        <b className={`block mt-4 text-[11px] ${free ? "text-[#059669]" : ""}`}>{price}</b>
    </label>
);

const Payment = ({ title, subtitle, icon, badge, active, onClick }) => (
    <label className={`border rounded-[20px] p-6 flex justify-between items-center cursor-pointer transition-colors duration-200 bg-white mb-3.5 ${active ? "border-2 border-black bg-[#f7f7f7]" : "border-[#ddd] hover:border-black"}`} onClick={onClick}>
        <div>
            <strong className="text-xs tracking-[0.15em] uppercase">{title}</strong>
            <p className="text-[10px] text-[#717171] mt-1">{subtitle}</p>
        </div>
        {icon && <span className="material-symbols-outlined">{icon}</span>}
        {badge && <span className="bg-[#ecfdf5] text-[#059669] text-[9px] font-black tracking-[0.2em] px-2 py-1 rounded-md uppercase">Verified</span>}
    </label>
);

const SummaryItem = ({ title, size, price, image }) => (
    <div className="flex gap-4">
        <img src={image} alt={title} className="w-20 aspect-[3/4] bg-white border border-[#ddd] rounded-xl object-cover" />
        <div>
            <p className="text-[11px] font-black tracking-[0.15em] uppercase">{title}</p>
            <span className="text-[10px] text-[#717171] leading-loose">Size: {size} | Qty: 1</span>
            <strong className="block mt-1.5 font-[Oswald] tracking-wide">{price}</strong>
        </div>
    </div>
);

