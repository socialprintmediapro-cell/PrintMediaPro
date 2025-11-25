import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, User as UserIcon } from 'lucide-react';
import { ChatMessage, User, ROLE_LABELS } from '../types';

interface ChatWidgetProps {
  currentUser: User;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser, messages, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-40"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">Рабочий чат</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        <div className="text-center text-xs text-slate-400 my-2">
            Сегодня
        </div>
        
        {messages.map((msg) => {
            const isMe = msg.userId === currentUser.id;
            return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {!isMe && (
                           <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                               {msg.userName.charAt(0)}
                           </div>
                        )}
                        <span className="text-[10px] text-slate-500">
                            {isMe ? 'Вы' : msg.userName} • {ROLE_LABELS[msg.userRole]}
                        </span>
                    </div>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                        isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                        {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Написать сообщение..."
                className="w-full pl-4 pr-12 py-2.5 bg-slate-100 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
            />
            <button 
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
      </form>
    </div>
  );
};