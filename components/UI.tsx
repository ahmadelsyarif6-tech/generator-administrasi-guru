
import React, { useEffect, useRef } from 'react';
import { X, ChevronDown, Terminal, Cpu } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100",
    outline: "border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1 mb-4">
    {label && <label className="text-sm text-slate-400">{label}</label>}
    <input 
      dir="auto"
      className={`bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full ${className}`}
      {...props}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...props }) => (
  <div className="flex flex-col gap-1 mb-4">
    {label && <label className="text-sm text-slate-400">{label}</label>}
    <div className="relative">
        <select 
          className={`bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full appearance-none ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
            <ChevronDown size={16} />
        </div>
    </div>
  </div>
);

export const DataListInput: React.FC<{ 
    label?: string; 
    value: string; 
    onChange: (value: string) => void; 
    options: string[]; 
    placeholder?: string;
    required?: boolean;
}> = ({ label, value, onChange, options, placeholder, required }) => {
    const id = React.useId();
    return (
        <div className="flex flex-col gap-1 mb-4">
            {label && <label htmlFor={id} className="text-sm text-slate-400">{label}</label>}
            <input
                id={id}
                list={`${id}-list`}
                dir="auto"
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
            <datalist id={`${id}-list`}>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt} />
                ))}
            </datalist>
        </div>
    );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm ${className}`}>
    {title && <h3 className="text-lg font-semibold text-slate-100 mb-4">{title}</h3>}
    {children}
  </div>
);

export const Loader: React.FC = () => (
    <div className="flex items-center justify-center space-x-2 animate-pulse">
        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
    </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ProgressModal: React.FC<{ 
    isOpen: boolean; 
    logs: string; 
}> = ({ isOpen, logs }) => {
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg animate-pulse">
                            <Cpu className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">AI Sedang Bekerja...</h3>
                            <p className="text-sm text-indigo-300">Menghubungkan ke Gemini 2.5 Flash</p>
                        </div>
                    </div>
                </div>

                {/* Visualization Area */}
                <div className="bg-black/50 p-6 font-mono text-sm md:text-base text-green-400 overflow-y-auto flex-1 min-h-[300px]" ref={logRef}>
                     <div className="flex items-center gap-2 text-slate-500 mb-4">
                        <Terminal size={16} />
                        <span>System Output Stream</span>
                     </div>
                     <div className="whitespace-pre-wrap leading-relaxed">
                        {logs || "Menginisialisasi permintaan..."}
                        <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-blink"></span>
                     </div>
                </div>

                {/* Footer Status */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 text-center">
                    <p className="text-slate-400 text-sm">Mohon tunggu sebentar, dokumen sedang disusun secara real-time.</p>
                </div>
            </div>
        </div>
    );
};
