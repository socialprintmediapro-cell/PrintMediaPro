import React, { useState } from 'react';
import { X, Smartphone, Wifi, Globe, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');

  // Using a public API to generate QR code for the current URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-50" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full">
          <div className="bg-slate-900 px-4 py-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              Открыть на телефоне
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 bg-white">
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm mb-4">
                    <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
                </div>
                <p className="text-sm font-medium text-slate-500 text-center max-w-[200px]">
                    Наведите камеру телефона, чтобы открыть приложение
                </p>
            </div>

            <div className="space-y-4">
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${isLocalhost ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                    <div className={`p-1.5 rounded-full mt-0.5 ${isLocalhost ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {isLocalhost ? <Wifi className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold ${isLocalhost ? 'text-orange-800' : 'text-green-800'}`}>
                            {isLocalhost ? 'Режим локальной сети' : 'Доступен через Интернет'}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {isLocalhost 
                                ? 'Внимание: Ссылка работает только если телефон подключен к тому же Wi-Fi, что и компьютер.' 
                                : 'Приложение опубликовано. Ссылка работает везде.'}
                        </p>
                    </div>
                </div>

                {/* Copy Link Section */}
                <div className="relative">
                    <input 
                        type="text" 
                        readOnly 
                        value={currentUrl} 
                        className="w-full pl-3 pr-10 py-2.5 text-xs text-slate-500 bg-slate-100 rounded-lg border border-transparent focus:bg-white focus:border-blue-300 outline-none transition-all"
                    />
                    <button 
                        onClick={handleCopy}
                        className="absolute right-1 top-1 p-1.5 bg-white shadow-sm border border-slate-200 rounded-md hover:text-blue-600 transition-colors"
                        title="Копировать"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};