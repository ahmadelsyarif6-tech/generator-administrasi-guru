
import React, { useState } from 'react';
import { Card, Input, Button, Loader } from '../../components/UI';
import { generateImage, editImage } from '../../services/geminiService';
import { Image as ImageIcon, Wand2, Eraser } from 'lucide-react';

const ImageLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');

  const handleGenerate = async () => {
      if(!prompt) return;
      setLoading(true);
      try {
          if (mode === 'generate' || !image) {
            const res = await generateImage(prompt);
            setImage(res);
          } else {
            const res = await editImage(image, prompt);
            setImage(res);
          }
      } catch (e) {
          alert('Gagal memproses gambar.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto">
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Studio Gambar AI</h1>
            <p className="text-slate-400">Visualisasikan konsep pembelajaran atau buat ilustrasi soal.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <div className="flex gap-2 mb-6 bg-slate-700/50 p-1 rounded-lg">
                        <button 
                            onClick={() => setMode('generate')}
                            className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${mode === 'generate' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Generate
                        </button>
                        <button 
                            onClick={() => setMode('edit')}
                            className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${mode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            disabled={!image}
                        >
                            Edit
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm text-slate-400">Prompt / Deskripsi</label>
                        <textarea 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder={mode === 'generate' ? "Seekor robot sedang belajar matematika..." : "Tambahkan topi pada robot..."}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                        />
                        <Button onClick={handleGenerate} className="w-full" disabled={loading}>
                            {loading ? <Loader /> : (mode === 'generate' ? 'Buat Gambar' : 'Edit Gambar')}
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="md:col-span-2">
                <div className="bg-slate-800 border border-slate-700 rounded-xl min-h-[400px] flex items-center justify-center p-4 relative overflow-hidden">
                    {image ? (
                        <img src={image} alt="Generated" className="max-w-full h-auto rounded shadow-2xl" />
                    ) : (
                        <div className="text-center text-slate-500">
                            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Hasil gambar akan muncul di sini</p>
                        </div>
                    )}
                    {loading && (
                        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center backdrop-blur-sm">
                            <div className="text-center">
                                <Loader />
                                <p className="mt-4 text-indigo-400">Sedang menggambar...</p>
                            </div>
                        </div>
                    )}
                </div>
                {image && (
                    <div className="mt-4 flex justify-end">
                        <a href={image} download="generated-image.png" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2">
                            Download PNG
                        </a>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ImageLab;
