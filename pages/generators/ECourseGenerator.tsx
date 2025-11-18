
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button, Loader } from '../../components/UI';
import { generateTextContent } from '../../services/geminiService';

const ECourseGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [meetings, setMeetings] = useState('4');
  const [target, setTarget] = useState('Siswa SMA');
  const [language, setLanguage] = useState('Bahasa Indonesia');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const prompt = `Buatkan struktur E-Course lengkap untuk topik: "${topic}".
    - Target Audiens: ${target}.
    - Jumlah Pertemuan: ${meetings}.
    - Bahasa Pengantar: ${language}.
    
    Output harus berupa HTML dengan struktur:
    1. Silabus Kursus (Deskripsi, Tujuan).
    2. Rencana Pembelajaran per pertemuan (Tabel).
    3. Materi Detail untuk setiap pertemuan (Gunakan bahasa ${language}).
    4. Konten Slide Presentasi (tandai dengan class="ppt-slide").
    `;

    try {
      const result = await generateTextContent(prompt);
      if (result) {
          localStorage.setItem('lastResult', JSON.stringify({
            title: `E-Course: ${topic}`,
            content: result,
            type: 'ECOURSE',
            date: new Date().toISOString()
          }));
          navigate('/results');
      }
    } catch (error) {
      alert('Error generating course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Generator E-Course</h1>
            <p className="text-slate-400">Rancang kurikulum kursus, materi, dan slide presentasi sekaligus.</p>
        </div>
        <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Topik Kursus" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Misal: Dasar Pemrograman Python" required />
                
                <div className="grid grid-cols-2 gap-6">
                    <Select label="Bahasa Pengantar" value={language} onChange={e => setLanguage(e.target.value)}>
                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                        <option value="Bahasa Arab">Bahasa Arab</option>
                        <option value="Bahasa Inggris">Bahasa Inggris</option>
                        <option value="Bahasa Sunda">Bahasa Sunda</option>
                    </Select>
                    <Select label="Jumlah Pertemuan/Modul" value={meetings} onChange={e => setMeetings(e.target.value)}>
                        <option value="2">2 Pertemuan</option>
                        <option value="4">4 Pertemuan</option>
                        <option value="8">8 Pertemuan</option>
                        <option value="12">12 Pertemuan</option>
                    </Select>
                </div>
                
                <Input label="Target Audiens" value={target} onChange={e => setTarget(e.target.value)} />
                
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader /> Merancang Kursus...</> : 'Generate E-Course'}
                </Button>
            </form>
        </Card>
    </div>
  );
};

export default ECourseGenerator;
