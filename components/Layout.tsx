
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, FileText, BookOpen, Video, 
  Image, Mic, LogOut, User, Menu, Settings, ScrollText
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active }: any) => (
  <Link to={path}>
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Administrasi Guru', path: '/generator/administrasi' },
    { icon: BookOpen, label: 'Bank Soal Umum', path: '/generator/bank-soal' },
    { icon: ScrollText, label: 'Bank Soal Pesantren', path: '/generator/bank-soal-pesantren' },
    { icon: Video, label: 'E-Course', path: '/generator/ecourse' },
    { icon: Mic, label: 'Lab Audio', path: '/lab/audio' },
    { icon: Video, label: 'Lab Video', path: '/lab/video' },
    { icon: Image, label: 'Studio Gambar', path: '/lab/image' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ icon: Settings, label: 'Panel Admin', path: '/admin' });
  }

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-bold text-white">G</span>
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-tight">GenGuru</h1>
                <p className="text-xs text-slate-500">Al-Ghozali Toolset</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.path} 
                {...item} 
                active={location.pathname === item.path}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
                </div>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors text-sm">
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
            <Menu />
          </button>
          <div className="flex items-center gap-4 ml-auto">
             {/* Header extras if needed */}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
