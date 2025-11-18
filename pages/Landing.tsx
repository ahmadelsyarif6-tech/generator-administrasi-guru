import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Select, Loader, DataListInput } from '../components/UI';
import { Cpu, Layers, ShieldCheck } from 'lucide-react';
import { TEACHERS } from '../utils/data';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<'guru' | 'admin'>('guru');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        if (!name) throw new Error("Nama wajib diisi");
        await register(name, role);
        navigate('/');
      } else {
        if (!name) throw new Error("Nama wajib diisi");
        const success = await login(name);
        if (success) {
          navigate('/');
        } else {
          setError('Nama tidak ditemukan. Jika nama Anda tidak ada di daftar guru, silakan pilih menu "Daftar Baru".');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const openLogin = () => {
    setAuthMode('login');
    setError('');
    setName('');
    setModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setError('');
    setName('');
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
           <span className="text-xl font-bold">GenGuru</span>
        </div>
        <div className="flex gap-4">
            <button onClick={openLogin} className="text-slate-300 hover:text-white font-medium transition-colors">Masuk</button>
            <Button onClick={openRegister} variant="primary">Daftar Baru</Button>
        </div>
      </nav>

      <header className="container mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Generator <span className="text-yellow-500">Administrasi Guru</span> & Bank Soal Adaptif
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Platform berbasis web yang dirancang untuk membantu guru dan tenaga pendidik di Indonesia, khususnya YPI Pondok Modern Al-Ghozali. Otomatisasi Kurikulum Merdeka dengan kecerdasan buatan.
            </p>
            <div className="flex flex-wrap gap-4">
                <Button onClick={openLogin} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 shadow-yellow-500/20 h-12 px-8 text-lg">
                    Mulai Sekarang
                </Button>
                <Button variant="outline" className="h-12 px-8 text-lg">Pelajari Lebih Lanjut</Button>
            </div>
        </div>
        <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-green-500 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
            <img 
                src="/logo.png" 
                onError={(e) => {e.currentTarget.src = 'https://placehold.co/400x400/0f172a/10b981?text=Logo+YPI+Al-Ghozali';}}
                alt="Logo YPI Al-Ghozali" 
                className="relative z-10 w-auto h-[300px] md:h-[400px] object-contain drop-shadow-2xl mx-auto hover:scale-105 transition-transform duration-500"
            />
        </div>
      </header>

      <section className="bg-slate-800/50 py-20 border-t border-slate-800">
          <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      { icon: Cpu, title: "AI Powered", desc: "Menggunakan Gemini 2.5 Flash untuk generasi konten yang cepat dan akurat." },
                      { icon: Layers, title: "Kurikulum Merdeka", desc: "Template yang selalu diperbarui sesuai standar Kemendikbud terbaru." },
                      { icon: ShieldCheck, title: "Aman & Terpusat", desc: "Data tersimpan aman dengan manajemen akses berbasis peran." }
                  ].map((feature, i) => (
                      <div key={i} className="bg-slate-900 p-8 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors group">
                          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                              <feature.icon size={24} />
                          </div>
                          <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                          <p className="text-slate-400">{feature.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Authentication Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title={authMode === 'login' ? 'Masuk' : 'Daftar Pengguna Baru'}
      >
        <div className="mb-4 text-sm text-slate-400 bg-slate-800/50 p-3 rounded border border-slate-700">
            {authMode === 'login' 
                ? "Guru yang namanya sudah ada di daftar sekolah bisa langsung masuk." 
                : "Menu ini KHUSUS untuk Admin atau Guru Baru yang namanya BELUM ada di daftar."
            }
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
            <DataListInput 
                label={authMode === 'login' ? "Cari Nama Anda" : "Nama Lengkap Baru"} 
                placeholder={authMode === 'login' ? "Ketik nama anda..." : "Masukkan nama lengkap..."}
                value={name}
                onChange={setName}
                options={TEACHERS}
                required
            />
            
            {authMode === 'register' && (
                 <Select label="Peran" value={role} onChange={(e) => setRole(e.target.value as any)}>
                    <option value="guru">Guru / Pendidik</option>
                    <option value="admin">Administrator</option>
                 </Select>
            )}

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader /> : (authMode === 'login' ? 'Masuk' : 'Daftar & Masuk')}
            </Button>

            <div className="text-center mt-4 text-sm text-slate-400">
                {authMode === 'login' ? (
                    <>
                        Nama tidak ada di daftar? <button type="button" onClick={() => setAuthMode('register')} className="text-indigo-400 hover:text-indigo-300 font-medium">Daftar Baru</button>
                    </>
                ) : (
                    <>
                        Sudah terdaftar? <button type="button" onClick={() => setAuthMode('login')} className="text-indigo-400 hover:text-indigo-300 font-medium">Masuk disini</button>
                    </>
                )}
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Landing;