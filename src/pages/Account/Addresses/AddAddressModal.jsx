import { useEffect, useState } from "react";
import api from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const AddAddressModal = ({
    open,
    onClose,
    onSave,
    initialData = null,
    addressId = null,
}) => {

    const [form, setForm] = useState({
        name: "",
        phone: "",
        house: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // 🔥 Prefill when editing
    useEffect(() => {
        if (initialData) {
            const parts = initialData.streetAddress?.split(",") || [];

            setForm({
                name: `${initialData.firstName || ""} ${initialData.lastName || ""}`.trim(),
                phone: initialData.phone || "",
                house: parts[0]?.trim() || "",
                area: parts[1]?.trim() || "",
                landmark: parts[2]?.trim() || "",
                city: initialData.city || "",
                state: "",
                pincode: initialData.pinCode || "",
                isDefault: initialData.isDefault || false,
            });
        } else {
            setForm({
                name: "",
                phone: "",
                house: "",
                area: "",
                landmark: "",
                city: "",
                state: "",
                pincode: "",
                isDefault: false,
            });
        }
    }, [initialData, open]);

    // 🔒 Lock scroll
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => (document.body.style.overflow = "");
    }, [open]);

    const validate = () => {
        const newErrors = {};

        if (!/^[6-9]\d{9}$/.test(form.phone)) {
            newErrors.phone = "Enter a valid 10-digit mobile number";
        }

        if (!/^\d{6}$/.test(form.pincode)) {
            newErrors.pincode = "Enter a valid 6-digit pincode";
        }

        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.house.trim()) newErrors.house = "House/Flat is required";
        if (!form.area.trim()) newErrors.area = "Area is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.state.trim()) newErrors.state = "State is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);

            const payload = {
                fullName: form.name.trim(),
                phone: form.phone,
                streetAddress: `${form.house}, ${form.area}, ${form.landmark || ""}`,
                city: form.city,
                state: form.state,
                pinCode: form.pincode,
            };

            let savedAddressId = addressId;

            // 🔥 ADD
            if (!addressId) {
                const res = await api.post("/users/addresses", payload);
                const addresses = res.data.data;
                savedAddressId = addresses[addresses.length - 1]?._id;
            }
            // 🔥 UPDATE
            else {
                await api.put(`/users/address/${addressId}`, payload);
            }

            // 🔥 Set Default
            if (form.isDefault && savedAddressId) {
                await api.patch(`/users/addresses/${savedAddressId}/default`);
            }

            onSave?.();
            onClose();

        } catch (error) {
            console.error("Address save error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white border border-black/5 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="px-10 py-10 border-b border-black/[0.03] flex justify-between items-center bg-black/[0.01]">
                            <div>
                                <h2 className="text-3xl font-impact tracking-tight text-black uppercase">{addressId ? "Modify Shipping Node" : "Add Shipping Node"}</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mt-1">Global Routing & Identity Protocol</p>
                            </div>
                            <button className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black hover:text-white hover:scale-110 active:scale-95 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.02)]" onClick={onClose}>
                                <span className="material-symbols-outlined text-xl transition-transform hover:rotate-90">close</span>
                            </button>
                        </header>

                        <form className="p-10 md:p-14 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="flex flex-col gap-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">Full Name</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="bg-black/[0.02] border border-black/10 rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none"
                                    />
                                    {errors.name && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.name}</span>}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">Mobile Number</label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className={`bg-black/[0.02] border rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none ${errors.phone ? "border-rose-500/50" : "border-black/10"}`}
                                    />
                                    {errors.phone && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.phone}</span>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">House / Flat No.</label>
                                <input
                                    name="house"
                                    value={form.house}
                                    onChange={handleChange}
                                    className="bg-black/[0.02] border border-black/10 rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none"
                                />
                                {errors.house && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.house}</span>}
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">Area / Street / Locality</label>
                                <input
                                    name="area"
                                    value={form.area}
                                    onChange={handleChange}
                                    className="bg-black/[0.02] border border-black/10 rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none"
                                />
                                {errors.area && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.area}</span>}
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">Landmark (Optional)</label>
                                <input
                                    name="landmark"
                                    value={form.landmark}
                                    onChange={handleChange}
                                    className="bg-black/[0.02] border border-black/10 rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="flex flex-col gap-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">City</label>
                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        className="bg-black/[0.02] border border-black/10 rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none"
                                    />
                                    {errors.city && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.city}</span>}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">State</label>
                                    <input
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        className="bg-black/[0.02] border border-black/10 rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none"
                                    />
                                    {errors.state && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.state}</span>}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8b7e6d]">Pincode</label>
                                    <input
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        className={`bg-black/[0.02] border rounded-2xl px-8 py-5 text-black text-[12px] font-bold tracking-[0.1em] focus:border-[#8b7e6d] focus:bg-black/[0.04] transition-all outline-none ${errors.pincode ? "border-rose-500/50" : "border-black/10"}`}
                                    />
                                    {errors.pincode && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.pincode}</span>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-8 bg-black/[0.02] border border-black/[0.03] rounded-3xl group transition-all hover:bg-black/[0.04]">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Default Address</p>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/20 mt-1">Set as primary node for all logistics</p>
                                </div>
                                <label className="relative inline-block w-14 h-7">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={form.isDefault}
                                        onChange={handleChange}
                                        className="opacity-0 w-0 h-0 peer"
                                    />
                                    <span className="absolute inset-0 bg-black/10 rounded-full transition-all peer-checked:bg-[#8b7e6d] before:content-[''] before:absolute before:h-5 before:w-5 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-7 peer-checked:before:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] peer-checked:shadow-[0_0_15px_rgba(212,196,177,0.4)]" />
                                </label>
                            </div>

                            <div className="modal-actions flex gap-6 pt-10 uppercase font-black tracking-[0.3em] text-[10px]">
                                <button type="submit" className="flex-1 bg-black text-white py-6 rounded-2xl hover:bg-[#8b7e6d] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                                    {loading ? "Processing..." : addressId ? "Update Protocol" : "Initialize Archive"}
                                </button>
                                <button
                                    type="button"
                                    className="px-12 border border-black/10 text-black/40 hover:text-black hover:bg-black/5 hover:border-black/20 rounded-2xl transition-all"
                                    onClick={onClose}
                                >
                                    Abort
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddAddressModal;