export enum Priority {
  High = 'Alta',
  Medium = 'Media',
  Low = 'Baja',
}

export enum Frequency {
  OneTime = 'Una vez',
  Weekly = 'Semanal',
  BiWeekly = 'Quincenal',
  Monthly = 'Mensual',
  Annual = 'Anual',
}

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  priority: Priority;
  estimatedAmount?: number;
  url?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  category: string;
  priority: Priority;
  color: string;
  projection?: {
    amount: number;
    frequency: Frequency;
    targetDate?: string;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  name: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  category: string;
  frequency: Frequency;
  color: string;
}