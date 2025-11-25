export enum TaskStatus {
  NEW = 'NEW',
  PREPRESS = 'PREPRESS',
  PRINTING = 'PRINTING',
  POSTPRESS = 'POSTPRESS',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64 string
  size: number;
}

export interface Task {
  id: string;
  orderNumber: number; // New: Auto-incrementing order ID
  title: string;
  clientName: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  createdAt: number;
  deadline?: string;
  
  // New Typography Specs
  paperWeight?: string;
  paperType?: string;
  format?: string;
  colorMode?: string;
  
  // Files
  attachments?: Attachment[];
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.NEW]: 'Новый заказ',
  [TaskStatus.PREPRESS]: 'Допечатная подготовка',
  [TaskStatus.PRINTING]: 'В печати',
  [TaskStatus.POSTPRESS]: 'Пост-печать / Сборка',
  [TaskStatus.DONE]: 'Готово к выдаче',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.LOW]: 'Низкий',
  [Priority.MEDIUM]: 'Средний',
  [Priority.HIGH]: 'Высокий',
  [Priority.URGENT]: 'Срочно',
};

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

// --- Team & Chat Types ---

export enum UserRole {
  DIRECTOR = 'DIRECTOR',
  MANAGER = 'MANAGER',
  DESIGNER = 'DESIGNER',
  PRINTER = 'PRINTER',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.DIRECTOR]: 'Директор',
  [UserRole.MANAGER]: 'Менеджер',
  [UserRole.DESIGNER]: 'Дизайнер',
  [UserRole.PRINTER]: 'Печатник',
};

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string; // URL or mock ID
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  timestamp: number;
}

// --- Typography Options Constants ---

export const PAPER_WEIGHT_OPTIONS = [
  { value: '80', label: '80 г/м² (Офисная)' },
  { value: '115', label: '115 г/м² (Листовки)' },
  { value: '130', label: '130 г/м² (Буклеты)' },
  { value: '150', label: '150 г/м² (Плотная)' },
  { value: '170', label: '170 г/м² (Календари)' },
  { value: '200', label: '200 г/м²' },
  { value: '250', label: '250 г/м²' },
  { value: '300', label: '300 г/м² (Визитки)' },
  { value: '350', label: '350 г/м² (Премиум)' },
];

export const PAPER_TYPE_OPTIONS = [
  { value: 'MATTE', label: 'Матовая (Мел)' },
  { value: 'GLOSSY', label: 'Глянцевая (Мел)' },
  { value: 'OFFSET', label: 'Офсетная' },
  { value: 'DESIGN', label: 'Дизайнерская' },
  { value: 'KRAFT', label: 'Крафт' },
  { value: 'CARTON', label: 'Картон' },
  { value: 'SELF_ADHESIVE', label: 'Самоклеящаяся' },
];

export const FORMAT_OPTIONS = [
  { value: 'VISIT', label: 'Визитка (90x50)' },
  { value: 'EURO', label: 'Еврофлаер' },
  { value: 'A6', label: 'A6' },
  { value: 'A5', label: 'A5' },
  { value: 'A4', label: 'A4' },
  { value: 'A3', label: 'A3' },
  { value: 'A2', label: 'A2' },
  { value: 'A1', label: 'A1' },
  { value: 'CUSTOM', label: 'Нестандарт' },
];

export const COLOR_MODE_OPTIONS = [
  { value: '4+0', label: '4+0 (Цвет, 1 стор.)' },
  { value: '4+4', label: '4+4 (Цвет, 2 стор.)' },
  { value: '1+0', label: '1+0 (Ч/Б, 1 стор.)' },
  { value: '1+1', label: '1+1 (Ч/Б, 2 стор.)' },
];