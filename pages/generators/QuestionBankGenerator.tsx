
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button, Loader, DataListInput } from '../../components/UI';
import { generateTextContent } from '../../services/geminiService';
import { Scroll, Calculator, Layers } from 'lucide-react';
import { SUBJECTS } from '../../utils/data';

const QuestionBankGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isPesantren, setIsPesantren] = useState(false);
  
  const [formData, setFormData] = useState({
    jenjang: 'SMA',
    kelas: '10',
    mapel: '',
    topik: '',
    difficulty: 'Sedang',
    pgOptionCount: '5', // Default 5 options for SMA
    bahasa: 'Bahasa Indonesia'
  });

  // Specific counts for SMA/SMP checklist system
  const [distribution, setDistribution] = useState({
    pg: 0,
    pgTka: 0,
    uraian: 0,
    uraianTka: 0,
    simpleTotal: 10, // For SD/Pesantren/Simple mode
    simpleType: 'Pilihan Ganda'
  });

  // Auto-configure defaults based on Jenjang
  useEffect(() => {
    if (formData.jenjang === 'SMA') {
        setFormData(prev => ({ ...prev, pgOptionCount: '5' }));
    } else if (formData.jenjang === 'SMP') {
        setFormData(prev => ({ ...prev, pgOptionCount: '4' }));
    } else {
        setFormData(prev => ({ ...prev, pgOptionCount: '3' }));
    }
  }, [formData.jenjang]);

  // Calculate total questions
  const getTotalQuestions = () => {
      if (['SMA', 'SMP'].includes(formData.jenjang)) {
          return (
              (parseInt(distribution.pg as any) || 0) +
              (parseInt(distribution.pgTka as any) || 0) +
              (parseInt(distribution.uraian as any) || 0) +
              (parseInt(distribution.uraianTka as any) || 0)
          );
      }
      return distribution.simpleTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = getTotalQuestions();
    
    if (total === 0) {
        alert("Jumlah total soal tidak boleh 0.");
        return;
    }

    setLoading(true);

    const isComplexLevel = ['SMA', 'SMP'].includes(formData.jenjang);
    
    // Constructing the breakdown description for the prompt
    let distributionPrompt = "";
    if (isComplexLevel) {
        distributionPrompt = `
    RINCIAN DISTRIBUSI SOAL (Total ${total} Butir):
    1. Pilihan Ganda (Reguler): ${distribution.pg} butir.
    2. Pilihan Ganda TKA (Tes Kemampuan Akademik/HOTS): ${distribution.pgTka} butir.
    3. Uraian/Essay (Reguler): ${distribution.uraian} butir.
    4. Uraian TKA (Analisis Mendalam): ${distribution.uraianTka} butir.
        `;
    } else {
        distributionPrompt = `
    SPESIFIKASI SOAL:
    - Jumlah Total: ${distribution.simpleTotal} butir.
    - Tipe Soal: ${distribution.simpleType}.
        `;
    }

    let prompt = `Bertindaklah sebagai ahli pembuat soal dan pengembang kurikulum. Buatkan **Paket Asesmen Lengkap** untuk:
    - Jenjang: **${formData.jenjang}**
    - Kelas: **${formData.kelas}**
    - Mata Pelajaran: **${formData.mapel}**
    - Topik: **${formData.topik}**
    - Bahasa Soal: **${formData.bahasa}**
    
    ${distributionPrompt}

    PENGATURAN OPSI JAWABAN (PENTING):
    - Untuk soal Pilihan Ganda (PG), buatkan **${formData.pgOptionCount} opsi jawaban** (${Array.from({length: parseInt(formData.pgOptionCount)}, (_, i) => String.fromCharCode(65 + i)).join(', ')}).
    - Pastikan kunci jawaban sesuai dengan opsi yang tersedia.

    TINGKAT KESULITAN:
    - ${formData.difficulty}
    ${formData.difficulty === 'Sulit (HOTS)' ? '(Prioritaskan stimulus data, grafik, dan wacana kompleks)' : ''}

    ${formData.jenjang === 'SMA' ? `
    INSTRUKSI KHUSUS TKA (Tes Kemampuan Akademik):
    - Soal TKA harus berstandar UTBK/Seleksi Masuk Perguruan Tinggi.
    - Fokus pada penalaran mendalam, analisis data, literasi, dan numerasi.
    ` : ''}

    ${isPesantren ? `
    MODIFIKASI KHUSUS PESANTREN (Wajib diterapkan pada Naskah Soal):
    Bagi Naskah Soal menjadi 3 Bagian:
    1. Bagian Alif (Hafalan/Mufradat/Tekstual)
    2. Bagian Ba (Pemahaman/Fiqh/Kontekstual)
    3. Bagian Jim (Analisis Kitab/Nahwu Shorof/HOTS)
    Gunakan istilah Arab yang relevan jika mapel memungkinkan.
    ` : ''}

    TUGAS ANDA ADALAH MENGHASILKAN 6 BAGIAN DOKUMEN DALAM SATU OUTPUT HTML.
    Pisahkan setiap bagian dengan tag <hr> dan <h2 style="color:#4f46e5; border-bottom:2px solid #ddd; padding-bottom:10px; margin-top:30px;">Judul Bagian</h2>.
    
    **PENTING:** Pastikan seluruh soal, kunci jawaban, dan materi menggunakan **${formData.bahasa}**.

    Bagian-bagian yang WAJIB ada (Berurutan):

    1. NASKAH SOAL
       - Berisi header soal standar.
       - Daftar pertanyaan yang siap cetak (JANGAN sertakan jawaban di sini).
       - Format opsi jawaban PG harus ${formData.pgOptionCount} pilihan (A-${String.fromCharCode(64 + parseInt(formData.pgOptionCount))}).

    2. KISI-KISI SOAL
       - Buat dalam Tabel HTML.
       - Kolom: No, CP/Tujuan, Materi, Indikator, Level Kognitif (L1/L2/L3), Bentuk Soal (PG/Uraian), No Soal.

    3. KUNCI JAWABAN DAN PEMBAHASAN
       - Kunci jawaban lengkap.
       - Pembahasan detail per nomor.

    4. ANALISIS KUALITATIF SOAL
       - Analisis aspek Materi, Konstruksi, dan Bahasa.

    5. RUBRIK PENILAIAN / PENSKORAN
       - Pedoman penskoran (misal: PG=1, Uraian=5).
       - Rumus Nilai Akhir.

    6. RINGKASAN MATERI
       - Rangkuman padat (Cheatsheet) tentang topik ${formData.topik}.

    Output hanya body content HTML. Gunakan styling inline CSS agar tabel dan layout rapi saat dicopy ke Word.`;

    try {
      const result = await generateTextContent(prompt, "Anda adalah pembuat soal ujian profesional.");
      if (result) {
          localStorage.setItem('lastResult', JSON.stringify({
            title: `Bank Soal ${formData.kelas} - ${formData.mapel}`,
            content: result,
            type: 'BANK_SOAL',
            date: new Date().toISOString()
          }));
          navigate('/results');
      }
    } catch (error) {
      alert('Gagal membuat soal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Generator Bank Soal</h1>
        <p className="text-slate-400">Buat paket asesmen lengkap dengan distribusi soal yang fleksibel.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Pesantren Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPesantren ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <Scroll size={20} />
                  </div>
                  <div>
                      <span className="block font-medium text-slate-200">Mode Pesantren</span>
                      <span className="text-xs text-slate-500">Format Alif-Ba-Jim (Khusus Mapel Arab/Kitab)</span>
                  </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isPesantren} onChange={(e) => setIsPesantren(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
              <Select label="Jenjang" value={formData.jenjang} onChange={(e) => setFormData({...formData, jenjang: e.target.value})}>
                  <option value="SD">SD / MI</option>
                  <option value="SMP">SMP / MTs</option>
                  <option value="SMA">SMA / MA</option>
                  <option value="Pesantren">Pesantren</option>
              </Select>
              <Input 
                  label="Kelas" 
                  placeholder="Contoh: 10, 12 IPA 1" 
                  value={formData.kelas}
                  onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                  required
              />
          </div>
          
          <Select 
            label="Bahasa Soal" 
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
            placeholder={isPesantren ? "Contoh: Nahwu, Fiqih" : "Pilih atau ketik mata pelajaran"}
            value={formData.mapel}
            onChange={(val) => setFormData({...formData, mapel: val})}
            options={SUBJECTS}
            required
          />

          <Input 
            label="Topik / Materi" 
            placeholder="Materi yang diujikan..."
            value={formData.topik}
            onChange={(e) => setFormData({...formData, topik: e.target.value})}
            required
          />

          {/* Question Distribution Section */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
              <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                  <Calculator size={18} className="text-indigo-400" />
                  <h3 className="font-semibold text-slate-200">Distribusi Soal</h3>
                  <span className="ml-auto text-xs bg-indigo-600 px-2 py-1 rounded text-white">
                      Total: {getTotalQuestions()} Soal
                  </span>
              </div>

              {['SMA', 'SMP'].includes(formData.jenjang) ? (
                  <div className="grid grid-cols-2 gap-4">
                      <Input 
                          label="Jumlah PG (Reguler)" 
                          type="number" min="0" 
                          value={distribution.pg}
                          onChange={(e) => setDistribution({...distribution, pg: parseInt(e.target.value) || 0})}
                      />
                      <Input 
                          label="Jumlah PG TKA (HOTS)" 
                          type="number" min="0"
                          value={distribution.pgTka}
                          onChange={(e) => setDistribution({...distribution, pgTka: parseInt(e.target.value) || 0})}
                          className={formData.jenjang === 'SMP' ? 'opacity-50' : ''}
                      />
                      <Input 
                          label="Jumlah Uraian" 
                          type="number" min="0"
                          value={distribution.uraian}
                          onChange={(e) => setDistribution({...distribution, uraian: parseInt(e.target.value) || 0})}
                      />
                      <Input 
                          label="Jumlah Uraian TKA" 
                          type="number" min="0"
                          value={distribution.uraianTka}
                          onChange={(e) => setDistribution({...distribution, uraianTka: parseInt(e.target.value) || 0})}
                          className={formData.jenjang === 'SMP' ? 'opacity-50' : ''}
                      />
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Jumlah Soal" 
                        type="number" min="1" max="100"
                        value={distribution.simpleTotal}
                        onChange={(e) => setDistribution({...distribution, simpleTotal: parseInt(e.target.value) || 0})}
                      />
                      <Select 
                        label="Tipe Soal" 
                        value={distribution.simpleType} 
                        onChange={(e) => setDistribution({...distribution, simpleType: e.target.value})}
                      >
                          <option value="Pilihan Ganda">Pilihan Ganda</option>
                          <option value="Isian Singkat">Isian Singkat</option>
                          <option value="Uraian">Uraian / Essay</option>
                          <option value="Campuran">Campuran</option>
                      </Select>
                  </div>
              )}
          </div>

          {/* Settings Section */}
          <div className="grid grid-cols-2 gap-4">
              <Select label="Opsi Jawaban PG" value={formData.pgOptionCount} onChange={(e) => setFormData({...formData, pgOptionCount: e.target.value})}>
                  <option value="3">3 Opsi (A, B, C)</option>
                  <option value="4">4 Opsi (A, B, C, D)</option>
                  <option value="5">5 Opsi (A, B, C, D, E)</option>
              </Select>

              <Select label="Tingkat Kesulitan" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                  <option>Mudah</option>
                  <option>Sedang</option>
                  <option>Sulit (HOTS)</option>
              </Select>
          </div>

          <Button type="submit" className="w-full h-12 shadow-lg shadow-indigo-500/20" disabled={loading}>
             {loading ? <><Loader /> Menghasilkan Paket Soal...</> : 'Generate Bank Soal'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default QuestionBankGenerator;
