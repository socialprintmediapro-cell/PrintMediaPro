import { Task, TaskStatus, Priority, User, UserRole, ChatMessage } from '../types';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, onSnapshot, setDoc, query, orderBy, deleteDoc } from "firebase/firestore";

// --- КОНФИГУРАЦИЯ FIREBASE ---
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCeEJ3uXLG2ec0OYNa-UOg5CxxW5W6sAXI",
  authDomain: "typoflow-batto.firebaseapp.com",
  projectId: "typoflow-batto",
  storageBucket: "typoflow-batto.firebasestorage.app",
  messagingSenderId: "52327164926",
  appId: "1:52327164926:web:2c30762e781a97858daeaf"
};
// --- КОНЕЦ НАСТРОЕК ---


const KEYS = {
  TASKS: 'typography-tasks',
  USER: 'typo-user',
  CHAT: 'typo-chat'
};

// --- Mock Data ---
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    orderNumber: 1001,
    title: 'Визитки "Альфа"',
    clientName: 'ООО Альфа',
    description: '1000 шт, тиснение золотом. Макет в кривых проверен.',
    status: TaskStatus.PREPRESS,
    priority: Priority.HIGH,
    createdAt: Date.now(),
    deadline: '2023-11-20',
    paperWeight: '300',
    paperType: 'DESIGN',
    format: 'VISIT',
    colorMode: '4+0'
  }
];

const DEFAULT_USER: User = {
    id: 'me',
    name: 'Алексей Смирнов',
    role: UserRole.MANAGER
};

// Initialize Firebase only if config is present
let db: any = null;
if (FIREBASE_CONFIG) {
    try {
        const app = initializeApp(FIREBASE_CONFIG);
        db = getFirestore(app);
        console.log("Firebase initialized!");
    } catch (e) {
        console.error("Firebase init error:", e);
    }
}

// --- Storage Adapter ---

export const storageAdapter = {
    // --- TASKS ---
    
    // Subscribe to live updates (Works for both Local and Cloud concepts, simplified)
    subscribeTasks: (callback: (tasks: Task[]) => void) => {
        if (db) {
            // CLOUD MODE
            const q = query(collection(db, "tasks"));
            return onSnapshot(q, (snapshot) => {
                const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
                // Sort by order number descending
                tasks.sort((a, b) => (b.orderNumber || 0) - (a.orderNumber || 0));
                callback(tasks);
            });
        } else {
            // LOCAL MODE
            const saved = localStorage.getItem(KEYS.TASKS);
            const tasks = saved ? JSON.parse(saved) : INITIAL_TASKS;
            callback(tasks);
            return () => {}; // No-op unsubscribe
        }
    },

    saveTask: async (task: Task) => {
        if (db) {
            // CLOUD MODE
            // If it's a new task (we generated ID locally but need to save to DB)
            await setDoc(doc(db, "tasks", task.id), task);
        } else {
            // LOCAL MODE
            const current = storageAdapter.getTasksLocal();
            const index = current.findIndex(t => t.id === task.id);
            if (index >= 0) {
                current[index] = task;
            } else {
                current.push(task);
            }
            localStorage.setItem(KEYS.TASKS, JSON.stringify(current));
            // Force reload for local mode is tricky without event emitter, 
            // but in App.tsx we update state manually so it's fine.
        }
    },

    deleteTask: async (id: string) => {
        if (db) {
            // CLOUD MODE
            await deleteDoc(doc(db, "tasks", id));
        } else {
            // LOCAL MODE
            const current = storageAdapter.getTasksLocal();
            const filtered = current.filter(t => t.id !== id);
            localStorage.setItem(KEYS.TASKS, JSON.stringify(filtered));
        }
    },

    // Helper for initial load in local mode
    getTasksLocal: (): Task[] => {
        const saved = localStorage.getItem(KEYS.TASKS);
        return saved ? JSON.parse(saved) : INITIAL_TASKS;
    },

    // --- USER ---
    getUser: (): User => {
        const saved = localStorage.getItem(KEYS.USER);
        return saved ? JSON.parse(saved) : DEFAULT_USER;
    },
    saveUser: (user: User) => {
        localStorage.setItem(KEYS.USER, JSON.stringify(user));
    },

    // --- CHAT ---
    subscribeChat: (callback: (msgs: ChatMessage[]) => void) => {
        if (db) {
             const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
             return onSnapshot(q, (snapshot) => {
                const msgs = snapshot.docs.map(doc => doc.data() as ChatMessage);
                callback(msgs);
             });
        } else {
             const saved = localStorage.getItem(KEYS.CHAT);
             callback(saved ? JSON.parse(saved) : []);
             return () => {};
        }
    },
    
    sendMessage: async (msg: ChatMessage) => {
        if (db) {
            await setDoc(doc(db, "messages", msg.id), msg);
        } else {
            const saved = localStorage.getItem(KEYS.CHAT);
            const current = saved ? JSON.parse(saved) : [];
            current.push(msg);
            localStorage.setItem(KEYS.CHAT, JSON.stringify(current));
        }
    }
};