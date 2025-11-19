
import React from 'react';
import { Card, Button } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Database, FileBarChart, Download, Trash2 } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { user, registeredUsers, deleteUser } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
        deleteUser(id);
    }
  };

  // Calculate real stats
  const totalTeachers = registeredUsers.filter(u => u.role === 'guru').length;
  // In a real app, we would pull document counts from a database
  const documentCount = 0; // Placeholder based on local storage limitations for global stats

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Panel Admin</h1>
            <div className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/50 rounded-lg text-indigo-200 text-sm">
                Admin: {user?.name}
            </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="flex flex-col items-center justify-center p-8 bg-indigo-900/20 border-indigo-500/30">
                <Users size={32} className="text-indigo-400 mb-2" />
                <h3 className="text-2xl font-bold text-white">{totalTeachers}</h3>
                <p className="text-slate-400">Guru Terdaftar</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-8 bg-green-900/20 border-green-500/30">
                <FileBarChart size={32} className="text-green-400 mb-2" />
                <h3 className="text-2xl font-bold text-white">{registeredUsers.length}</h3>
                <p className="text-slate-400">Total Pengguna</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-8 bg-purple-900/20 border-purple-500/30">
                <Database size={32} className="text-purple-400 mb-2" />
                <h3 className="text-2xl font-bold text-white">Lokal</h3>
                <p className="text-slate-400">Penyimpanan</p>
            </Card>
        </div>

        <div className="grid md:grid-cols-1 gap-6">
            <Card title="Manajemen Pengguna (CRUD)">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-200 uppercase bg-slate-700/50">
                            <tr>
                                <th className="px-4 py-3">Nama Lengkap</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Peran</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registeredUsers.length > 0 ? (
                                registeredUsers.map(u => (
                                    <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/20">
                                        <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                                        <td className="px-4 py-3">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs capitalize ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {u.id !== user.id && (
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/30 transition-colors"
                                                    title="Hapus User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Belum ada data pengguna.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default AdminPanel;
