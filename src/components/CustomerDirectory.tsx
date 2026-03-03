import { useMemo, useState } from 'react';
import { useOpportunities } from '../store/OpportunityContext';
import { useCustomers } from '../store/CustomerContext';
import { AddCustomerModal } from './AddCustomerModal';
import { Building, Phone, Mail, Trophy, AlertCircle, Clock, Users, UserCheck, UserPlus, Filter, PieChart, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isThisMonth, parseISO } from 'date-fns';

export const CustomerDirectory = () => {
    const { opportunities } = useOpportunities();
    const { customers: dbCustomers } = useCustomers();
    const [activeTab, setActiveTab] = useState<'all' | 'existing' | 'potential'>('all');
    const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const customers = useMemo(() => {
        const map = new Map();

        // First, populate standalone customers from DB
        dbCustomers.forEach(dbC => {
            map.set(dbC.companyName, {
                name: dbC.companyName,
                contact: {
                    firstName: dbC.contactName?.split(' ')[0] || '',
                    lastName: dbC.contactName?.split(' ').slice(1).join(' ') || '',
                    email: dbC.email || '',
                    phone: dbC.phone || '',
                    industry: dbC.industry || 'Diğer'
                },
                industry: dbC.industry || 'Diğer',
                totalWon: 0,
                totalLost: 0,
                totalOngoing: 0,
                opportunityCount: 0,
                firstInteraction: dbC.createdAt,
                lastInteraction: dbC.createdAt,
                dbType: dbC.type // "potential" or "existing"
            });
        });

        // Then, process opportunities to merge or create derived customers
        opportunities.forEach(opp => {
            if (!map.has(opp.customerName)) {
                map.set(opp.customerName, {
                    name: opp.customerName,
                    contact: opp.contact,
                    industry: opp.contact?.industry || 'Diğer',
                    totalWon: 0,
                    totalLost: 0,
                    totalOngoing: 0,
                    opportunityCount: 0,
                    firstInteraction: opp.createdAt,
                    lastInteraction: opp.lastUpdatedAt || opp.createdAt,
                    dbType: 'potential' // default until won
                });
            }

            const customer = map.get(opp.customerName);
            customer.opportunityCount += 1;

            // Update first interaction date (for "Added this month" stat)
            const createdDate = new Date(opp.createdAt).getTime();
            const firstDate = new Date(customer.firstInteraction).getTime();
            if (createdDate < firstDate) {
                customer.firstInteraction = opp.createdAt;
            }

            // Update most recent interaction date
            const oppDate = new Date(opp.lastUpdatedAt || opp.createdAt).getTime();
            const lastDate = new Date(customer.lastInteraction).getTime();
            if (oppDate > lastDate) {
                customer.lastInteraction = opp.lastUpdatedAt || opp.createdAt;
                // Update contact if this is a newer opportunity
                customer.contact = opp.contact;
                if (opp.contact?.industry) {
                    customer.industry = opp.contact.industry;
                }
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
    }, [opportunities, dbCustomers]);

    const stats = useMemo(() => {
        let totalPortfolio = 0;
        let addedThisMonth = 0;

        customers.forEach(c => {
            totalPortfolio += c.totalWon + c.totalOngoing;

            try {
                if (isThisMonth(parseISO(c.firstInteraction))) {
                    addedThisMonth++;
                }
            } catch (e) {
                // Ignore parse errors for malformed dates
            }
        });

        return {
            totalPortfolio,
            addedThisMonth,
            totalCustomers: customers.length
        };
    }, [customers]);

    const industries = useMemo(() => {
        const inds = new Set<string>();
        customers.forEach(c => {
            if (c.industry) inds.add(c.industry);
        });
        return Array.from(inds).sort();
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        let result = customers;

        if (activeTab === 'existing') {
            result = result.filter(c => c.totalWon > 0 || c.dbType === 'existing');
        } else if (activeTab === 'potential') {
            result = result.filter(c => c.totalWon === 0 && c.dbType !== 'existing');
        }

        if (selectedIndustry !== 'all') {
            result = result.filter(c => c.industry === selectedIndustry);
        }

        return result;
    }, [customers, activeTab, selectedIndustry]);

    if (customers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Building size={48} className="mb-4 text-slate-300" />
                <p className="text-lg font-medium">Henüz kayıtlı müşteri bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300 pb-12">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <PieChart size={24} className="text-indigo-50" />
                        </div>
                        <div>
                            <div className="text-indigo-100 font-medium text-sm">Toplam Portföy</div>
                            <div className="text-2xl font-bold">{stats.totalPortfolio.toLocaleString('tr-TR')} ₺</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Users size={24} className="text-emerald-50" />
                        </div>
                        <div>
                            <div className="text-emerald-100 font-medium text-sm">Toplam Müşteri</div>
                            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-6 text-white shadow-lg shadow-sky-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <TrendingUp size={24} className="text-sky-50" />
                        </div>
                        <div>
                            <div className="text-sky-100 font-medium text-sm">Bu Ay Eklenen</div>
                            <div className="text-2xl font-bold">{stats.addedThisMonth} <span className="text-sm font-normal text-sky-100">yeni kayıt</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex bg-slate-100/80 p-1.5 rounded-xl gap-1 w-full md:w-auto overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={twMerge(
                            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                            activeTab === 'all'
                                ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        <Users size={16} />
                        Tümü
                        <span className={clsx("ml-1.5 px-2 py-0.5 rounded-md text-[11px]", activeTab === 'all' ? "bg-slate-100 text-slate-600" : "bg-slate-200/50 text-slate-400")}>{selectedIndustry === 'all' ? customers.length : filteredCustomers.length + (activeTab !== 'all' ? 0 : 0) /* Just roughly showing count in tab if we wanted to calculate per-tab counts, for simplicity show base lengths */}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('existing')}
                        className={twMerge(
                            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                            activeTab === 'existing'
                                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-200/50"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                    >
                        <UserCheck size={16} />
                        Mevcut
                    </button>
                    <button
                        onClick={() => setActiveTab('potential')}
                        className={twMerge(
                            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                            activeTab === 'potential'
                                ? "bg-white text-primary-600 shadow-sm ring-1 ring-primary-200/50"
                                : "text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                        )}
                    >
                        <UserPlus size={16} />
                        Potansiyel
                    </button>
                </div>

                <div className="flex items-center gap-3 px-3 w-full md:w-auto">
                    <Filter size={18} className="text-slate-400 shrink-0" />
                    <select
                        value={selectedIndustry}
                        onChange={e => setSelectedIndustry(e.target.value)}
                        className="w-full md:w-36 bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer appearance-none py-2"
                    >
                        <option value="all">Sektör (Tümü)</option>
                        {industries.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>

                    <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm ml-auto md:ml-0"
                    >
                        <UserPlus size={16} /> Müşteri Ekle
                    </button>
                </div>
            </div>

            {filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-[32px] border-dashed shadow-sm">
                    {activeTab === 'existing' ? <UserCheck size={48} className="mb-4 text-emerald-300/50" /> : <UserPlus size={48} className="mb-4 text-primary-300/50" />}
                    <p className="text-lg font-medium text-slate-500">Bu kategoride müşteri bulunmuyor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCustomers.map(customer => (
                        <div key={customer.name} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col group">
                            <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 flex items-center justify-center text-indigo-500 border border-indigo-200 shrink-0">
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight flex items-center gap-2">
                                            {customer.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-sm font-medium text-slate-500">{customer.opportunityCount} Fırsat</div>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{customer.industry}</span>
                                        </div>
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
            )}

            {isAddModalOpen && (
                <AddCustomerModal onClose={() => setIsAddModalOpen(false)} />
            )}
        </div>
    );
};
