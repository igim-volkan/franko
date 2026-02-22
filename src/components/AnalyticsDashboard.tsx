import { useMemo } from 'react';
import { useOpportunities } from '../store/OpportunityContext';
import { Trophy, Target, Users, TrendingUp } from 'lucide-react';

export const AnalyticsDashboard = () => {
    const { opportunities } = useOpportunities();

    const stats = useMemo(() => {
        let totalWon = 0;
        let totalLost = 0;
        let totalOngoing = 0;
        let wonCount = 0;
        let lostCount = 0;

        const monthlyStats = new Array(12).fill(0).map(() => ({ won: 0, lost: 0 }));
        const customerMap = new Map();

        opportunities.forEach(opp => {
            if (opp.status === 'Bitti') {
                opp.trainings.forEach(t => {
                    const month = new Date(opp.createdAt).getMonth();
                    if (t.status === 'won') {
                        totalWon += t.amount;
                        wonCount++;
                        monthlyStats[month].won += t.amount;

                        customerMap.set(opp.customerName, (customerMap.get(opp.customerName) || 0) + t.amount);
                    } else if (t.status === 'lost') {
                        totalLost += t.amount;
                        lostCount++;
                        monthlyStats[month].lost += t.amount;
                    }
                });
            } else {
                totalOngoing += opp.totalAmount;
            }
        });

        const topCustomers = Array.from(customerMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, amount]) => ({ name, amount }));

        return { totalWon, totalLost, totalOngoing, wonCount, lostCount, monthlyStats, topCustomers };
    }, [opportunities]);

    const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const maxMonthlyAmount = Math.max(...stats.monthlyStats.map(m => m.won + m.lost), 100000); // minimum scale

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-12 overflow-x-hidden">

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[24px] p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Toplam Kazanılan Gelir</p>
                        <h3 className="text-2xl font-black text-emerald-600">{stats.totalWon.toLocaleString('tr-TR')} ₺</h3>
                        <p className="text-xs text-slate-400 mt-2">{stats.wonCount} Başarılı Eğitim</p>
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex justify-center items-center text-emerald-500">
                        <Trophy size={28} />
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[24px] p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Boru Hattı (Devam Eden)</p>
                        <h3 className="text-2xl font-black text-primary-600">{stats.totalOngoing.toLocaleString('tr-TR')} ₺</h3>
                        <p className="text-xs text-slate-400 mt-2">Görüşmesi Süren Fırsatlar</p>
                    </div>
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex justify-center items-center text-primary-500">
                        <Target size={28} />
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[24px] p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Kapanış Oranı</p>
                        <h3 className="text-2xl font-black text-slate-800">
                            {((stats.totalWon / (stats.totalWon + stats.totalLost || 1)) * 100).toFixed(1)}%
                        </h3>
                        <p className="text-xs text-slate-400 mt-2">{stats.lostCount} Kaybedilen Eğitim</p>
                    </div>
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex justify-center items-center text-slate-500">
                        <TrendingUp size={28} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Chart */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[24px] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        Aylık Gelir Dağılımı <span className="text-xs font-normal text-slate-400">(Kazanılan ve Kaybedilen)</span>
                    </h3>

                    <div className="h-64 flex items-end gap-2 sm:gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {stats.monthlyStats.map((data, idx) => (
                            <div key={MONTHS[idx]} className="flex-1 flex flex-col justify-end items-center gap-2 min-w-[30px]">
                                <div className="w-full flex flex-col justify-end gap-1 h-full relative group">
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 hidden sm:block">
                                        Kazanılan: {data.won.toLocaleString('tr-TR')} ₺<br />
                                        Kaybedilen: {data.lost.toLocaleString('tr-TR')} ₺
                                    </div>

                                    {/* Won Bar */}
                                    <div
                                        className="w-full bg-emerald-400 rounded-t-sm transition-all duration-500 hover:bg-emerald-500"
                                        style={{ height: `${(data.won / maxMonthlyAmount) * 100}%`, minHeight: data.won > 0 ? '4px' : '0' }}
                                    ></div>
                                    {/* Lost Bar */}
                                    <div
                                        className="w-full bg-rose-300 rounded-t-sm transition-all duration-500 hover:bg-rose-400"
                                        style={{ height: `${(data.lost / maxMonthlyAmount) * 100}%`, minHeight: data.lost > 0 ? '4px' : '0' }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{MONTHS[idx]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[24px] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Users className="text-primary-500" size={20} /> En İyi 5 Müşteri
                    </h3>
                    <div className="space-y-4">
                        {stats.topCustomers.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">Henüz yeterli veri yok.</p>
                        ) : (
                            stats.topCustomers.map((customer, index) => (
                                <div key={customer.name} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-amber-50 text-amber-800/60' : 'bg-slate-50 text-slate-400'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-700 truncate text-sm" title={customer.name}>{customer.name}</p>
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                                        {customer.amount.toLocaleString('tr-TR')} ₺
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
