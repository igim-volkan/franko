import type { ReactNode } from 'react';
import { LayoutDashboard, Users, Plus, Settings } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
    onNewOpportunity: () => void;
}

export const Layout = ({ children, onNewOpportunity }: LayoutProps) => {
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
                        <p className="text-sm text-slate-500 font-medium">Tüm satış fırsatlarınızı buradan takip edin</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-md ring-2 ring-slate-100 cursor-pointer hover:ring-primary-400 transition-all">US</div>
                    </div>
                </header>
                <div className="flex-1 overflow-x-auto overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};
