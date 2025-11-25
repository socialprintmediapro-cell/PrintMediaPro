import React from 'react';
import { TaskStatus, STATUS_LABELS } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
}

const COLORS: Record<TaskStatus, string> = {
  [TaskStatus.NEW]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TaskStatus.PREPRESS]: 'bg-purple-100 text-purple-800 border-purple-200',
  [TaskStatus.PRINTING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [TaskStatus.POSTPRESS]: 'bg-orange-100 text-orange-800 border-orange-200',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800 border-green-200',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
};