
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, BookOpen, Video, Image, Mic, Activity, Bell, ExternalLink, Clock, Trash2, File, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ScrollText } from 'lucide-react';
import { Card } from '../components/UI';
import { GeneratedResult } from '../types';

const CalendarWidget: React.FC<{ deadlines: GeneratedResult[] }> = ({ deadlines }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (increment: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    // Check for deadlines on a specific day
    const getDeadlinesForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return deadlines.filter(d => d.deadline === dateStr);
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:text-white text-slate-400"><ChevronLeft size={20} /></button>
                <h3 className="font-semibold text-white">{monthName}</h3>
                <button onClick={() => changeMonth(1)} className="p-1 hover:text-white text-slate-400"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                    <div key={d} className="text-xs text-slate-500 font-medium">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(b => <div key={`blank-${b}`} className="h-8"></div>)}
                {days.map(day => {
                    const dayDeadlines = getDeadlinesForDay(day);
                    const hasDeadline = dayDeadlines.length > 0;
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                    
                    return (
                        <div key={day} className={`h-8 flex flex-col items-center justify-center rounded-lg text-sm relative group ${isToday ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
                            {day}
                            {hasDeadline && (
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute bottom-1"></div>
                            )}
                            {hasDeadline && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black text-white text-xs p-2 rounded shadow-lg hidden group-hover:block z-10">
                                    {dayDeadlines.map((d, i) => (
                                        <div key={i} className="truncate">{d.title}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Upcoming List */}
            <div className="mt-4 border-t border-slate-700 pt-3">
                <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">Tenggat Terdekat</h4>
                <div className="space-y-2 max-h-[100px] overflow-y-auto">
                    {deadlines.filter(d => d.deadline && new Date(d.deadline) >= new Date()).sort((a,b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/50 p-2 rounded">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="flex-1 truncate">{item.title}</span>
                            <span className="text-slate-500">{new Date(item.deadline!).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</span>
                        </div>
                    ))}
                    {deadlines.filter(d => d.deadline && new Date(d.deadline) >= new Date()).length === 0 && (
                        <p className="text-xs text-slate-500 text-center">Tidak ada tenggat waktu dekat.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<GeneratedResult[]>([]);

  useEffect(() => {
    const loadHistory = () => {
        const stored = localStorage.getItem('documentHistory');
        if (stored) {
            try {
              setHistory(JSON.parse(stored));
            } catch (e) {
              console.error("Failed to load history", e);
              localStorage.removeItem('documentHistory');
            }
        }
    };
    loadHistory();
  }, []);

  const deleteHistoryItem = (index: number) => {
      if (confirm("Hapus dokumen ini dari riwayat?")) {
          const newHistory = [...history];
          newHistory.splice(index, 1);
          setHistory(newHistory);
          localStorage.setItem('documentHistory', JSON.stringify(newHistory));
      }
  };

  const openHistoryItem = (item: GeneratedResult) => {
      localStorage.setItem('lastResult', JSON.stringify(item));
      navigate('/results');
  };

  const modules = [
    { title: 'Administrasi Guru', icon: FileText, desc: 'Modul ajar, Prota, Promes, ATP otomatis.', path: '/generator/administrasi', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Bank Soal Umum', icon: BookOpen, desc: 'Kurikulum Merdeka, HOTS, PG, Essay.', path: '/generator/bank-soal', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Bank Soal Pesantren', icon: ScrollText, desc: 'Format Arab Pegon, RTL, Alif-Zay.', path: '/generator/bank-soal-pesantren', color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Generator E-Course', icon: Video, desc: 'Silabus, Materi Slide, Rencana Pembelajaran.', path: '/generator/ecourse', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const aiLabs = [
    { title: 'Lab Audio', icon: Mic, path: '/lab/audio' },
    { title: 'Lab Video', icon: Video, path: '/lab/video' },
    { title: 'Studio Gambar', icon: Image, path: '/lab/image' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang, {user?.name}</h2>
            <p className="text-slate-400">Mulai produktivitas Anda dengan asisten AI Al-Ghozali.</p>
          </div>
          <div className="flex gap-2">
              <button className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800"></span>
              </button>
          </div>
      </div>

      {/* Generator Modules Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {modules.map((mod) => (
            <Link to={mod.path} key={mod.title} className="group">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/10 h-full">
                    <div className={`w-12 h-12 rounded-lg ${mod.bg} ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <mod.icon size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{mod.title}</h3>
                    <p className="text-slate-400 text-sm">{mod.desc}</p>
                </div>
            </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column: History and Calendar */}
          <div className="space-y-6">
               {/* Calendar Widget */}
              <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white flex items-center gap-2"><CalendarIcon size={18} className="text-indigo-400"/> Kalender Akademik</h3>
              </div>
              <CalendarWidget deadlines={history.filter(h => h.deadline)} />

              {/* History Section */}
              <Card title="Riwayat Dokumen" className="h-[300px] flex flex-col">
                  <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                      {history.length === 0 ? (
                          <p className="text-slate-500 text-sm text-center py-8">Belum ada riwayat dokumen.</p>
                      ) : (
                          history.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors border border-slate-700/50">
                                  <div className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1" onClick={() => openHistoryItem(item)}>
                                      <div className="w-8 h-8 rounded bg-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0">
                                          <File size={16} />
                                      </div>
                                      <div className="min-w-0">
                                          <h4 className="text-sm font-medium text-slate-200 truncate">{item.title}</h4>
                                          <div className="flex items-center gap-2 text-xs text-slate-500">
                                              <span className="flex items-center gap-1">
                                                  <Clock size={10} />
                                                  {new Date(item.createdAt).toLocaleDateString()}
                                              </span>
                                              {item.deadline && (
                                                  <span className="text-red-400 bg-red-900/20 px-1.5 rounded">
                                                      Due: {new Date(item.deadline).toLocaleDateString('id-ID', {day: 'numeric', month: 'numeric'})}
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                                  <button onClick={() => deleteHistoryItem(index)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </Card>
          </div>

          {/* Right Column: External Resources & Admin */}
          <div className="md:col-span-2 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card title="Laboratorium AI">
                        <div className="grid grid-cols-3 gap-4">
                            {aiLabs.map((lab) => (
                                <Link key={lab.title} to={lab.path} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors text-center flex flex-col items-center gap-2">
                                    <lab.icon className="text-indigo-400" size={24} />
                                    <span className="text-xs font-medium">{lab.title}</span>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30 flex gap-3 items-start">
                            <Activity className="text-indigo-400 mt-1" size={16} />
                            <div>
                                <h4 className="font-semibold text-indigo-300 text-xs">Status AI</h4>
                                <p className="text-xs text-indigo-200/70">Siap digunakan.</p>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        {user?.role === 'admin' && (
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 shadow-lg text-white">
                                <h3 className="font-bold text-lg mb-2">Ruang Admin</h3>
                                <p className="text-indigo-100 text-sm mb-4">Kelola pengguna dan sistem.</p>
                                <Link to="/admin" className="inline-block w-full text-center bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Masuk Panel
                                </Link>
                            </div>
                        )}
                        
                        <Card title="Sumber Belajar">
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="flex items-center justify-between text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                                        <span>Perpustakaan Kemendikbud</span>
                                        <ExternalLink size={14} />
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center justify-between text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                                        <span>Al-Qur'an Kemenag</span>
                                        <ExternalLink size={14} />
                                    </a>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
