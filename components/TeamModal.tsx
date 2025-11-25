import React, { useState } from 'react';
import { X, User as UserIcon, Shield, Briefcase, Printer, Palette, Lock, AlertCircle } from 'lucide-react';
import { User, UserRole, ROLE_LABELS } from '../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

// Security Configuration
const ROLE_PINS: Record<UserRole, string> = {
  [UserRole.DIRECTOR]: '9999',
  [UserRole.MANAGER]: '1234',
  [UserRole.DESIGNER]: '2024',
  [UserRole.PRINTER]: '1111',
};

// Mock active team members
const TEAM_MEMBERS = [
  { id: 'u1', name: 'Иван Петров', role: UserRole.DIRECTOR },
  { id: 'u2', name: 'Анна Сидорова', role: UserRole.MANAGER },
  { id: 'u3', name: 'Дмитрий Волков', role: UserRole.PRINTER },
  { id: 'u4', name: 'Мария Козлова', role: UserRole.DESIGNER },
];

const RoleIcon = ({ role }: { role: UserRole }) => {
  switch (role) {
    case UserRole.DIRECTOR: return <Shield className="w-4 h-4 text-purple-600" />;
    case UserRole.MANAGER: return <Briefcase className="w-4 h-4 text-blue-600" />;
    case UserRole.PRINTER: return <Printer className="w-4 h-4 text-orange-600" />;
    case UserRole.DESIGNER: return <Palette className="w-4 h-4 text-pink-600" />;
    default: return <UserIcon className="w-4 h-4 text-slate-600" />;
  }
};

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    setError('');
    
    // Check PIN for the SELECTED role
    const requiredPin = ROLE_PINS[role];
    
    if (pin !== requiredPin) {
      setError('Неверный пароль для выбранной роли');
      return;
    }

    onUpdateUser({ ...currentUser, name, role });
    setPin(''); // Reset pin
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-50" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <UserIcon className="w-5 h-5" />
                 Личный кабинет / Вход
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-800 mb-4 font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Настройка профиля
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Ваше имя</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                            placeholder="Введите ФИО"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Роль в системе</label>
                        <div className="relative">
                          <select 
                              value={role}
                              onChange={(e) => {
                                setRole(e.target.value as UserRole);
                                setError('');
                              }}
                              className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 appearance-none"
                          >
                              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                                  <option key={key} value={key}>{label}</option>
                              ))}
                          </select>
                          <div className="absolute right-3 top-2.5 pointer-events-none">
                             <Briefcase className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                           <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Пароль роли</span>
                        </label>
                        <input 
                            type="password" 
                            value={pin}
                            maxLength={4}
                            onChange={(e) => {
                              setPin(e.target.value);
                              setError('');
                            }}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none bg-white text-slate-900 tracking-widest font-mono ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                            placeholder="••••"
                        />
                        {error && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-red-600 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            {error}
                          </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSave}
                        className="w-full mt-2 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-95 transform duration-150"
                    >
                        Подтвердить вход
                    </button>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Состав команды</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {TEAM_MEMBERS.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <RoleIcon role={member.role} />
                                        {ROLE_LABELS[member.role]}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 font-medium">В сети</span>
                        </div>
                    ))}
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};