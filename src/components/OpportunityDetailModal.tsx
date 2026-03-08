import { useState, useEffect, useMemo } from 'react';
import type { Opportunity, TrainingItem } from '../types';
import { useOpportunities } from '../store/OpportunityContext';
import { X, User, Phone, Mail, FileText, Calendar, Building, DollarSign, Printer, Plus, MessageSquare, CheckSquare, Square, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface OpportunityDetailModalProps {
    opportunity: Opportunity;
    onClose: () => void;
}

export const OpportunityDetailModal = ({ opportunity, onClose }: OpportunityDetailModalProps) => {
    const { updateOpportunity } = useOpportunities();
    const [isEditing, setIsEditing] = useState(false);

    // Editable state
    const [notes, setNotes] = useState(opportunity.notes || '');
    const [contact, setContact] = useState(opportunity.contact);
    const [targetCloseDate, setTargetCloseDate] = useState(opportunity.targetCloseDate || '');
    const [assignee, setAssignee] = useState(opportunity.assignee || '');
    const [activities, setActivities] = useState(opportunity.activities || []);
    const [tasks, setTasks] = useState(opportunity.tasks || []);
    const [trainings, setTrainings] = useState<TrainingItem[]>(opportunity.trainings || []);

    const totalAmount = useMemo(() => {
        return trainings.reduce((sum, t) => {
            let tSum = Number(t.amount) || 0;
            if (t.hasAssessment) {
                tSum += (Number(t.participantCount) || 0) * (Number(t.assessmentPrice) || 0);
            }
            if (t.hasKit) {
                tSum += (Number(t.kitCount) || 0) * (Number(t.kitPrice) || 0);
            }
            return sum + tSum;
        }, 0);
    }, [trainings]);

    const handleAddTraining = () => {
        setTrainings(prev => [...prev, {
            id: uuidv4(),
            topic: '',
            type: '',
            amount: 0,
            duration: '',
            hasAssessment: false,
            hasKit: false,
            status: 'pending' as const
        }]);
    };

    const updateTraining = (id: string, field: keyof TrainingItem, value: any) => {
        setTrainings(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const removeTraining = (id: string) => {
        setTrainings(prev => prev.filter(t => t.id !== id));
    };

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // New Activity State
    const [newActivityContent, setNewActivityContent] = useState('');
    const [newActivityType, setNewActivityType] = useState<'note' | 'email' | 'call' | 'meeting'>('note');

    // New Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleSave = () => {
        updateOpportunity(opportunity.id, {
            notes,
            contact,
            targetCloseDate,
            assignee,
            activities,
            tasks,
            trainings,
            totalAmount
        });
        setIsEditing(false);
    };

    const handleAddActivity = () => {
        if (!newActivityContent.trim()) return;

        const newAct = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: newActivityContent,
            type: newActivityType
        };

        const updatedActivities = [newAct, ...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivities(updatedActivities);
        setNewActivityContent('');

        // Auto-save just activities
        updateOpportunity(opportunity.id, {
            activities: updatedActivities
        });
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask = { id: uuidv4(), title: newTaskTitle, isCompleted: false };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        setNewTaskTitle('');
        updateOpportunity(opportunity.id, { tasks: updatedTasks });
    };

    const toggleTask = (taskId: string) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
        setTasks(updatedTasks);
        updateOpportunity(opportunity.id, { tasks: updatedTasks });
    };

    const deleteTask = (taskId: string) => {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        updateOpportunity(opportunity.id, { tasks: updatedTasks });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 sm:p-8 text-white relative shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-red-500 hover:bg-red-600 text-white shadow-md rounded-full transition-colors z-10 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2 opacity-90 text-sm font-medium">
                        <Building size={16} />
                        {opportunity.customerName}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 pr-12">{opportunity.name}</h2>

                    <div className="flex flex-wrap gap-4 text-sm mt-4">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                            <Calendar size={16} />
                            Oluşturulma: {new Date(opportunity.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 font-bold">
                            <DollarSign size={16} />
                            {opportunity.totalAmount.toLocaleString('tr-TR')} ₺
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                            Durum: <span className="font-bold">{opportunity.status}</span>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="print:hidden ml-auto flex items-center gap-2 bg-white text-primary-700 hover:bg-slate-100 px-4 py-1.5 rounded-lg font-bold transition-colors shadow-sm"
                        >
                            <Printer size={16} />
                            Teklif Oluştur (PDF)
                        </button>
                    </div>
                </div>

                {/* Print Header (Only visible when printing) */}
                <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Eğitim Teklifi</h1>
                    <p className="text-lg text-slate-500 mt-2">{opportunity.customerName}</p>
                    <p className="text-slate-400 text-sm mt-1">Tarih: {new Date().toLocaleDateString('tr-TR')} | Referans: {opportunity.id.slice(0, 8).toUpperCase()}</p>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50 print:bg-white space-y-8 custom-scrollbar">

                    {/* General Details */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Building className="text-primary-500" size={20} /> Fırsat Detayları
                            </h3>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-primary-600 hover:text-primary-700">Düzenle</button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kapanış Hedefi</label>
                                    <input type="date" value={targetCloseDate} onChange={e => setTargetCloseDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Sorumlu Kişi</label>
                                    <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                                        <option value="">Seçiniz...</option>
                                        <option value="Uğur Şahin">Uğur Şahin</option>
                                        <option value="Volkan Ekşi">Volkan Ekşi</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-0.5">Kapanış Hedefi</p>
                                    <p className="font-medium text-slate-700">{opportunity.targetCloseDate ? new Date(opportunity.targetCloseDate).toLocaleDateString('tr-TR') : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-0.5">Sorumlu Kişi</p>
                                    <p className="font-medium text-slate-700">{opportunity.assignee || '-'}</p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Contact Info */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <User className="text-primary-500" size={20} /> İletişim Kişisi
                            </h3>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-primary-600 hover:text-primary-700">Düzenle</button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Ad</label>
                                    <input type="text" value={contact.firstName} onChange={e => setContact({ ...contact, firstName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Soyad</label>
                                    <input type="text" value={contact.lastName} onChange={e => setContact({ ...contact, lastName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">E-posta</label>
                                    <input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Telefon</label>
                                    <input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-0.5">İsim Soyisim</p>
                                    <p className="font-medium text-slate-700">{opportunity.contact.firstName} {opportunity.contact.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-0.5">Şirket</p>
                                    <p className="font-medium text-slate-700">{opportunity.customerName}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Mail size={16} className="text-slate-400" />
                                    <a href={`mailto:${opportunity.contact.email}`} className="font-medium text-primary-600 hover:underline">{opportunity.contact.email}</a>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Phone size={16} className="text-slate-400" />
                                    <a href={`tel:${opportunity.contact.phone}`} className="font-medium text-primary-600 hover:underline">{opportunity.contact.phone}</a>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Trainings */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                Eğitimler ({trainings.length})
                            </h3>
                            {isEditing && (
                                <button type="button" onClick={handleAddTraining} className="text-sm bg-primary-50 text-primary-700 font-bold px-4 py-2 rounded-xl border border-primary-200/50 hover:bg-primary-100 hover:shadow-sm flex items-center gap-1.5 transition-all cursor-pointer">
                                    <Plus size={18} /> Eğitim Ekle
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-6">
                                {trainings.map((training) => (
                                    <div key={training.id} className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-200/70 relative transition-all hover:shadow-md">
                                        <button type="button" onClick={() => removeTraining(training.id)} className="absolute top-5 right-5 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-full transition-colors cursor-pointer">
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-10">
                                            <div>
                                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Konu</label>
                                                <select required onInvalid={e => (e.target as HTMLSelectElement).setCustomValidity('Lütfen bir konu seçin.')} onInput={e => (e.target as HTMLSelectElement).setCustomValidity('')} value={training.topic} onChange={e => updateTraining(training.id, 'topic', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none cursor-pointer">
                                                    <option value="">Seçiniz...</option>
                                                    <option value="Liderlik">Liderlik</option>
                                                    <option value="Satış">Satış</option>
                                                    <option value="İletişim">İletişim</option>
                                                    <option value="Takım Çalışması">Takım Çalışması</option>
                                                    <option value="Diğer">Diğer</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Eğitim Türü</label>
                                                <select required onInvalid={e => (e.target as HTMLSelectElement).setCustomValidity('Lütfen eğitim türünü seçin.')} onInput={e => (e.target as HTMLSelectElement).setCustomValidity('')} value={training.type} onChange={e => updateTraining(training.id, 'type', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none cursor-pointer">
                                                    <option value="">Seçiniz...</option>
                                                    <option value="Sınıf İçi">Sınıf İçi</option>
                                                    <option value="Online">Online</option>
                                                    <option value="Karma">Karma (Hibrit)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tutar (₺)</label>
                                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen tutar girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="number" min="0" value={training.amount || ''} onChange={e => updateTraining(training.id, 'amount', Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Süre</label>
                                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen süreyi girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="text" value={training.duration} onChange={e => updateTraining(training.id, 'duration', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Örn: 2 Gün" />
                                            </div>

                                            <div className="md:col-span-2 mt-3 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Assessment */}
                                                <div>
                                                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer select-none">
                                                        <div className="relative flex items-center">
                                                            <input type="checkbox" checked={training.hasAssessment} onChange={e => updateTraining(training.id, 'hasAssessment', e.target.checked)} className="peer sr-only" />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                                        </div>
                                                        Assessment Seçeneği Ekle
                                                    </label>

                                                    {training.hasAssessment && (
                                                        <div className="grid grid-cols-2 gap-3 mt-4 bg-primary-50/50 p-4 rounded-xl border border-primary-100/50 animate-in slide-in-from-top-2 duration-200">
                                                            <div>
                                                                <label className="block text-xs font-bold text-primary-700/70 mb-1.5 uppercase tracking-wide">Kişi Sayısı</label>
                                                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen kişi sayısını girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="number" min="1" value={training.participantCount || ''} onChange={e => updateTraining(training.id, 'participantCount', Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white border border-primary-200/50 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Örn: 15" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-primary-700/70 mb-1.5 uppercase tracking-wide">Birim Fiyat (₺)</label>
                                                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen birim fiyatı girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="number" min="0" value={training.assessmentPrice || ''} onChange={e => updateTraining(training.id, 'assessmentPrice', Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white border border-primary-200/50 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Örn: 500" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Kit */}
                                                <div>
                                                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer select-none">
                                                        <div className="relative flex items-center">
                                                            <input type="checkbox" checked={training.hasKit || false} onChange={e => updateTraining(training.id, 'hasKit', e.target.checked)} className="peer sr-only" />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                                        </div>
                                                        Kit Seçeneği Ekle
                                                    </label>

                                                    {training.hasKit && (
                                                        <div className="grid grid-cols-2 gap-3 mt-4 bg-purple-50/50 p-4 rounded-xl border border-purple-100/50 animate-in slide-in-from-top-2 duration-200">
                                                            <div>
                                                                <label className="block text-xs font-bold text-purple-700/70 mb-1.5 uppercase tracking-wide">Kişi/Adet Sayısı</label>
                                                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen kişi/adet sayısını girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="number" min="1" value={training.kitCount || ''} onChange={e => updateTraining(training.id, 'kitCount', Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white border border-purple-200/50 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 outline-none" placeholder="Örn: 15" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-purple-700/70 mb-1.5 uppercase tracking-wide">Birim Fiyat (₺)</label>
                                                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen birim fiyatı girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="number" min="0" value={training.kitPrice || ''} onChange={e => updateTraining(training.id, 'kitPrice', Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white border border-purple-200/50 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 outline-none" placeholder="Örn: 800" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {trainings.map(t => (
                                    <div key={t.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50">
                                        <div>
                                            <p className="font-semibold text-slate-800">{t.topic}</p>
                                            <p className="text-xs text-slate-500">{t.type} • {t.duration} {t.participantCount ? `• ${t.participantCount} Kişi` : ''}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary-700">{t.amount.toLocaleString('tr-TR')} ₺</p>
                                            <div className="flex gap-1 justify-end mt-1">
                                                {t.hasAssessment && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md inline-block">Assessment Dahil</span>}
                                                {t.hasKit && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md inline-block">Kit Dahil</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Tasks (Yapılacaklar) */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <CheckSquare className="text-primary-500" size={20} /> Yapılacaklar
                        </h3>

                        <div className="space-y-2 mb-4">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleTask(task.id)}>
                                        <div className={`text-slate-400 group-hover:text-primary-500 transition-colors ${task.isCompleted ? 'text-primary-500' : ''}`}>
                                            {task.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </div>
                                        <span className={`text-sm font-medium ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                    <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <p className="text-sm text-slate-400 italic px-2">Henüz görev eklenmemiş.</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                placeholder="Yeni bir görev ekle..."
                                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                            <button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors">
                                <Plus size={18} />
                            </button>
                        </div>
                    </section>

                    {/* Timeline & Activities */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="text-primary-500" size={20} /> Aktivite Geçmişi
                            </h3>
                        </div>

                        {/* Add New Activity */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
                            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                                    <button onClick={() => setNewActivityType('note')} className={`px-4 py-2 text-xs font-bold transition-colors ${newActivityType === 'note' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}>Not</button>
                                    <button onClick={() => setNewActivityType('call')} className={`px-4 py-2 text-xs font-bold transition-colors border-l border-slate-200 ${newActivityType === 'call' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}>Arama</button>
                                    <button onClick={() => setNewActivityType('email')} className={`px-4 py-2 text-xs font-bold transition-colors border-l border-slate-200 ${newActivityType === 'email' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}>E-posta</button>
                                    <button onClick={() => setNewActivityType('meeting')} className={`px-4 py-2 text-xs font-bold transition-colors border-l border-slate-200 ${newActivityType === 'meeting' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}>Toplantı</button>
                                </div>
                            </div>
                            <textarea
                                value={newActivityContent}
                                onChange={(e) => setNewActivityContent(e.target.value)}
                                placeholder="Aktivite detayı veya görüşme notu yazın..."
                                className="w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-y mb-3"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddActivity}
                                    disabled={!newActivityContent.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <Plus size={16} /> Ekle
                                </button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 space-y-8">
                            {activities.length > 0 ? (
                                activities.map((act) => (
                                    <div key={act.id} className="relative">
                                        <div className={`absolute -left-[35px] sm:-left-[43px] w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm 
                                            ${act.type === 'note' ? 'bg-amber-100 text-amber-600' :
                                                act.type === 'call' ? 'bg-emerald-100 text-emerald-600' :
                                                    act.type === 'email' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-purple-100 text-purple-600'}`}
                                        >
                                            {act.type === 'note' && <FileText size={12} />}
                                            {act.type === 'call' && <Phone size={12} />}
                                            {act.type === 'email' && <Mail size={12} />}
                                            {act.type === 'meeting' && <User size={12} />}
                                        </div>
                                        <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">
                                                    {act.type === 'note' ? 'Not' : act.type === 'call' ? 'Arama' : act.type === 'email' ? 'E-posta' : 'Toplantı'}
                                                </span>
                                                <span className="text-xs font-medium text-slate-400">
                                                    {new Date(act.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{act.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-400 italic">Henüz bir aktivite girilmemiş.</div>
                            )}

                            {/* Legacy Notes Backwards comp. */}
                            {opportunity.notes && activities.length === 0 && (
                                <div className="relative">
                                    <div className="absolute -left-[35px] sm:-left-[43px] w-8 h-8 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center shadow-sm text-slate-500">
                                        <FileText size={12} />
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Aktivite Öncesi Alınan Notlar</div>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{opportunity.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                </div>

                {/* Footer Controls */}
                {isEditing && (
                    <div className="bg-white border-t border-slate-200 p-4 sm:p-6 flex justify-end gap-3 shrink-0">
                        <button onClick={() => {
                            setIsEditing(false);
                            setNotes(opportunity.notes || '');
                            setContact(opportunity.contact);
                            setTargetCloseDate(opportunity.targetCloseDate || '');
                            setAssignee(opportunity.assignee || '');
                            setTrainings(opportunity.trainings || []);
                        }} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">İptal</button>
                        <button onClick={handleSave} className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">Değişiklikleri Kaydet</button>
                    </div>
                )}
            </div>
        </div>
    );
};
