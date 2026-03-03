import React, { useState } from 'react';
import { useCustomers } from '../store/CustomerContext';
import { X, Plus, Building, User, Phone, Mail, FileText, Globe, MapPin, Users } from 'lucide-react';

interface AddCustomerModalProps {
    onClose: () => void;
}

export const AddCustomerModal = ({ onClose }: AddCustomerModalProps) => {
    const { addCustomer } = useCustomers();

    const [type, setType] = useState<'potential' | 'existing'>('potential');
    const [companyName, setCompanyName] = useState('');
    const [representative, setRepresentative] = useState('');
    const [contactName, setContactName] = useState('');
    const [industry, setIndustry] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [employeeCount, setEmployeeCount] = useState('');
    const [address, setAddress] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [taxOffice, setTaxOffice] = useState('');
    const [taxNumber, setTaxNumber] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await addCustomer({
            companyName,
            representative,
            contactName,
            industry,
            email,
            phone,
            employeeCount,
            address,
            billingAddress,
            taxOffice,
            taxNumber,
            type
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-10 pb-10 overflow-y-auto bg-slate-900/40 backdrop-blur-sm custom-scrollbar">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[28px] w-full max-w-4xl m-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-6 border-b border-slate-200/50 bg-white/40 rounded-t-[28px]">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200/50">
                            <Plus size={22} />
                        </div>
                        Yeni Müşteri Ekle
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 p-2.5 rounded-full transition-all cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Customer Type Selection */}
                    <div className="flex gap-4 p-1 bg-slate-100/50 rounded-2xl w-full max-w-md mx-auto">
                        <button
                            type="button"
                            onClick={() => setType('potential')}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${type === 'potential'
                                ? 'bg-white shadow-sm ring-1 ring-slate-200 text-primary-600'
                                : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                                }`}
                        >
                            Potansiyel Müşteri
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('existing')}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${type === 'existing'
                                ? 'bg-white shadow-sm ring-1 ring-slate-200 text-emerald-600'
                                : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                                }`}
                        >
                            Mevcut Müşteri
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <Globe size={14} className="text-indigo-400" /> Şirket / Müşteri Adı
                                </label>
                                <input required type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="ÖRN: FRANCO EĞİTİM HİZMETLERİ A.Ş." />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <Building size={14} className="text-amber-400" /> Müşteri Temsilcisi
                                </label>
                                <select required value={representative} onChange={e => setRepresentative(e.target.value)} className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-800 font-bold appearance-none cursor-pointer">
                                    <option value="" disabled>TEMSİLCİ SEÇİNİZ...</option>
                                    <option value="Uğur Şahin">Uğur Şahin</option>
                                    <option value="Volkan Ekşi">Volkan Ekşi</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <User size={14} className="text-sky-400" /> Kontak Kişisi
                                </label>
                                <input required type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="AD SOYAD" />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <Mail size={14} className="text-blue-400" /> E-Posta
                                </label>
                                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="ORNEK@SIRKET.COM" />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <Users size={14} className="text-blue-500" /> Ölçek (Çalışan)
                                </label>
                                <input type="number" min="1" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="ÖRN: 250" />
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-6">
                            <div className="h-[84px] hidden md:block"></div> {/* Spacer to align with representative */}

                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <Building size={14} className="text-indigo-400" /> Sektör
                                </label>
                                <select required value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium cursor-pointer">
                                    <option value="" disabled>ÖRN: TEKNOLOJİ</option>
                                    <option value="Teknoloji">Teknoloji</option>
                                    <option value="Finans">Finans</option>
                                    <option value="Sağlık">Sağlık</option>
                                    <option value="Üretim">Üretim</option>
                                    <option value="Perakende">Perakende</option>
                                    <option value="Hizmet">Hizmet</option>
                                    <option value="Eğitim">Eğitim</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <Phone size={14} className="text-blue-400" /> Telefon
                                </label>
                                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="+90 5XX..." />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-2">
                        <div>
                            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                <MapPin size={14} className="text-blue-500" /> Lokasyon / Adres
                            </label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="TAM ADRES..." />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                <FileText size={14} className="text-blue-500" /> Fatura Adresi
                            </label>
                            <textarea rows={2} value={billingAddress} onChange={e => setBillingAddress(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium resize-none" placeholder="TAM FATURA ADRESİ..."></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <Building size={14} className="text-blue-500" /> Vergi Dairesi
                                </label>
                                <input type="text" value={taxOffice} onChange={e => setTaxOffice(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="ÖRN: ZİNCİRLİKUYU" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
                                    <FileText size={14} className="text-blue-500" /> Vergi Numarası
                                </label>
                                <input type="text" value={taxNumber} onChange={e => setTaxNumber(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="10 HANELİ VERGİ NO" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                            VAZGEÇ
                        </button>
                        <button type="submit" className="px-8 py-3.5 rounded-xl font-bold text-white bg-[#0f172a] hover:bg-[#1e293b] shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer">
                            <Plus size={18} /> MÜŞTERİYİ KAYDET
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
