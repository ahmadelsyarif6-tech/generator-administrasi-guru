
import React, { useState } from 'react';
import { Card, Button, Loader } from '../../components/UI';
import { generateVideo } from '../../services/geminiService';
import { Video } from 'lucide-react';

const VideoLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
      if(!prompt) return;
      setLoading(true);
      setVideoUrl(undefined);
      try {
         const url = await generateVideo(prompt);
         setVideoUrl(url);
      } catch (e) {
         alert("Gagal membuat video. Pastikan API Key mendukung model Veo.");
      } finally {
         setLoading(false);
      }
  }

  return (
    <div className="max-w-3xl mx-auto">
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Lab Video (Veo)</h1>
            <p className="text-slate-400">Buat video pendek dari teks untuk materi pembelajaran visual.</p>
        </div>

        <Card className="mb-8">
            <div className="flex gap-4">
                <input 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: Animasi sel darah merah mengalir di pembuluh darah..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                />
                <Button onClick={handleGenerate} disabled={loading}>
                    {loading ? 'Generating...' : 'Buat Video'}
                </Button>
            </div>
        </Card>

        <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800 relative">
             {loading ? (
                 <div className="text-center">
                     <Loader />
                     <p className="text-slate-400 mt-4">Veo sedang merender video (bisa memakan waktu 1-2 menit)...</p>
                 </div>
             ) : videoUrl ? (
                 <video controls className="w-full h-full" src={videoUrl} autoPlay loop />
             ) : (
                 <div className="text-slate-600 flex flex-col items-center">
                     <Video size={64} className="mb-4 opacity-50" />
                     <p>Preview video akan tampil di sini</p>
                 </div>
             )}
        </div>
    </div>
  );
};

export default VideoLab;
