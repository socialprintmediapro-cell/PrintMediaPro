import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Printer, Calendar, User, AlignLeft, Settings2, FileText, Upload, Trash2, Image as ImageIcon, Download } from 'lucide-react';
import { 
  Task, TaskStatus, Priority, Attachment,
  PRIORITY_LABELS, STATUS_LABELS,
  PAPER_WEIGHT_OPTIONS, PAPER_TYPE_OPTIONS, FORMAT_OPTIONS, COLOR_MODE_OPTIONS 
} from '../types';
import { generateTaskDescription, suggestTechSpecs } from '../services/geminiService';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (id: string) => void;
  initialTask?: Task | null;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.NEW);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [deadline, setDeadline] = useState('');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  
  // Technical Params
  const [paperWeight, setPaperWeight] = useState('');
  const [paperType, setPaperType] = useState('');
  const [format, setFormat] = useState('');
  const [colorMode, setColorMode] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setClientName(initialTask.clientName);
        setDescription(initialTask.description);
        setStatus(initialTask.status);
        setPriority(initialTask.priority);
        setDeadline(initialTask.deadline || '');
        setOrderNumber(initialTask.orderNumber || null);
        
        // Load specs
        setPaperWeight(initialTask.paperWeight || '');
        setPaperType(initialTask.paperType || '');
        setFormat(initialTask.format || '');
        setColorMode(initialTask.colorMode || '');
        
        // Attachments
        setAttachments(initialTask.attachments || []);
      } else {
        // Reset for new task
        setTitle('');
        setClientName('');
        setDescription('');
        setStatus(TaskStatus.NEW);
        setPriority(Priority.MEDIUM);
        setDeadline('');
        setOrderNumber(null);
        setPaperWeight('');
        setPaperType('');
        setFormat('');
        setColorMode('');
        setAttachments([]);
      }
      setAiSuggestion('');
    }
  }, [isOpen, initialTask]);

  const handleGenerateDescription = async () => {
    if (!title) return;
    setIsGenerating(true);
    const result = await generateTaskDescription(title, clientName);
    setDescription(prev => prev ? prev + '\n\n' + result : result);
    
    // Also try to get a quick tech spec suggestion
    const specs = await suggestTechSpecs(title);
    if (specs) {
        setAiSuggestion(specs);
    }
    
    setIsGenerating(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 1024 * 1024) { // 1MB limit check
            alert(`Файл ${file.name} слишком большой. Максимум 1МБ.`);
            continue;
        }

        const reader = new FileReader();
        const promise = new Promise<void>((resolve) => {
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    newAttachments.push({
                        id: crypto.randomUUID(),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: ev.target.result as string
                    });
                }
                resolve();
            };
        });
        reader.readAsDataURL(file);
        await promise;
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
      setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // --- PDF GENERATION / PRINTING ---
  const handlePrintPDF = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const getLabel = (options: any[], val: string) => options.find((o: any) => o.value === val)?.label || val;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Заказ #${String(orderNumber || 'NEW').padStart(4, '0')} - TypoFlow Batto</title>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #000; }
                .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
                .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
                .order-id { font-size: 32px; font-weight: bold; }
                .client-box { background: #f0f0f0; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .param-group { margin-bottom: 10px; }
                .label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; display: block;}
                .value { font-size: 16px; font-weight: 500; }
                .desc-box { border: 1px solid #ddd; padding: 20px; min-height: 150px; margin-bottom: 30px; }
                .footer { border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #888; display: flex; justify-content: space-between; }
                .barcode { font-family: 'Courier New', monospace; letter-spacing: 5px; margin-top: 10px; }
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="logo">TypoFlow Batto</div>
                    <div style="margin-top:5px; font-size: 14px; color: #555;">Технологическая карта заказа</div>
                </div>
                <div style="text-align: right;">
                    <div class="order-id">#${String(orderNumber || 'XXX').padStart(4, '0')}</div>
                    <div>${new Date().toLocaleDateString()}</div>
                </div>
            </div>

            <div class="client-box">
                <div class="label">Клиент</div>
                <div class="value" style="font-size: 20px;">${clientName}</div>
                <div class="label" style="margin-top: 8px;">Название работы</div>
                <div class="value">${title}</div>
            </div>

            <div class="grid">
                <div style="border: 1px solid #000; padding: 15px;">
                    <div style="font-weight:bold; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">ПАРАМЕТРЫ БУМАГИ</div>
                    <div class="param-group">
                        <span class="label">Плотность:</span>
                        <span class="value">${paperWeight ? paperWeight + ' г/м²' : '—'}</span>
                    </div>
                    <div class="param-group">
                        <span class="label">Тип материала:</span>
                        <span class="value">${paperType ? getLabel(PAPER_TYPE_OPTIONS, paperType) : '—'}</span>
                    </div>
                </div>
                <div style="border: 1px solid #000; padding: 15px;">
                    <div style="font-weight:bold; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">ПАРАМЕТРЫ ПЕЧАТИ</div>
                    <div class="param-group">
                        <span class="label">Формат:</span>
                        <span class="value">${format ? getLabel(FORMAT_OPTIONS, format) : '—'}</span>
                    </div>
                    <div class="param-group">
                        <span class="label">Цветность:</span>
                        <span class="value">${colorMode ? getLabel(COLOR_MODE_OPTIONS, colorMode) : '—'}</span>
                    </div>
                </div>
            </div>

            <div class="label">Техническое задание / Описание:</div>
            <div class="desc-box">
                ${description ? description.replace(/\n/g, '<br/>') : 'Нет описания'}
            </div>

            <div class="grid" style="margin-top: 40px;">
                <div>
                    <div class="label">Сроки</div>
                    <div class="value">Дедлайн: ${deadline || 'Не указан'}</div>
                    <div class="value">Приоритет: ${PRIORITY_LABELS[priority]}</div>
                </div>
                <div style="text-align: right;">
                    <div class="label">Подпись менеджера</div>
                    <div style="border-bottom: 1px solid #000; width: 200px; height: 30px; margin-left: auto;"></div>
                </div>
            </div>

            <div class="footer">
                <div>Сгенерировано в TypoFlow Batto</div>
                <div class="barcode">||| || ||| | |||| ||| ${orderNumber}</div>
            </div>
            <script>
                window.onload = () => { window.print(); }
            </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: initialTask?.id || crypto.randomUUID(),
      // If it's a new task, orderNumber is undefined here but handled in App.tsx
      orderNumber: orderNumber || 0, 
      title,
      clientName,
      description,
      status,
      priority,
      createdAt: initialTask?.createdAt || Date.now(),
      deadline,
      paperWeight,
      paperType,
      format,
      colorMode,
      attachments
    };
    onSave(newTask);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
        <div className="w-screen max-w-md pointer-events-auto transform transition-transform duration-500 ease-in-out bg-white shadow-2xl flex flex-col h-full">
          
          {/* Header */}
          <div className="px-6 py-6 bg-slate-900 text-white flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                {initialTask ? 'Редактировать заказ' : 'Новый заказ'}
                </h2>
                {initialTask && (
                    <span className="text-xs text-slate-400 font-mono mt-1 block">
                        Заказ #{String(orderNumber).padStart(4, '0')}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {initialTask && (
                    <button 
                        onClick={handlePrintPDF}
                        title="Печать / PDF"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                )}
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors ml-2">
                  <X className="w-6 h-6" />
                </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Название заказа</label>
                    <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Напр., Визитки 1000шт"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white text-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Клиент</label>
                    <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Название компании или имя"
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white text-slate-900"
                    />
                    </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4" />

              {/* Technical Specs Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                   <Settings2 className="w-4 h-4 text-blue-500" />
                   Технические параметры
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Плотность бумаги</label>
                        <select
                            value={paperWeight}
                            onChange={(e) => setPaperWeight(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Не выбрано</option>
                            {PAPER_WEIGHT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Тип бумаги</label>
                        <select
                            value={paperType}
                            onChange={(e) => setPaperType(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Не выбрано</option>
                            {PAPER_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Формат</label>
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Не выбрано</option>
                            {FORMAT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Цветность</label>
                        <select
                            value={colorMode}
                            onChange={(e) => setColorMode(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Не выбрано</option>
                            {COLOR_MODE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4" />

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Статус</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Приоритет</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    <span className="flex items-center gap-1"><AlignLeft className="w-4 h-4" /> ТЗ / Описание</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={!title || isGenerating}
                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50 transition-colors"
                  >
                    <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'AI думает...' : 'Заполнить с AI'}
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-white text-slate-900"
                  placeholder="Дополнительные детали заказа..."
                />
                 {aiSuggestion && (
                    <div className="mt-2 text-xs bg-purple-50 text-purple-700 p-2 rounded border border-purple-100 flex gap-2 items-start">
                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                        <p>{aiSuggestion}</p>
                    </div>
                 )}
              </div>

               {/* Attachments Section */}
               <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> Файлы / Макеты</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                        <Upload className="w-3 h-3" /> Загрузить
                    </button>
                    <input 
                        type="file" 
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,application/pdf"
                    />
                 </div>
                 
                 {attachments.length > 0 ? (
                    <div className="space-y-2">
                        {attachments.map(att => (
                            <div key={att.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 flex-shrink-0 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-500">
                                        {att.type.includes('image') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-800 truncate">{att.name}</p>
                                        <p className="text-[10px] text-slate-500">{(att.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <a 
                                        href={att.data} 
                                        download={att.name}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    <button 
                                        type="button"
                                        onClick={() => removeAttachment(att.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                     <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                         Нет файлов
                     </div>
                 )}
               </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Дедлайн</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  />
                </div>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
             {initialTask && onDelete && (
               <button
                 type="button"
                 onClick={() => {
                   if(confirm('Вы уверены, что хотите удалить этот заказ?')) {
                     onDelete(initialTask.id);
                     onClose();
                   }
                 }}
                 className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"
               >
                 Удалить
               </button>
             )}
             <div className="flex-1"></div>
             <button
               type="button"
               onClick={onClose}
               className="px-5 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
             >
               Отмена
             </button>
             <button
               type="submit"
               form="task-form"
               className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 font-medium flex items-center gap-2"
             >
               {initialTask ? 'Сохранить' : 'Создать'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};