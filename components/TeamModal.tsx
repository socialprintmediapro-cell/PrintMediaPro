import React, { useState } from 'react';
import { X, User as UserIcon, Shield, Briefcase, Printer, Palette } from 'lucide-react';
import { User, UserRole, ROLE_LABELS } from '../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

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

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateUser({ ...currentUser, name, role });
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
                 Личный кабинет / Профиль
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 mb-3 font-medium">Ваш текущий профиль</p>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Ваше имя</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Роль в компании</label>
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                        >
                            {Object.entries(ROLE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Сохранить профиль
                    </button>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Состав команды</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {TEAM_MEMBERS.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{member.name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <RoleIcon role={member.role} />
                                        {ROLE_LABELS[member.role]}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">В сети</span>
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