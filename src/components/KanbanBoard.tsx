import React, { useState, useMemo, useEffect } from 'react';
import type { Opportunity, OpportunityStatus } from '../types';
import { Search, Calendar, AlertCircle, Download } from 'lucide-react';
import { useOpportunities } from '../store/OpportunityContext';
import { CloseOpportunityModal } from './CloseOpportunityModal';
import { OpportunityDetailModal } from './OpportunityDetailModal';

const COLUMNS: OpportunityStatus[] = [
    'Teklif verildi',
    'Teklif görüşüldü',
    'Teklif detaylandırıldı',
    'Bitmeye çok yakın',
    'Bitti'
];

export const KanbanBoard = () => {
    const { opportunities, updateOpportunityStatus } = useOpportunities();

    const [closingOpp, setClosingOpp] = useState<Opportunity | null>(null);
    const [viewingOpp, setViewingOpp] = useState<Opportunity | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'thisMonth' | 'highValue'>('all');
    const [now, setNow] = useState(Date.now());

    // Update 'now' periodically so stale alerts re-evaluate
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('oppId', id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: OpportunityStatus) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('oppId');
        if (!id) return;

        const opp = opportunities.find(o => o.id === id);
        if (!opp) return;

        // Zaten ayni status ise
        if (opp.status === status) return;

        if (status === 'Bitti') {
            setClosingOpp(opp);
        } else {
            updateOpportunityStatus(id, status);
        }
    };

    const filteredOpportunities = useMemo(() => {
        return opportunities.filter(opp => {
            // Text Search
            const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                opp.customerName.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // Chips Filter
            if (activeFilter === 'highValue') {
                return opp.totalAmount >= 50000;
            }
            if (activeFilter === 'thisMonth') {
                const oppDate = new Date(opp.createdAt);
                const current = new Date();
                return oppDate.getMonth() === current.getMonth() && oppDate.getFullYear() === current.getFullYear();
            }

            return true;
        });
    }, [opportunities, searchTerm, activeFilter]);

    const handleExportCSV = () => {
        // Prepare CSV Data
        const headers = ['Müşteri Adı', 'Fırsat Adı', 'Durum', 'Toplam Tutar (₺)', 'Oluşturulma Tarihi', 'Son Güncelleme', 'İletişim Adı', 'İletişim E-posta', 'İletişim Telefon', 'Eğitim Sayısı', 'Notlar'];

        const rows = filteredOpportunities.map(opp => [
            `"${opp.customerName.replace(/"/g, '""')}"`,
            `"${opp.name.replace(/"/g, '""')}"`,
            `"${opp.status}"`,
            opp.totalAmount,
            `"${new Date(opp.createdAt).toLocaleDateString('tr-TR')}"`,
            `"${new Date(opp.lastUpdatedAt || opp.createdAt).toLocaleDateString('tr-TR')}"`,
            `"${opp.contact.firstName} ${opp.contact.lastName}"`,
            `"${opp.contact.email}"`,
            `"${opp.contact.phone}"`,
            opp.trainings.length,
            `"${(opp.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel Turkish chars
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `franko_firsatlar_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 px-2 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Fırsat veya müşteri ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/60 focus:bg-white border border-slate-200/60 rounded-xl outline-none focus:ring-2 focus:ring-primary-400/50 transition-all text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'all' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-white/60 text-slate-600 hover:bg-white border border-slate-200/60'}`}
                    >
                        Tümü
                    </button>
                    <button
                        onClick={() => setActiveFilter('thisMonth')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'thisMonth' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-white/60 text-slate-600 hover:bg-white border border-slate-200/60'}`}
                    >
                        <Calendar size={16} />
                        Bu Ay
                    </button>
                    <button
                        onClick={() => setActiveFilter('highValue')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'highValue' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-white/60 text-slate-600 hover:bg-white border border-slate-200/60'}`}
                    >
                        Değerli (&gt;50k₺)
                    </button>
                    <div className="w-px h-8 bg-slate-200 hidden sm:block mx-1"></div>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-400"
                        title="Excel/CSV Olarak İndir"
                    >
                        <Download size={16} />
                        İndir
                    </button>
                </div>
            </div>

            <div className="flex gap-6 w-full flex-1 pb-8 px-2 items-start overflow-x-auto custom-scrollbar">
                {COLUMNS.map(col => {
                    const colOpps = filteredOpportunities.filter(o => o.status === col);
                    return (
                        <div
                            key={col}
                            className="flex-1 min-w-0 flex flex-col bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col)}
                        >
                            <div className="p-5 border-b border-slate-200/50 bg-white/40 flex justify-between items-center backdrop-blur-md">
                                <h3 className="font-bold text-slate-800 tracking-tight">{col}</h3>
                                <span className="bg-white/80 text-slate-600 shadow-sm border border-slate-200/60 text-xs font-bold px-3 py-1 rounded-full">{colOpps.length}</span>
                            </div>
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[250px] custom-scrollbar">
                                {colOpps.length === 0 && (
                                    <div className="flex items-center justify-center text-center text-slate-400 text-sm py-16 border-2 border-dashed border-slate-200/60 rounded-2xl pointer-events-none opacity-60">
                                        Sürükleyip Bırakın
                                    </div>
                                )}
                                {colOpps.map(opp => {
                                    const lastUpdated = opp.lastUpdatedAt ? new Date(opp.lastUpdatedAt).getTime() : new Date(opp.createdAt).getTime();
                                    const isStale = col !== 'Bitti' && (now - lastUpdated) > (5 * 24 * 60 * 60 * 1000); // 5 days

                                    return (
                                        <div
                                            key={opp.id}
                                            draggable={col !== 'Bitti'}
                                            onDragStart={(e) => handleDragStart(e, opp.id)}
                                            onClick={() => setViewingOpp(opp)}
                                            className={`relative bg-white/90 backdrop-blur-sm p-5 rounded-[20px] shadow-[0_4px_12px_rgb(0,0,0,0.03)] border transition-all ${col !== 'Bitti' ? 'cursor-grab active:cursor-grabbing hover:-translate-y-1' : 'opacity-90'} ${isStale ? 'border-rose-300 shadow-[0_4px_12px_rgb(225,29,72,0.1)]' : 'border-white/60 hover:shadow-[0_8px_24px_rgb(0,0,0,0.08)]'}`}
                                        >
                                            {isStale && (
                                                <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-md animate-pulse" title="5 Günden uzun süredir işlem yapılmadı">
                                                    <AlertCircle size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                            <div className="mb-3">
                                                <h4 className="font-bold text-slate-800 text-[17px] leading-tight mb-1.5 pr-2">{opp.name}</h4>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                    <span className={`w-2 h-2 rounded-full ${isStale ? 'bg-rose-400' : 'bg-slate-300'}`}></span>
                                                    {opp.customerName}
                                                </div>
                                            </div>

                                            <div className={`flex justify-between items-center text-sm font-semibold ${col !== 'Bitti' && 'border-b border-slate-100/80 pb-3.5 mb-3.5'}`}>
                                                <span className={`px-3 py-1 rounded-lg border shadow-sm ${isStale ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-primary-700 bg-primary-50 border-primary-100'}`}>
                                                    {opp.totalAmount.toLocaleString('tr-TR')} ₺
                                                </span>
                                            </div>

                                            {col === 'Bitti' ? (
                                                <div className="space-y-2.5 mt-4">
                                                    {opp.trainings.map(t => (
                                                        <div key={t.id} className={`text-xs px-3 py-2 rounded-xl flex justify-between items-center shadow-sm ${t.status === 'won' ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border border-emerald-200' : 'bg-gradient-to-r from-rose-50 to-rose-100/50 text-rose-700 border border-rose-200'}`}>
                                                            <span className="truncate max-w-[140px] font-medium" title={t.topic}>{t.topic}</span>
                                                            <span className="font-bold tracking-wider whitespace-nowrap ml-2 text-[10px]">{t.status === 'won' ? 'KAZANILDI' : 'KAYBEDİLDİ'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-xs font-medium text-slate-500 w-full flex justify-between items-center">
                                                    <span className="bg-slate-100/80 px-2.5 py-1 rounded-md">{opp.trainings.length} Eğitim</span>
                                                    <span className={`${isStale ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>{new Date(opp.lastUpdatedAt || opp.createdAt).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {closingOpp && (
                    <CloseOpportunityModal
                        opportunity={closingOpp}
                        onClose={() => setClosingOpp(null)}
                    />
                )}

                {viewingOpp && (
                    <OpportunityDetailModal
                        opportunity={viewingOpp}
                        onClose={() => setViewingOpp(null)}
                    />
                )}
            </div>
        </div>
    );
};
