import React, { useState, useMemo } from 'react';
import { useOpportunities } from '../store/OpportunityContext';
import type { Opportunity, TrainingItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, Plus, Trash2, Calendar, User, Phone, Mail, Building, FileText } from 'lucide-react';

interface NewOpportunityModalProps {
    onClose: () => void;
}

export const NewOpportunityModal = ({ onClose }: NewOpportunityModalProps) => {
    const { addOpportunity } = useOpportunities();

    // General
    const [customerName, setCustomerName] = useState('');
    const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);
    const [targetCloseDate, setTargetCloseDate] = useState('');
    const [assignee, setAssignee] = useState('');
    const [name, setName] = useState('');

    // Contact
    const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    // Trainings
    const [trainings, setTrainings] = useState<Omit<TrainingItem, 'id' | 'status'>[]>([]);

    // Notes
    const [notes, setNotes] = useState('');

    const handleAddTraining = () => {
        setTrainings(prev => [...prev, {
            topic: '',
            type: '',
            amount: 0,
            duration: '',
            hasAssessment: false,
        }]);
    };

    const updateTraining = (index: number, field: keyof TrainingItem, value: any) => {
        const newTrainings = [...trainings];
        newTrainings[index] = { ...newTrainings[index], [field]: value };
        setTrainings(newTrainings);
    };

    const removeTraining = (index: number) => {
        setTrainings(prev => prev.filter((_, i) => i !== index));
    };

    const totalAmount = useMemo(() => {
        return trainings.reduce((sum, t) => {
            let tSum = Number(t.amount) || 0;
            if (t.hasAssessment) {
                tSum += (Number(t.participantCount) || 0) * (Number(t.assessmentPrice) || 0);
            }
            return sum + tSum;
        }, 0);
    }, [trainings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newOpp: Opportunity = {
            id: uuidv4(),
            customerName,
            createdAt,
            targetCloseDate,
            assignee,
            name,
            contact,
            trainings: trainings.map(t => ({ ...t, id: uuidv4(), status: 'pending' as const })),
            activities: notes ? [{ id: uuidv4(), date: new Date().toISOString(), content: notes, type: 'note' as const }] : [],
            tasks: [],
            totalAmount,
            notes,
            status: 'Teklif verildi'
        };

        addOpportunity(newOpp);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-10 pb-10 overflow-y-auto bg-slate-900/40 backdrop-blur-sm custom-scrollbar">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[28px] w-full max-w-4xl m-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-6 border-b border-slate-200/50 bg-white/40 rounded-t-[28px]">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-sm border border-primary-200/50">
                            <Plus size={22} />
                        </div>
                        Yeni Fırsat Ekle
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 p-2.5 rounded-full transition-all cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-10">
                    {/* General Info */}
                    <section className="space-y-5">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Building size={20} className="text-slate-400" /> Genel Bilgiler
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Müşteri Adı</label>
                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen bu alanı doldurun.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Örn: Acme Corp" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Fırsat Adı</label>
                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen bu alanı doldurun.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Örn: 2026 Liderlik Eğitimi" />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Oluşturma Tarihi</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen bir tarih seçin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="date" value={createdAt} onChange={e => setCreatedAt(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Kapanış Hedefi</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <input type="date" value={targetCloseDate} onChange={e => setTargetCloseDate(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Sorumlu Kişi</label>
                                    <select required onInvalid={e => (e.target as HTMLSelectElement).setCustomValidity('Lütfen listeden bir kişi seçin.')} onInput={e => (e.target as HTMLSelectElement).setCustomValidity('')} value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none cursor-pointer">
                                        <option value="">Seçiniz...</option>
                                        <option value="Uğur Şahin">Uğur Şahin</option>
                                        <option value="Volkan Ekşi">Volkan Ekşi</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Info */}
                    <section className="space-y-5">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <User size={20} className="text-slate-400" /> İlgili Kişi Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Ad</label>
                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen bu alanı doldurun.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="text" value={contact.firstName} onChange={e => setContact({ ...contact, firstName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Ad" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Soyad</label>
                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen bu alanı doldurun.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="text" value={contact.lastName} onChange={e => setContact({ ...contact, lastName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Soyad" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                    <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen geçerli bir e-posta adresi girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="ornek@sirket.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                    <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen bu alanı doldurun.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="05XX XXX XX XX" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Trainings */}
                    <section className="space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText size={20} className="text-slate-400" /> Eğitim Ekleme
                            </h3>
                            <button type="button" onClick={handleAddTraining} className="text-sm bg-primary-50 text-primary-700 font-bold px-4 py-2 rounded-xl border border-primary-200/50 hover:bg-primary-100 hover:shadow-sm flex items-center gap-1.5 transition-all cursor-pointer">
                                <Plus size={18} /> Eğitim Ekle
                            </button>
                        </div>

                        {trainings.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 border-[3px] border-dashed border-slate-200/60 rounded-[20px] bg-slate-50/50">
                                Henüz eğitim eklenmedi. Yeni bir eğitim ekleyin.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {trainings.map((training, index) => (
                                    <div key={index} className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-200/70 relative transition-all hover:shadow-md">
                                        <button type="button" onClick={() => removeTraining(index)} className="absolute top-5 right-5 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-full transition-colors cursor-pointer">
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-10">
                                            <div>
                                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Konu</label>
                                                <select required onInvalid={e => (e.target as HTMLSelectElement).setCustomValidity('Lütfen bir konu seçin.')} onInput={e => (e.target as HTMLSelectElement).setCustomValidity('')} value={training.topic} onChange={e => updateTraining(index, 'topic', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none cursor-pointer">
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
                                                <select required onInvalid={e => (e.target as HTMLSelectElement).setCustomValidity('Lütfen eğitim türünü seçin.')} onInput={e => (e.target as HTMLSelectElement).setCustomValidity('')} value={training.type} onChange={e => updateTraining(index, 'type', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none cursor-pointer">
                                                    <option value="">Seçiniz...</option>
                                                    <option value="Sınıf İçi">Sınıf İçi</option>
                                                    <option value="Online">Online</option>
                                                    <option value="Karma">Karma (Hibrit)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tutar (₺)</label>
                                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen tutar girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="number" min="0" value={training.amount || ''} onChange={e => updateTraining(index, 'amount', Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Süre</label>
                                                <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen süreyi girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="text" value={training.duration} onChange={e => updateTraining(index, 'duration', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Örn: 2 Gün" />
                                            </div>

                                            <div className="md:col-span-2 mt-3 pt-5 border-t border-slate-100">
                                                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer select-none">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" checked={training.hasAssessment} onChange={e => updateTraining(index, 'hasAssessment', e.target.checked)} className="peer sr-only" />
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                                    </div>
                                                    Assessment ve Kit Seçeneği Ekle
                                                </label>

                                                {training.hasAssessment && (
                                                    <div className="grid grid-cols-2 gap-5 mt-5 bg-primary-50/50 p-4 rounded-xl border border-primary-100/50 animate-in slide-in-from-top-2 duration-200">
                                                        <div>
                                                            <label className="block text-xs font-bold text-primary-700/70 mb-1.5 uppercase tracking-wide">Kişi Sayısı</label>
                                                            <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen kişi sayısını girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="number" min="1" value={training.participantCount || ''} onChange={e => updateTraining(index, 'participantCount', Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white border border-primary-200/50 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Örn: 15" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-primary-700/70 mb-1.5 uppercase tracking-wide">Kişi Başı Fiyat (₺)</label>
                                                            <input required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Lütfen kişi başı fiyatı girin.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} type="number" min="0" value={training.assessmentPrice || ''} onChange={e => updateTraining(index, 'assessmentPrice', Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white border border-primary-200/50 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none" placeholder="Örn: 500" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Summary */}
                    <section className="bg-slate-100/50 p-6 rounded-[20px] border border-slate-200/60">
                        <div className="mb-5">
                            <label className="block text-[13px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">Notlar</label>
                            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 outline-none resize-none" placeholder="Fırsat ile ilgili eklemek istedikleriniz..."></textarea>
                        </div>

                        <div className="flex justify-between items-center pt-5 border-t border-slate-200/80">
                            <span className="text-lg font-bold text-slate-600">Genel Toplam:</span>
                            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 tracking-tight">
                                {totalAmount.toLocaleString('tr-TR')} ₺
                            </span>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60 sticky bottom-0 bg-white/80 backdrop-blur-md py-5 rounded-b-[28px] -mx-8 px-8 mb-[-2rem]">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">İptal Et</button>
                        <button type="submit" disabled={trainings.length === 0} className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer">
                            Fırsatı Başlat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
