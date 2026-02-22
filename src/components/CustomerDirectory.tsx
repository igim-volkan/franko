import { useMemo } from 'react';
import { useOpportunities } from '../store/OpportunityContext';
import { Building, Phone, Mail, Trophy, AlertCircle, Clock } from 'lucide-react';

export const CustomerDirectory = () => {
    const { opportunities } = useOpportunities();

    const customers = useMemo(() => {
        const map = new Map();

        opportunities.forEach(opp => {
            if (!map.has(opp.customerName)) {
                map.set(opp.customerName, {
                    name: opp.customerName,
                    contact: opp.contact,
                    totalWon: 0,
                    totalLost: 0,
                    totalOngoing: 0,
                    opportunityCount: 0,
                    lastInteraction: opp.lastUpdatedAt || opp.createdAt
                });
            }

            const customer = map.get(opp.customerName);
            customer.opportunityCount += 1;

            // Update most recent interaction date
            const oppDate = new Date(opp.lastUpdatedAt || opp.createdAt).getTime();
            const lastDate = new Date(customer.lastInteraction).getTime();
            if (oppDate > lastDate) {
                customer.lastInteraction = opp.lastUpdatedAt || opp.createdAt;
                // Update contact if this is a newer opportunity
                customer.contact = opp.contact;
            }

            // Calculate amounts
            if (opp.status === 'Bitti') {
                opp.trainings.forEach(t => {
                    if (t.status === 'won') customer.totalWon += t.amount;
                    if (t.status === 'lost') customer.totalLost += t.amount;
                });
            } else {
                customer.totalOngoing += opp.totalAmount;
            }
        });

        return Array.from(map.values()).sort((a, b) => b.totalWon - a.totalWon);
    }, [opportunities]);

    if (customers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Building size={48} className="mb-4 text-slate-300" />
                <p className="text-lg font-medium">Henüz kayıtlı müşteri bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300 pb-12">
            {customers.map(customer => (
                <div key={customer.name} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 flex items-center justify-center text-indigo-500 border border-indigo-200 shrink-0">
                                <Building size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 leading-tight">{customer.name}</h3>
                                <div className="text-sm font-medium text-slate-500 mt-0.5">{customer.opportunityCount} Fırsat</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-6 flex justify-center"><Phone size={14} className="text-slate-400" /></div>
                            <span className="font-medium">{customer.contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-6 flex justify-center"><Mail size={14} className="text-slate-400" /></div>
                            <span className="font-medium truncate" title={customer.contact.email}>{customer.contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-50">
                            <Clock size={12} />
                            Son Etkileşim: {new Date(customer.lastInteraction).toLocaleDateString('tr-TR')}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center text-center">
                            <Trophy size={16} className="text-emerald-500 mb-1" />
                            <span className="text-[10px] font-bold text-emerald-600/70 uppercase">Kazanılan</span>
                            <span className="text-sm font-bold text-emerald-700">{customer.totalWon.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex flex-col items-center text-center">
                            <AlertCircle size={16} className="text-amber-500 mb-1" />
                            <span className="text-[10px] font-bold text-amber-600/70 uppercase">Devam Eden</span>
                            <span className="text-sm font-bold text-amber-700">{customer.totalOngoing.toLocaleString('tr-TR')} ₺</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
