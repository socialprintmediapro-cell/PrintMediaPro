import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  };

  return (
    <div className={`flex w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-lg border-l-4 ${borderColors[notification.type]} transform transition-all duration-300 animate-slide-in`}>
      <div className="p-4 flex items-start gap-3 w-full">
        <div className="flex-shrink-0 pt-0.5">
            {icons[notification.type]}
        </div>
        <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-900">{notification.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
        </div>
        <button 
          onClick={() => onDismiss(notification.id)} 
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
            <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
