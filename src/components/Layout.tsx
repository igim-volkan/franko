import { useState } from 'react';
import type { ReactNode } from 'react';
import { LayoutDashboard, Users, Plus, Settings, UserCircle, LogOut, Moon } from 'lucide-react';
import { useOpportunities } from '../store/OpportunityContext';

interface LayoutProps {
    children: ReactNode;
    onNewOpportunity: () => void;
}

export const Layout = ({ children, onNewOpportunity }: LayoutProps) => {
    const { opportunities } = useOpportunities();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const stats = opportunities
        .filter(opp => opp.status === 'Bitti')
        .reduce(
            (acc, opp) => {
                opp.trainings.forEach(training => {
                    if (training.status === 'won') {
                        acc.totalWon += training.amount;
                    } else if (training.status === 'lost') {
                        acc.totalLost += training.amount;
                    }
                });
                return acc;
            },
            { totalWon: 0, totalLost: 0 }
        );

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
            {/* Background ambient light */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Sidebar */}
            <aside className="w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl text-slate-300 flex flex-col pt-8 pb-6 relative z-10 transition-all">
                <div className="flex items-center gap-3 mb-10 px-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/30">F</div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide leading-none">Franko</h1>
                        <p className="text-xs text-slate-400 mt-1 font-medium">CRM Portal</p>
                    </div>
                </div>

                <nav className="flex-1 w-full px-4 space-y-1.5">
                    <button className="flex items-center gap-3 w-full px-4 py-3 bg-white/10 text-white rounded-xl font-medium transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] cursor-pointer">
                        <LayoutDashboard size={20} className="text-primary-400" />
                        Satış Panosu
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl font-medium transition-all group cursor-pointer">
                        <Users size={20} className="group-hover:text-primary-400 transition-colors" />
                        Müşteriler
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl font-medium transition-all group cursor-pointer">
                        <Settings size={20} className="group-hover:text-primary-400 transition-colors" />
                        Ayarlar
                    </button>
                </nav>

                <div className="px-4 w-full mt-auto">
                    <button
                        onClick={onNewOpportunity}
                        className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgb(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                        <Plus size={20} />
                        Yeni Fırsat Ekle
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <header className="h-[88px] bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center px-8 justify-between shrink-0 sticky top-0 z-20">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Fırsat Yönetimi</h2>
                        <p className="text-sm text-slate-500 font-medium">Satış performansınızı ve hedeflerinizi takip edin</p>
                    </div>

                    {/* Advanced Dashboard Stats */}
                    <div className="flex items-center gap-6">

                        {/* Monthly Goal Progress */}
                        <div className="hidden lg:flex flex-col gap-1.5 min-w-[160px]">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500">Aylık Hedef</span>
                                <span className="text-primary-600">%{(Math.min((stats.totalWon / 500000) * 100, 100)).toFixed(0)}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((stats.totalWon / 500000) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium text-right">Hedef: 500.000 ₺</div>
                        </div>

                        {/* Conversion Rate */}
                        <div className="hidden xl:flex items-center gap-3 bg-white/80 px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm">
                            <div className="w-10 h-10 rounded-full border-[3px] border-slate-100 flex items-center justify-center relative overlow-hidden">
                                {/* Fake svg circle ring for conversion */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="17" cy="17" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100" />
                                    <circle cx="17" cy="17" r="15" fill="none" stroke="currentColor" strokeWidth="3"
                                        strokeDasharray="94.2"
                                        strokeDashoffset={94.2 - (94.2 * (stats.totalWon / (stats.totalWon + stats.totalLost || 1)))}
                                        className="text-primary-500 transition-all duration-1000" />
                                </svg>
                                <span className="text-[10px] font-bold text-slate-700">
                                    {((stats.totalWon / (stats.totalWon + stats.totalLost || 1)) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kapanış Oranı</span>
                                <span className="text-sm font-bold text-slate-700 leading-tight">Başarı</span>
                            </div>
                        </div>

                        {/* Existing Won/Lost Stats */}
                        <div className="flex items-center gap-3 bg-white/80 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                            <div className="flex flex-col items-end px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100/50">
                                <span className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider">Kazanılan</span>
                                <span className="text-emerald-700 font-bold leading-tight">{stats.totalWon.toLocaleString('tr-TR')} ₺</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200/60"></div>
                            <div className="flex flex-col items-start px-3 py-1 bg-rose-50 rounded-lg border border-rose-100/50">
                                <span className="text-[10px] uppercase font-bold text-rose-600/70 tracking-wider">Kaybedilen</span>
                                <span className="text-rose-700 font-bold leading-tight">{stats.totalLost.toLocaleString('tr-TR')} ₺</span>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-md ring-2 ring-slate-100 focus:outline-none hover:ring-primary-400 focus:ring-primary-400 transition-all shrink-0"
                            >
                                US
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-slate-100/80 mb-1">
                                            <p className="text-sm font-bold text-slate-800">Uğur Şahin</p>
                                            <p className="text-xs font-medium text-slate-500">ugur@franko.com</p>
                                        </div>
                                        <div className="px-2 space-y-1">
                                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                                                <UserCircle size={16} className="text-slate-400" />
                                                Profilim
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                                                <Settings size={16} className="text-slate-400" />
                                                Ayarlar
                                            </button>
                                            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Moon size={16} className="text-slate-400" />
                                                    Koyu Tema
                                                </div>
                                                <div className="w-7 h-4 bg-slate-200 rounded-full relative">
                                                    <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                                                </div>
                                            </button>
                                        </div>
                                        <div className="mt-1 px-2 pt-1 border-t border-slate-100/80">
                                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                                                <LogOut size={16} />
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-x-auto overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};
