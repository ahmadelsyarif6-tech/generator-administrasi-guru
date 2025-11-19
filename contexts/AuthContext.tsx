
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { TEACHERS } from '../utils/data';

interface AuthContextType {
  user: User | null;
  login: (name: string) => Promise<boolean>;
  register: (name: string, role: 'admin' | 'guru') => Promise<void>;
  deleteUser: (id: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  registeredUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load all registered users with error handling
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      try {
        setRegisteredUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error("Failed to parse registered users", e);
        localStorage.removeItem('registeredUsers');
      }
    }

    // Check persistent session with error handling
    const storedSession = localStorage.getItem('currentUser');
    if (storedSession) {
      try {
        setUser(JSON.parse(storedSession));
      } catch (e) {
        console.error("Failed to parse session", e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const register = async (name: string, role: 'admin' | 'guru') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if name is in the official TEACHERS list
    const isOfficialTeacher = TEACHERS.some(t => t.toLowerCase() === name.trim().toLowerCase());
    
    if (isOfficialTeacher) {
        throw new Error("Nama Anda sudah ada di database sekolah. Silakan langsung pilih menu 'Masuk'.");
    }

    // Check if already registered manually
    const existingUser = registeredUsers.find(u => u.name.toLowerCase() === name.trim().toLowerCase());
    if (existingUser) {
        throw new Error("Nama ini sudah terdaftar sebelumnya. Silakan Login.");
    }

    // Generate a dummy email for internal consistency
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const email = `${cleanName}@sekolah.id`;

    const newUser: User = {
      id: crypto.randomUUID(),
      name: name,
      email: email,
      role: role,
    };

    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // Auto login after register
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const login = async (name: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const cleanInputName = name.trim().toLowerCase();

    // 1. Check Local Storage users (Manually registered users)
    let foundUser = registeredUsers.find(u => u.name.toLowerCase() === cleanInputName);

    // 2. If not in local storage, check the static TEACHERS list (Auto-Login for Official Teachers)
    if (!foundUser) {
        const officialName = TEACHERS.find(t => t.toLowerCase() === cleanInputName);
        
        if (officialName) {
            // Create a user object for the official teacher on the fly
            const newUser: User = {
                id: crypto.randomUUID(),
                name: officialName, // Use the official spelling
                email: `${officialName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@alghozali.id`,
                role: 'guru' // Default role for list teachers
            };
            
            // Persist this new "session user" so they show up in admin lists next time
            // This satisfies: "bila sudah mendaftar guru yang tidak ada namanya secara otomatis tersimpan" logic 
            // by treating official teachers as implicitly registered when they first login.
            const updatedUsers = [...registeredUsers, newUser];
            setRegisteredUsers(updatedUsers);
            localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
            
            foundUser = newUser;
        }
    }
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const deleteUser = (id: string) => {
    const updatedUsers = registeredUsers.filter(u => u.id !== id);
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, deleteUser, logout, isAuthenticated: !!user, registeredUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
