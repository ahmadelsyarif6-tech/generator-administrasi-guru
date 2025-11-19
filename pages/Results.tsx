
import React, { useEffect, useState } from 'react';
import { GeneratedResult } from '../types';
import { Card, Button } from '../components/UI';
import { Download, Play, Save, Trash2, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { textToSpeech } from '../services/geminiService';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<GeneratedResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastResult');
    if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData(parsed);
          setContent(parsed.content);
        } catch (e) {
          console.error("Failed to load result", e);
          navigate('/dashboard');
        }
    } else {
        navigate('/dashboard');
    }
  }, [navigate]);

  const handleDownload = () => {
      // CSS yang sangat spesifik untuk Microsoft Word dan Cetak A4
      const cssStyles = `
        @page {
            size: A4;
            margin: 2.54cm 2.54cm 2.54cm 2.54cm; /* Margin Standar Word */
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            background: #fff;
        }
        h1, h2, h3 { text-align: center; margin-bottom: 1em; }
        
        /* TABEL SUPER RAPI */
        table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            margin-bottom: 1em;
            table-layout: fixed; /* Memaksa tabel patuh pada lebar halaman */
        }
        th, td {
            border: 1px solid #000; /* Border Hitam Tegas */
            padding: 6px 8px;
            vertical-align: top;
            word-wrap: break-word; /* Mencegah teks panjang menabrak margin */
            overflow-wrap: break-word;
        }
        th {
            background-color: #f0f0f0; /* Abu-abu tipis untuk header agar jelas */
            font-weight: bold;
            text-align: center;
        }
        
        /* SUPERSCRIPT / SUBSCRIPT */
        sup { vertical-align: super; font-size: smaller; }
        sub { vertical-align: sub; font-size: smaller; }

        /* RTL Support */
        .rtl, [dir="rtl"] {
            direction: rtl;
            text-align: right;
            font-family: 'Traditional Arabic', 'Amiri', serif;
            font-size: 14pt;
        }
        
        /* Utilities */
        hr { border: 0; border-top: 2px solid #000; margin: 20px 0; }
        img { max-width: 100%; height: auto; }
      `;

      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${data?.title}</title>
            <style>${cssStyles}</style>
        </head>
        <body>
      `;
      
      const footer = "</body></html>";
      
      // Wrap content in a div container specifically for Word width constraint
      const processedContent = `<div style="width:100%; max-width:100%;">${content}</div>`;
      
      const sourceHTML = header + processedContent + footer;

      const blob = new Blob(['\ufeff', sourceHTML], {
          type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data?.title || 'Dokumen'}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleSave = () => {
      if (!data) return;
      
      const historyItem = {
          ...data,
          content: content,
          id: crypto.randomUUID(),
          createdAt: new Date()
      };

      const existingHistory = localStorage.getItem('documentHistory');
      let history = [];
      try {
          history = existingHistory ? JSON.parse(existingHistory) : [];
      } catch (e) {
          history = [];
      }
      
      const newHistory = [historyItem, ...history];
      localStorage.setItem('documentHistory', JSON.stringify(newHistory));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  };

  const handleTTS = async () => {
      if (isPlaying) return;
      setIsPlaying(true);
      try {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          const text = tempDiv.textContent || "";
          const shortText = text.substring(0, 500);

          const audioBuffer = await textToSpeech(shortText);
          if (audioBuffer) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const buffer = await audioContext.decodeAudioData(audioBuffer);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            source.onended = () => setIsPlaying(false);
          } else {
             setIsPlaying(false); 
          }
      } catch (e) {
          console.error(e);
          setIsPlaying(false);
      }
  };

  if (!data) return null;

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white">
                <ArrowLeft size={20} /> Kembali
            </button>
            <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Selesai Edit' : 'Edit Konten'}
                </Button>
                <Button variant="secondary" onClick={handleTTS} disabled={isPlaying}>
                    <Play size={18} className={isPlaying ? "animate-pulse text-green-400" : ""} /> 
                    {isPlaying ? 'Membaca...' : 'Dengarkan'}
                </Button>
                <Button variant="secondary" onClick={handleSave} className={saved ? "bg-green-600 text-white hover:bg-green-700" : ""}>
                    {saved ? <Check size={18} /> : <Save size={18} />} 
                    {saved ? 'Tersimpan' : 'Simpan'}
                </Button>
                <Button onClick={handleDownload}>
                    <Download size={18} /> Download Word (Rapi)
                </Button>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
                <Card className="min-h-[500px] bg-white text-slate-900 overflow-hidden">
                    {isEditing ? (
                        <textarea 
                            className="w-full h-[600px] p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    ) : (
                        /* Preview Container with specific padding to mimic A4 */
                        <div 
                            className="prose max-w-none p-8 md:p-12 bg-white shadow-sm"
                            style={{ minHeight: '29.7cm' }}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    )}
                </Card>
            </div>
        </div>
    </div>
  );
};

export default Results;
