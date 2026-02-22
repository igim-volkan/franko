import { useState } from 'react';
import type { Opportunity } from '../types';
import { useOpportunities } from '../store/OpportunityContext';
import { X, User, Phone, Mail, FileText, Calendar, Building, DollarSign, Printer } from 'lucide-react';

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

    const handleSave = () => {
        updateOpportunity(opportunity.id, {
            notes,
            contact
        });
        setIsEditing(false);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[60] flex justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 sm:p-8 text-white relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
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
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Eğitimler ({opportunity.trainings.length})
                        </h3>
                        <div className="space-y-3">
                            {opportunity.trainings.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50">
                                    <div>
                                        <p className="font-semibold text-slate-800">{t.topic}</p>
                                        <p className="text-xs text-slate-500">{t.type} • {t.duration} {t.participantCount ? `• ${t.participantCount} Kişi` : ''}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary-700">{t.amount.toLocaleString('tr-TR')} ₺</p>
                                        {t.hasAssessment && <p className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md inline-block mt-1">Envanter Dahil</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Notes */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="text-primary-500" size={20} /> Notlar ve Görüşmeler
                            </h3>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-primary-600 hover:text-primary-700">Düzenle</button>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full min-h-[120px] p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-y"
                                placeholder="Görüşme notları, toplantı özetleri..."
                            />
                        ) : (
                            <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[80px]">
                                {opportunity.notes || <span className="italic text-slate-400">Henüz not eklenmemiş.</span>}
                            </div>
                        )}
                    </section>

                </div>

                {/* Footer Controls */}
                {isEditing && (
                    <div className="bg-white border-t border-slate-200 p-4 sm:p-6 flex justify-end gap-3 shrink-0">
                        <button onClick={() => {
                            setIsEditing(false);
                            setNotes(opportunity.notes || '');
                            setContact(opportunity.contact);
                        }} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">İptal</button>
                        <button onClick={handleSave} className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">Değişiklikleri Kaydet</button>
                    </div>
                )}
            </div>
        </div>
    );
};
