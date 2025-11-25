import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, Clock, AlertTriangle, User as UserIcon, Settings, Share2 } from 'lucide-react';
import { 
  Task, TaskStatus, Priority, STATUS_LABELS, AppNotification, NotificationType,
  PAPER_WEIGHT_OPTIONS, PAPER_TYPE_OPTIONS, FORMAT_OPTIONS, COLOR_MODE_OPTIONS,
  User, UserRole, ROLE_LABELS, ChatMessage
} from './types';
import { TaskDrawer } from './components/TaskDrawer';
import { StatusBadge } from './components/StatusBadge';
import { NotificationToast } from './components/NotificationToast';
import { TeamModal } from './components/TeamModal';
import { ChatWidget } from './components/ChatWidget';
import { ShareModal } from './components/ShareModal';
import { storageAdapter } from './services/storageAdapter';

// Helper to get label from value
const getLabel = (options: {value: string, label: string}[], value?: string) => {
    const found = options.find(o => o.value === value);
    if (!found) return value; 
    return found.label.split(' (')[0]; 
};

function App() {
  // Load initial state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(() => storageAdapter.getUser());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // --- Real-time Subscriptions ---
  
  useEffect(() => {
    // Subscribe to Tasks
    const unsubscribeTasks = storageAdapter.subscribeTasks((updatedTasks) => {
        setTasks(updatedTasks);
    });

    // Subscribe to Chat
    const unsubscribeChat = storageAdapter.subscribeChat((updatedMessages) => {
        setChatMessages(updatedMessages);
    });

    return () => {
        unsubscribeTasks();
        unsubscribeChat();
    };
  }, []);

  // Save User locally only (Profile is usually local for this simple app)
  useEffect(() => {
    storageAdapter.saveUser(currentUser);
  }, [currentUser]);

  // Check deadlines on mount
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const urgentTasks = tasks.filter(t => {
        if (!t.deadline || t.status === TaskStatus.DONE) return false;
        const due = new Date(t.deadline);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 0 && diffDays <= 2;
      });

      if (urgentTasks.length > 0) {
        addNotification(
          'warning', 
          'Дедлайны близко!', 
          `Внимание: у вас ${urgentTasks.length} заказов, которые нужно сдать в ближайшие 48 часов.`
        );
      }
    };

    // Run check when tasks load
    if (tasks.length > 0) {
        const timer = setTimeout(checkDeadlines, 2000);
        return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.length]);

  const addNotification = (type: NotificationType, title: string, message: string) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, title, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNextOrderNumber = () => {
    if (tasks.length === 0) return 1001;
    const max = Math.max(...tasks.map(t => t.orderNumber || 0));
    return max + 1;
  };

  const handleSaveTask = async (taskData: Task) => {
    // Optimistic Update handled by subscription usually, but we prepare data here
    let taskToSave = { ...taskData };
    
    // Logic for new tasks
    const isNew = !tasks.find(t => t.id === taskData.id);
    if (isNew) {
         taskToSave.orderNumber = getNextOrderNumber();
         addNotification('success', 'Новый заказ', `Заказ отправляется...`);
    } else {
         addNotification('success', 'Сохранение', `Обновление заказа...`);
    }

    // Send to adapter (Cloud or Local)
    await storageAdapter.saveTask(taskToSave);
    
    // Note: We don't manually setTasks here because the subscription will catch the change!
  };

  const handleDeleteTask = async (id: string) => {
    if(confirm("Вы уверены? Это действие нельзя отменить.")) {
        await storageAdapter.deleteTask(id);
        addNotification('error', 'Удалено', 'Заказ удален');
    }
  };

  const handleSendMessage = async (text: string) => {
      const newMessage: ChatMessage = {
          id: crypto.randomUUID(),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          text,
          timestamp: Date.now()
      };
      await storageAdapter.sendMessage(newMessage);
  };

  const handleOpenNew = () => {
    setEditingTask(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsDrawerOpen(true);
  };

  const filteredTasks = tasks.filter(t => {
      const query = searchQuery.toLowerCase();
      const orderStr = t.orderNumber ? t.orderNumber.toString() : '';
      return (
        t.title.toLowerCase().includes(query) ||
        t.clientName.toLowerCase().includes(query) ||
        orderStr.includes(query)
      );
  });

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(t => t.status === status);
  };

  const getPriorityColor = (priority: Priority) => {
      switch(priority) {
          case Priority.URGENT: return 'border-l-4 border-l-red-500';
          case Priority.HIGH: return 'border-l-4 border-l-orange-500';
          default: return 'border-l-4 border-l-transparent';
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden md:block">TypoFlow <span className="text-blue-600">Batto</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Поиск по номеру или названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none border border-transparent focus:border-blue-200 w-72 text-slate-900"
                />
             </div>
             
             <button 
               onClick={() => setIsShareModalOpen(true)}
               title="Открыть на телефоне"
               className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
             >
                <Share2 className="w-5 h-5" />
             </button>

             <button 
               onClick={() => setIsTeamModalOpen(true)}
               className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all group"
             >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-700 leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{ROLE_LABELS[currentUser.role]}</p>
                </div>
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600 ml-1" />
             </button>

             <button 
               onClick={handleOpenNew}
               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
             >
               <Plus className="w-4 h-4" />
               <span className="hidden sm:inline">Новый заказ</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 min-w-max h-full">
          {Object.values(TaskStatus).map((status) => (
            <div key={status} className="w-80 flex-shrink-0 flex flex-col h-full rounded-xl bg-slate-100/50 border border-slate-200/60">
              
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-200/60 bg-white/50 rounded-t-xl backdrop-blur-sm sticky top-0">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  {STATUS_LABELS[status]}
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {getTasksByStatus(status).length}
                  </span>
                </h3>
              </div>

              {/* Task List */}
              <div className="p-3 space-y-3 overflow-y-auto scrollbar-hide flex-1">
                {getTasksByStatus(status).map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => handleOpenEdit(task)}
                    className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group border border-slate-100 ${getPriorityColor(task.priority)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400">#{String(task.orderNumber).padStart(4, '0')}</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[120px]">
                            {task.clientName}
                        </span>
                      </div>
                      {task.deadline && (
                         <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${new Date(task.deadline) < new Date() ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                           <Clock className="w-3 h-3" />
                           {new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                         </div>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-800 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                      {task.title}
                    </h4>

                    {/* Technical Tags */}
                    {(task.format || task.paperWeight || task.paperType || task.colorMode) && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                         {task.format && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{getLabel(FORMAT_OPTIONS, task.format)}</span>}
                         {task.paperWeight && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{task.paperWeight}г</span>}
                         {task.paperType && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{getLabel(PAPER_TYPE_OPTIONS, task.paperType)}</span>}
                         {task.colorMode && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{task.colorMode}</span>}
                      </div>
                    )}
                    
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {task.description || "Нет описания"}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                       <StatusBadge status={task.status} />
                       {task.priority === Priority.URGENT && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                ))}
                
                {getTasksByStatus(status).length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-sm">Нет задач</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <TaskDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={editingTask}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <ChatWidget 
        currentUser={currentUser}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
      />

      {/* Notification Center */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map(notification => (
           <div key={notification.id} className="pointer-events-auto">
             <NotificationToast 
               notification={notification} 
               onDismiss={removeNotification} 
             />
           </div>
        ))}
      </div>
    </div>
  );
}

export default App;