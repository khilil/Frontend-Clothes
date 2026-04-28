
import { useState, useEffect } from "react";
import {
    getAddressesAPI,
    setDefaultAddressAPI
} from "../../../features/address/addressService";
import api from "../../../services/api";
import AddAddressModal from "./AddAddressModal";

const Addresses = () => {
    const [open, setOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);



    const fetchAddresses = async () => {
        try {
            const data = await getAddressesAPI();
            setAddresses(data);
        } catch (err) {
            console.error("Fetch address error:", err);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSetDefault = async (id) => {
        await setDefaultAddressAPI(id);
        await fetchAddresses();
    };

    const handleDelete = async (id) => {
        await api.delete(`/users/address/${id}`);
        await fetchAddresses();
    };

    return (
        <div className="w-full text-white">

            {/* 📍 ADDRESS BOOK */}
            <header className="mb-16 border-b border-black/[0.03] pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-impact text-5xl md:text-6xl uppercase tracking-tight text-black">
                        Address Book
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-black/30 mt-4">
                        Manage your shipping addresses
                    </p>
                </div>

                <div className="text-[10px] uppercase tracking-[0.4em] font-black text-black/20">
                    Addresses: {addresses.length.toString().padStart(2, '0')}
                </div>
            </header>            {open ? (
                <AddAddressModal
                    open={open}
                    onClose={() => {
                        setOpen(false);
                        setEditingAddress(null);
                    }}
                    onSave={fetchAddresses}
                    initialData={editingAddress}
                    addressId={editingAddress?._id}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

                    {/* ADD NEW */}
                    <button
                        className="bg-black/[0.01] border border-dashed border-black/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-8 group hover:border-[#8b7e6d] hover:bg-black/[0.03] transition-all duration-700 min-h-[350px] shadow-[0_10px_30px_rgba(0,0,0,0.01)]"
                        onClick={() => {
                            setEditingAddress(null); 
                            setOpen(true);
                        }}
                    >
                        <div className="add-icon w-20 h-20 bg-black/5 rounded-full flex items-center justify-center text-black/30 group-hover:bg-black group-hover:text-white group-hover:scale-110 transition-all duration-700 shadow-[0_10px_20px_rgba(0,0,0,0.03)]">
                            <span className="material-symbols-outlined text-4xl">add</span>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black/30 group-hover:text-black transition-colors">Add New Address</span>
                    </button>

                    {addresses.map((addr) => (
                        <div
                            key={addr._id}
                            className={`bg-white border rounded-3xl p-10 relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-700 ${addr.isDefault ? "border-[#d4c4b1] shadow-[0_0_30px_rgba(212,196,177,0.1)]" : "border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"}`}
                        >
                            {addr.isDefault && (
                                <span className="absolute top-6 right-6 bg-[#d4c4b1] text-black text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">Default Address</span>
                            )}

                            <div className="mb-10">
                                <h3 className="text-xl font-impact tracking-tight text-black mb-8 uppercase opacity-60">Address Details</h3>

                                <div className="mb-6">
                                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30 mb-2 block">Full Name</label>
                                    <p className="text-base font-impact tracking-tight text-black uppercase">{addr.fullName}</p>
                                </div>

                                <div>
                                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30 mb-2 block">Address</label>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/60 leading-relaxed">
                                        {addr.streetAddress} <br />
                                        {addr.city} - {addr.pinCode}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto pt-10 border-t border-black/[0.03] flex flex-wrap gap-8">
                                <button
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-black transition-all group/btn"
                                    onClick={() => {
                                        setEditingAddress(addr);
                                        setOpen(true);
                                    }}
                                >
                                    <span className="material-symbols-outlined text-lg group-hover/btn:rotate-12 transition-transform text-[#8b7e6d]">edit</span>
                                    Edit
                                </button>

                                {!addr.isDefault && (
                                    <button
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-black transition-all group/btn"
                                        onClick={() => handleSetDefault(addr._id)}
                                    >
                                        <span className="material-symbols-outlined text-lg group-hover/btn:scale-125 transition-transform text-[#8b7e6d]">star</span>
                                        Set as Default
                                    </button>
                                )}

                                <button
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60 hover:text-rose-600 transition-all group/btn ml-auto"
                                    onClick={() => handleDelete(addr._id)}
                                >
                                    <span className="material-symbols-outlined text-lg group-hover/btn:scale-110 transition-transform">delete</span>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Addresses;