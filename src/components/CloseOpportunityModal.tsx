import React, { useState } from 'react';
import type { Opportunity } from '../types';
import { useOpportunities } from '../store/OpportunityContext';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

interface CloseOpportunityModalProps {
    opportunity: Opportunity;
    onClose: () => void;
}

export const CloseOpportunityModal = ({ opportunity, onClose }: CloseOpportunityModalProps) => {
    const { updateOpportunity, updateOpportunityStatus } = useOpportunities();

    const [trainings, setTrainings] = useState(opportunity.trainings.map(t => ({ ...t, status: t.status === 'pending' ? 'won' : t.status })));

    const handleStatusChange = (id: string, status: 'won' | 'lost') => {
        setTrainings(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateOpportunity(opportunity.id, { trainings: trainings as any });
        updateOpportunityStatus(opportunity.id, 'Bitti');
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white text-center">
                    <Trophy className="mx-auto mb-3" size={40} />
                    <h2 className="text-3xl font-bold">Fırsatı Sonlandır: {opportunity.name}</h2>
                    <p className="opacity-90 mt-2 text-lg">Lütfen eğitimlerin sonuçlarını belirleyin.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-6 pr-2">
                        {trainings.map(training => (
                            <div key={training.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-lg">{training.topic} - {training.type}</h4>
                                    <p className="text-sm text-slate-500 mt-1">{training.amount.toLocaleString('tr-TR')} ₺ | {training.duration}</p>
                                </div>

                                <div className="flex bg-white rounded-lg p-1.5 border border-slate-200 shadow-sm shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChange(training.id, 'won')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer ${training.status === 'won' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <CheckCircle size={20} /> Kazanıldı
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChange(training.id, 'lost')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer ${training.status === 'lost' ? 'bg-red-100 text-red-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <XCircle size={20} /> Kaybedildi
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button type="button" onClick={handleCancel} className="px-6 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">İptal</button>
                        <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/30 transition-all text-lg cursor-pointer">Kaydet ve Bitir</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
