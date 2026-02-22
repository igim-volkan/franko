import { useMemo, useState } from 'react';
import { useOpportunities } from '../store/OpportunityContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import type { Opportunity } from '../types';

export const CalendarView = () => {
    const { opportunities } = useOpportunities();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Align to Monday Start

    const calendarCells = useMemo(() => {
        const cells = [];

        // Previous month padding
        for (let i = 0; i < startOffset; i++) {
            cells.push({ day: null, date: null, opps: [] });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const currentCellDate = new Date(year, month, i);
            // Fix timezone discrepancy by formatting manually
            const dateStr = `${currentCellDate.getFullYear()}-${String(currentCellDate.getMonth() + 1).padStart(2, '0')}-${String(currentCellDate.getDate()).padStart(2, '0')}`;

            // Allow any opps with target close date mapping exactly to this day dateStr
            const cellOpps = opportunities.filter(opp => opp.targetCloseDate === dateStr && opp.status !== 'Bitti');

            cells.push({
                day: i,
                date: dateStr,
                opps: cellOpps
            });
        }

        return cells;
    }, [year, month, daysInMonth, startOffset, opportunities]);

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300 pb-12">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
                        <p className="text-sm text-slate-500 font-medium">Hedef Kapanış Takvimi</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleToday} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary-600 bg-slate-100/50 hover:bg-primary-50 rounded-xl transition-colors">Bugün</button>
                    <div className="flex items-center bg-slate-100/50 rounded-xl p-1 border border-slate-200/50">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition-colors"><ChevronLeft size={20} /></button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[24px] shadow-sm flex flex-col overflow-hidden min-h-[600px]">
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    {weekDays.map(day => (
                        <div key={day} className="py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
                    ))}
                </div>

                <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(100px,1fr)] bg-slate-100/50 gap-[1px]">
                    {calendarCells.map((cell, idx) => {
                        const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
                        const isToday = cell.date === todayStr;

                        return (
                            <div key={idx} className={`bg-white p-2 flex flex-col transition-colors ${cell.day ? 'hover:bg-slate-50/80 cursor-default' : ''}`}>
                                {cell.day && (
                                    <>
                                        <div className="flex justify-between items-center mb-2 px-1">
                                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-slate-600'}`}>
                                                {cell.day}
                                            </span>
                                            {cell.opps.length > 0 && (
                                                <span className="text-[10px] font-bold text-slate-400">{cell.opps.length} Fırsat</span>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-1.5 px-1 pb-1 pt-1 custom-scrollbar">
                                            {cell.opps.map(opp => (
                                                <div
                                                    key={opp.id}
                                                    onClick={() => setSelectedOpp(opp)}
                                                    className="p-2 rounded-lg bg-indigo-50 border border-indigo-100/50 cursor-pointer hover:shadow-sm hover:border-indigo-300 transition-all flex flex-col gap-1 group"
                                                >
                                                    <span className="text-[11px] font-bold text-slate-700 truncate group-hover:text-indigo-700">{opp.name}</span>
                                                    <span className="text-[10px] text-slate-500 truncate">{opp.customerName}</span>
                                                    {opp.assignee && <span className="text-[9px] font-semibold text-indigo-500 bg-indigo-100/50 rounded px-1.5 py-0.5 w-fit mt-0.5">{opp.assignee}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {selectedOpp && (
                <OpportunityDetailModal opportunity={selectedOpp} onClose={() => setSelectedOpp(null)} />
            )}
        </div>
    );
};
