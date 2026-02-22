import React, { useState } from 'react';
import type { Opportunity, OpportunityStatus } from '../types';
import { useOpportunities } from '../store/OpportunityContext';
import { CloseOpportunityModal } from './CloseOpportunityModal';

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

    return (
        <div className="flex gap-6 w-full h-full pb-8 px-2 items-start">
            {COLUMNS.map(col => {
                const colOpps = opportunities.filter(o => o.status === col);
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
                            {colOpps.map(opp => (
                                <div
                                    key={opp.id}
                                    draggable={col !== 'Bitti'}
                                    onDragStart={(e) => handleDragStart(e, opp.id)}
                                    className={`bg-white/90 backdrop-blur-sm p-5 rounded-[20px] shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-white/60 hover:shadow-[0_8px_24px_rgb(0,0,0,0.08)] transition-all ${col !== 'Bitti' ? 'cursor-grab active:cursor-grabbing hover:-translate-y-1' : 'opacity-90'}`}
                                >
                                    <div className="mb-3">
                                        <h4 className="font-bold text-slate-800 text-[17px] leading-tight mb-1.5">{opp.name}</h4>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                            {opp.customerName}
                                        </div>
                                    </div>

                                    <div className={`flex justify-between items-center text-sm font-semibold ${col !== 'Bitti' && 'border-b border-slate-100/80 pb-3.5 mb-3.5'}`}>
                                        <span className="text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100 shadow-sm">
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
                                            <span className="text-slate-400">{new Date(opp.createdAt).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
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
        </div>
    );
};
