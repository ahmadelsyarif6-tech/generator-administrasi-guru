
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Loader, DataListInput, Select } from '../../components/UI';
import { generateTextContent } from '../../services/geminiService';
import { Sparkles, CheckSquare, Square, Calendar } from 'lucide-react';
import { SUBJECTS, TEACHERS } from '../../utils/data';

const DOC_TYPES = [
  'Modul Ajar',
  'Analisis CP & ATP',
  'Program Tahunan (Prota)',
  'Program Semester (Promes)',
  'KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)',
  'Jurnal Harian Guru'
];

const AdminGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jenjang: 'SMA',
    kelas: '10',
    mapel: '',
    guru: '',
    topik: '',
    modeCerdas: false,
    deadline: '',
    bahasa: 'Bahasa Indonesia'
  });
  
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>(['Modul Ajar']);

  const toggleDocType = (type: string) => {
    if (selectedDocTypes.includes(type)) {
      setSelectedDocTypes(selectedDocTypes.filter(t => t !== type));
    } else {
      setSelectedDocTypes([...selectedDocTypes, type]);
    }
  };

  const toggleAll = () => {
    if (selectedDocTypes.length === DOC_TYPES.length) {
      setSelectedDocTypes([]);
    } else {
      setSelectedDocTypes(DOC_TYPES);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocTypes.length === 0) {
        alert("Pilih minimal satu jenis dokumen.");
        return;
    }

    setLoading(true);
    
    const prompt = `Buatkan paket dokumen administrasi guru yang terdiri dari: ${selectedDocTypes.join(', ')}.
    
    Detail Administrasi:
    - Jenjang: ${formData.jenjang}
    - Kelas: ${formData.kelas}
    - Mata Pelajaran: ${formData.mapel}
    - Guru Pengampu: ${formData.guru}
    - Topik/Materi: ${formData.topik}
    - Bahasa Dokumen: ${formData.bahasa}
    
    Instruksi Format:
    1. Buatkan SEMUA jenis dokumen yang diminta di atas dalam satu respon ini.
    2. Pisahkan setiap dokumen dengan tag <hr> dan Judul Dokumen (<h1>) yang jelas agar mudah dibaca.
    3. Gunakan format HTML yang rapi dengan tabel (border css inline) jika diperlukan.
    4. PENTING: Gunakan ${formData.bahasa} untuk seluruh isi konten dokumen (kecuali istilah teknis yang tidak bisa diterjemahkan).
    ${formData.modeCerdas ? '5. Sertakan analisis mendalam, strategi pembelajaran diferensiasi, dan profil pelajar pancasila untuk setiap bagian yang relevan.' : ''}
    
    Output hanya kode HTML body content (tanpa <html> atau <head>).`;

    try {
      const result = await generateTextContent(prompt, "Anda adalah asisten administrasi guru ahli Kurikulum Merdeka.");
      if (result) {
          const title = selectedDocTypes.length > 1 
            ? `Paket Administrasi (${selectedDocTypes.length} Dokumen) - ${formData.mapel}`
            : `${selectedDocTypes[0]} - ${formData.mapel}`;

          localStorage.setItem('lastResult', JSON.stringify({
            title: title,
            content: result,
            type: 'ADMINISTRASI',
            date: new Date().toISOString(),
            deadline: formData.deadline // Save the deadline
          }));
          navigate('/results');
      }
    } catch (error) {
      alert('Gagal membuat dokumen. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Generator Administrasi</h1>
        <p className="text-slate-400">Buat dokumen Prota, Promes, Modul Ajar, dan ATP secara massal.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
             {/* Basic Info Section */}
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-indigo-400 border-b border-slate-700 pb-2">Informasi Umum</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-slate-400">Jenjang</label>
                        <select 
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                            value={formData.jenjang}
                            onChange={(e) => setFormData({...formData, jenjang: e.target.value})}
                        >
                            <option value="SD">SD / MI</option>
                            <option value="SMP">SMP / MTs</option>
                            <option value="SMA">SMA / MA</option>
                            <option value="Pesantren">Pesantren</option>
                        </select>
                    </div>
                    <Input 
                        label="Kelas" 
                        placeholder="Contoh: 10"
                        value={formData.kelas}
                        onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                    />
                </div>

                <Select 
                    label="Bahasa Dokumen" 
                    value={formData.bahasa} 
                    onChange={(e) => setFormData({...formData, bahasa: e.target.value})}
                >
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Arab">Bahasa Arab (العربية)</option>
                    <option value="Bahasa Inggris">Bahasa Inggris (English)</option>
                    <option value="Bahasa Sunda">Bahasa Sunda</option>
                </Select>

                <DataListInput 
                    label="Mata Pelajaran"
                    placeholder="Pilih atau ketik mata pelajaran"
                    value={formData.mapel}
                    onChange={(val) => setFormData({...formData, mapel: val})}
                    options={SUBJECTS}
                    required
                />

                <DataListInput 
                    label="Nama Guru"
                    placeholder="Pilih atau ketik nama guru"
                    value={formData.guru}
                    onChange={(val) => setFormData({...formData, guru: val})}
                    options={TEACHERS}
                />

                <Input 
                    label="Topik / Materi Pokok" 
                    placeholder="Contoh: Teks Eksposisi"
                    value={formData.topik}
                    onChange={(e) => setFormData({...formData, topik: e.target.value})}
                    required
                />

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-slate-400 flex items-center gap-2">
                        <Calendar size={14} /> Tenggat Waktu (Deadline)
                    </label>
                    <input 
                        type="date"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                        value={formData.deadline}
                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    />
                    <span className="text-xs text-slate-500">Tandai di kalender untuk pengingat.</span>
                </div>
             </div>

             {/* Document Selection Section */}
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <h3 className="text-lg font-semibold text-indigo-400">Pilih Dokumen</h3>
                    <button 
                        type="button" 
                        onClick={toggleAll}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        {selectedDocTypes.length === DOC_TYPES.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    {DOC_TYPES.map((type) => {
                        const isChecked = selectedDocTypes.includes(type);
                        return (
                            <div 
                                key={type}
                                onClick={() => toggleDocType(type)}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    isChecked 
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                            >
                                {isChecked ? <CheckSquare size={20} className="text-indigo-400" /> : <Square size={20} />}
                                <span className="font-medium">{type}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg mt-4">
                    <input 
                        type="checkbox" 
                        id="smartMode" 
                        className="w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
                        checked={formData.modeCerdas}
                        onChange={(e) => setFormData({...formData, modeCerdas: e.target.checked})}
                    />
                    <label htmlFor="smartMode" className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                    <Sparkles size={16} className="text-yellow-400" />
                    <span><strong>Mode Cerdas:</strong> Hasil lebih detail (Proses lebih lama)</span>
                    </label>
                </div>
             </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-bold shadow-xl" disabled={loading}>
            {loading ? (
                <div className="flex items-center gap-3">
                    <Loader /> 
                    <span>Sedang Menyusun {selectedDocTypes.length} Dokumen...</span>
                </div>
            ) : (
                `Generate ${selectedDocTypes.length > 0 ? selectedDocTypes.length : ''} Dokumen Terpilih`
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminGenerator;
