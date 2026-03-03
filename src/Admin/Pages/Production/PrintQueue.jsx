import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Printer,
    Layers,
    CheckCircle2,
    AlertCircle,
    Download,
    PlusSquare,
    ChevronRight,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react';
import { API_BASE_URL } from '../../../services/api';

const PrintQueue = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDesigns, setSelectedDesigns] = useState([]);
    const [filterType, setFilterType] = useState('DTF');
    const [isBatching, setIsBatching] = useState(false);

    useEffect(() => {
        fetchQueue();
    }, [filterType]);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/production/queue?type=${filterType}`, { withCredentials: true });
            setQueue(res.data.data);
        } catch (error) {
            console.error("Failed to fetch production queue", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedDesigns(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreateBatch = async () => {
        if (selectedDesigns.length === 0) return;
        try {
            setIsBatching(true);
            await axios.post(`${API_BASE_URL}/production/batch`, {
                designIds: selectedDesigns,
                printType: filterType
            }, { withCredentials: true });

            alert("Batch created successfully! PDF is being generated.");
            setSelectedDesigns([]);
            fetchQueue();
        } catch (error) {
            alert("Failed to create batch");
        } finally {
            setIsBatching(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 dark:bg-[#0f172a] min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <Printer size={28} />
                        </div>
                        Print Production Queue
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Manage pending designs and generate high-fidelity gang sheets.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex">
                        {['DTF', 'Embroidery'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === type
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleCreateBatch}
                        disabled={selectedDesigns.length === 0 || isBatching}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all
                            ${selectedDesigns.length > 0
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isBatching ? 'Processing...' : (
                            <>
                                <PlusSquare size={18} />
                                Create Print Batch ({selectedDesigns.length})
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Assets</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{queue.length}</h3>
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Layers size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Selection</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{selectedDesigns.length}</h3>
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Health</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-emerald-500">OPTIMAL</h3>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table Wrapper */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search orders, SKU or customers..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                    </div>
                    <button className="p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600"
                                        checked={selectedDesigns.length === queue.length && queue.length > 0}
                                        onChange={() => {
                                            if (selectedDesigns.length === queue.length) setSelectedDesigns([]);
                                            else setSelectedDesigns(queue.map(q => q._id));
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-4">Design Preview</th>
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Technical Audit</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600 mx-auto"></div>
                                        <p className="text-slate-400 mt-4 font-bold text-xs uppercase tracking-widest">Synchronizing Queue...</p>
                                    </td>
                                </tr>
                            ) : queue.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-400 uppercase font-black tracking-widest text-sm">
                                        No pending designs in queue
                                    </td>
                                </tr>
                            ) : (
                                queue.map((design) => (
                                    <tr
                                        key={design._id}
                                        className={`group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all cursor-pointer ${selectedDesigns.includes(design._id) ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
                                        onClick={() => toggleSelection(design._id)}
                                    >
                                        <td className="px-6 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600"
                                                checked={selectedDesigns.includes(design._id)}
                                                onChange={() => toggleSelection(design._id)}
                                            />
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <div className="relative w-20 h-24 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:shadow-lg transition-all scale-95 group-hover:scale-100 p-1">
                                                <img
                                                    src={design.originalImageURL}
                                                    alt="Design"
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute top-1 right-1">
                                                    <span className={`text-[8px] px-1 py-0.5 rounded font-black border uppercase ${design.qualityStatus?.isLowQuality
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        }`}>
                                                        {design.qualityStatus?.isLowQuality ? 'LOW' : 'HIGH'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">Order #{design.orderId?._id?.slice(-8)}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                                    ID: {design._id.slice(-6)}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span className="material-icons text-[10px] text-slate-400">schedule</span>
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        {new Date(design.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase w-16">Res:</span>
                                                    <span className={`text-xs font-black ${(!design.metadata?.width || design.metadata?.width < 4500) ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {design.metadata?.width || '---'} x {design.metadata?.height || '---'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase w-16">DPI:</span>
                                                    <span className={`text-xs font-black ${(design.metadata?.width && (design.metadata.width / 15 < 300)) ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {design.metadata?.width ? Math.round(design.metadata.width / 15) : 'N/A'} (est.)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase w-16">Alpha:</span>
                                                    <span className={`text-xs font-black ${design.metadata?.hasAlpha ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {design.metadata?.hasAlpha ? 'Preserved' : 'None'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                                In Queue
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    title="View Full Quality"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!design.originalImageURL) return;

                                                        // Handle Data URLs or regular URLs
                                                        if (design.originalImageURL.startsWith('data:')) {
                                                            const link = document.createElement('a');
                                                            link.href = design.originalImageURL;
                                                            link.download = `design-${design.orderId?._id || 'asset'}.png`;
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        } else {
                                                            window.open(design.originalImageURL, '_blank');
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PrintQueue;
