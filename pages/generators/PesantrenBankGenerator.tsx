
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button, DataListInput, ProgressModal } from '../../components/UI';
import { generateTextContentStream } from '../../services/geminiService';
import { Scroll, BookOpen } from 'lucide-react';
import { SUBJECTS } from '../../utils/data';

const PesantrenBankGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [streamLog, setStreamLog] = useState('');
  
  const [formData, setFormData] = useState({
    jenjang: 'Pesantren',
    kelas: '1 (Ula)',
    mapel: '',
    topik: '',
    difficulty: 'Sedang',
    bahasa: 'Bahasa Arab'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStreamLog("Menghubungkan ke Ma'had AI System...");

    // INSYA CHECK
    const isInsya = formData.mapel.toLowerCase().includes("insya") || formData.mapel.includes("الإِنْشَاءُ");

    // HARAKAT INSTRUCTION (STRICT)
    const harakatInstruction = `
    ATURAN WAJIB PENULISAN BAHASA ARAB (HARAKAT/SYAKAL):
    1. SETIAP KATA Bahasa Arab (Soal, Instruksi, Teks Bacaan) WAJIB DIBERI HARAKAT LENGKAP (Fathah, Kasrah, Dhammah, Sukun, Shaddah, Tanwin).
    2. JANGAN ADA ARAB GUNDUL. Tujuannya agar santri mudah membaca dan tidak salah tafsir.
    3. Gunakan font standar yang jelas (Traditional Arabic / Amiri).
    `;

    let structurePrompt = "";

    if (isInsya) {
        structurePrompt = `
    STRUKTUR KHUSUS "AL-INSYA" (4 BAGIAN - BERHARAKAT):
    1. HEADER (KOP):
       - Logo placeholder kiri atas.
       - Teks Tengah: "مَعْهَدُ الْغَزَالِي الْعَصْرِيِّ لِلتَّرْبِيَةِ الْإِسْلَامِيَّةِ الْحَدِيْثَةِ"
       - Bawahnya: "تْشُوْرُوْغْ غُوْنُوْنْجْ سِيْنْدُوْرْ بُوْكُوْرْ جَاوِي الْغَرْبِيَّةِ"
       - Judul: "الِامْتِحَانُ التَّحْرِيْرِيُّ..."
       - Tabel Identitas: الْمَادَّةُ (Insya), الْيَوْمُ, الْحِصَّةُ, الْفَصْلُ.

    2. ISI SOAL (WAJIB BERHARAKAT):
       أ. Bagian Alif: أَكْمِلِ الفَرَاغَ... (Melengkapi Kalimat - 5 Soal).
       ب. Bagian Ba: كَوِّنْ جُمَلًا مُفِيدَةً... (Membuat Kalimat - 5 Soal).
       ج. Bagian Jim: اكْتُبْ فِقْرَةً... (Mengarang Paragraf tentang ${formData.topik}).
       د. Bagian Dal: تَرْجِمِ الْجُمَلَ... (Menerjemahkan Indo-Arab - 6 Soal).
        `;
    } else {
        structurePrompt = `
    STRUKTUR STANDAR PESANTREN (7 BAGIAN / ALIF-ZAY - BERHARAKAT):
    1. HEADER (KOP) SAMA SEPERTI DI ATAS (Ma'had Al-Ghozali).

    2. ISI SOAL (Gunakan penomoran Abjadiyah Arab: أ، ب، ج، د، هـ، و، ز):
       أ. Bagian Alif (أ): Al-Mufradat / Kosakata (أَكْمِلِ الْفَرَاغَ / هَاتِ مُفْرَدَاتِ...).
       ب. Bagian Ba (ب): At-Tarakib / Membuat Kalimat (كَوِّنْ جُمَلًا...).
       ج. Bagian Jim (ج): Al-Qira'ah / Pemahaman Teks (أَجِبْ عَنِ الْأَسْئِلَةِ...).
       د. Bagian Dal (د): At-Tarjamah / Menerjemahkan (تَرْجِمْ...).
       هـ. Bagian Ha (هـ): Al-Qawaid / I'rab / Tashrif (أَعْرِبْ / صَرِّفْ...).
       و. Bagian Waw (و): Al-Insya / Pendapat Singkat (اُكْتُبْ رَأْيَكَ...).
       ز. Bagian Zay (ز): Al-Mahfudzot / Hafalan (أَكْمِلِ الْمَحْفُوْظَاتِ...).
        `;
    }

    let prompt = `Bertindaklah sebagai Musyrif/Ustadz ahli kurikulum pesantren salaf & modern.
    Buatkan **Naskah Ujian Pesantren (Imtihan Tahriri)**.
    
    Detail:
    - Jenjang: ${formData.jenjang}
    - Kelas: ${formData.kelas}
    - Mata Pelajaran: ${formData.mapel}
    - Topik Utama: ${formData.topik}
    
    ${harakatInstruction}
    
    Output WAJIB format HTML dengan 'dir="rtl"' (Right-to-Left) untuk bagian Arab.
    
    ${structurePrompt}
    
    Pastikan soal relevan, menantang, dan sesuai kaidah Bahasa Arab Fusha.
    `;

    try {
      const result = await generateTextContentStream(
          prompt,
          (chunk) => setStreamLog(prev => prev + chunk),
          "Anda adalah Ustadz senior yang sangat teliti dalam Nahwu, Shorof, dan Harakat."
      );
      if (result) {
          localStorage.setItem('lastResult', JSON.stringify({
            title: `Soal Pesantren (${formData.mapel}) - ${formData.kelas}`,
            content: result,
            type: 'BANK_SOAL',
            date: new Date().toISOString()
          }));
          navigate('/results');
      }
    } catch (error) {
      alert('Gagal membuat soal pesantren.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <ProgressModal isOpen={loading} logs={streamLog} />

      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-green-600 rounded-xl text-white shadow-lg shadow-green-600/30">
            <Scroll size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white mb-1">Bank Soal Pesantren</h1>
            <p className="text-slate-400">Generator soal khas Ma'had dengan format Arab Pegon/Gondul/Berharakat & Struktur Alif-Zay.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Pesantren */}
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg mb-6">
              <h3 className="text-green-400 font-semibold flex items-center gap-2 mb-2">
                  <BookOpen size={18}/> Mode Kitab / Ma'had
              </h3>
              <p className="text-slate-300 text-sm">
                  Modul ini khusus menghasilkan soal dengan format <strong>RTL (Kanan-ke-Kiri)</strong>, Kop Surat Bahasa Arab, dan struktur 7 Bagian (Mufradat s/d Mahfudzot).
                  Semua output otomatis diberi <strong>Harakat Lengkap</strong>.
              </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <Select label="Tingkat / Marhalah" value={formData.jenjang} onChange={(e) => setFormData({...formData, jenjang: e.target.value})}>
                  <option value="I'dadi (Persiapan)">I'dadi (Persiapan)</option>
                  <option value="Ula (Awal)">Ula (Awal)</option>
                  <option value="Wustha (Menengah)">Wustha (Menengah)</option>
                  <option value="Ulya (Atas)">Ulya (Atas)</option>
              </Select>
              <Input 
                  label="Kelas / Fashl" 
                  placeholder="Contoh: 1 Int, 3B" 
                  value={formData.kelas}
                  onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                  required
              />
          </div>
          
          <DataListInput 
            label="Mata Pelajaran (Maddah)"
            placeholder="Contoh: Nahwu, Fiqih, Insya"
            value={formData.mapel}
            onChange={(val) => setFormData({...formData, mapel: val})}
            options={SUBJECTS.filter(s => s.match(/[\u0600-\u06FF]/))} // Filter subject yang ada arabnya
            required
          />

          <Input 
            label="Topik / Materi (Maudhu')" 
            placeholder="Materi yang diujikan..."
            value={formData.topik}
            onChange={(e) => setFormData({...formData, topik: e.target.value})}
            required
          />

          <div className="grid grid-cols-2 gap-4">
             <Select label="Bahasa Pengantar Soal" value={formData.bahasa} onChange={(e) => setFormData({...formData, bahasa: e.target.value})}>
                <option value="Bahasa Arab">Bahasa Arab (Full)</option>
                <option value="Arab & Indonesia">Campuran (Arab & Indo)</option>
                <option value="Arab Pegon">Arab Pegon (Jawa/Sunda)</option>
             </Select>
             
             <Select label="Tingkat Kesulitan" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                  <option>Sedang (Mutawasith)</option>
                  <option>Sulit (HOTS / 'Ali)</option>
              </Select>
          </div>

          <Button type="submit" className="w-full h-14 shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 text-lg font-semibold" disabled={loading}>
             Buat Soal Pesantren (Imtihan)
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PesantrenBankGenerator;
