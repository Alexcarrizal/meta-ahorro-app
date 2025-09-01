
import React, { useState, useEffect, ReactNode } from 'react';
import { SavingsGoal, Payment, Priority, Frequency, WishlistItem } from '../types.ts';
import { CloseIcon, SunIcon, MoonIcon, LockIcon, PlusIcon, WalletIcon, LaptopIcon } from './icons.tsx';
import { AuthScreen } from './Auth.tsx';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-300 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'savedAmount' | 'createdAt' | 'projection' | 'color'> & { id?: string }) => void;
  goalToEdit?: SavingsGoal | null;
}

export const GoalModal = ({ isOpen, onClose, onSave, goalToEdit }: GoalModalProps) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  
  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount);
      setCategory(goalToEdit.category);
      setPriority(goalToEdit.priority);
    } else {
      setName('');
      setTargetAmount(0);
      setCategory('');
      setPriority(Priority.Medium);
    }
  }, [goalToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
        id: goalToEdit?.id,
        name, 
        targetAmount, 
        category, 
        priority 
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? 'Editar Meta' : 'Nueva Meta de Ahorro'}>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{goalToEdit ? 'Actualiza los detalles de tu meta.' : 'Añade un nuevo artículo que deseas comprar a tu lista de metas.'}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del artículo</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Nueva Laptop" className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto / Costo (MXN)</label>
          <input type="number" id="amount" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej. Tecnología" className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none" required>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors">Guardar Meta</button>
        </div>
      </form>
    </Modal>
  );
};

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<WishlistItem, 'id'> & { id?: string }) => void;
  itemToEdit?: WishlistItem | null;
}

export const WishlistModal = ({ isOpen, onClose, onSave, itemToEdit }: WishlistModalProps) => {
  const [name, setName] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState<number | string>('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setName(itemToEdit.name);
        setEstimatedAmount(itemToEdit.estimatedAmount || '');
        setCategory(itemToEdit.category);
        setPriority(itemToEdit.priority);
        setUrl(itemToEdit.url || '');
      } else {
        setName('');
        setEstimatedAmount('');
        setCategory('');
        setPriority(Priority.Medium);
        setUrl('');
      }
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: itemToEdit?.id,
      name,
      estimatedAmount: Number(estimatedAmount) || undefined,
      category,
      priority,
      url: url || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? 'Editar Deseo' : 'Nuevo Deseo'}>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{itemToEdit ? 'Actualiza los detalles de este artículo.' : 'Añade un artículo a tu lista de deseos para futuras compras.'}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="wish-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del artículo</label>
          <input type="text" id="wish-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Silla de Oficina Ergonómica" className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" required />
        </div>
        <div>
          <label htmlFor="wish-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <input type="text" id="wish-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej. Hogar y Oficina" className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" required />
        </div>
        <div>
          <label htmlFor="wish-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costo Estimado (MXN) <span className="text-gray-400">(Opcional)</span></label>
          <input type="number" id="wish-amount" value={estimatedAmount} onChange={(e) => setEstimatedAmount(e.target.value)} placeholder="5000" className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label htmlFor="wish-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Página Web <span className="text-gray-400">(Opcional)</span></label>
          <input type="url" id="wish-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://ejemplo.com/producto" className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label htmlFor="wish-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
          <select id="wish-priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none" required>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors">Guardar Deseo</button>
        </div>
      </form>
    </Modal>
  );
};

const getButtonColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
        emerald: 'bg-emerald-500 hover:bg-emerald-400 text-black',
        sky: 'bg-sky-500 hover:bg-sky-400 text-black',
        amber: 'bg-amber-500 hover:bg-amber-400 text-black',
        rose: 'bg-rose-500 hover:bg-rose-400 text-black',
        indigo: 'bg-indigo-500 hover:bg-indigo-400 text-white',
        purple: 'bg-purple-500 hover:bg-purple-400 text-white',
        teal: 'bg-teal-500 hover:bg-teal-400 text-white',
        cyan: 'bg-cyan-500 hover:bg-cyan-400 text-black',
        blue: 'bg-blue-500 hover:bg-blue-400 text-white',
        lime: 'bg-lime-500 hover:bg-lime-400 text-black',
        fuchsia: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
        pink: 'bg-pink-500 hover:bg-pink-400 text-white',
    };
    return color ? colorMap[color] || colorMap.emerald : colorMap.emerald;
};

const getTextColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
        emerald: 'text-emerald-500 dark:text-emerald-400',
        sky: 'text-sky-500 dark:text-sky-400',
        amber: 'text-amber-500 dark:text-amber-400',
        rose: 'text-rose-500 dark:text-rose-400',
        indigo: 'text-indigo-500 dark:text-indigo-400',
        purple: 'text-purple-500 dark:text-purple-400',
        teal: 'text-teal-500 dark:text-teal-400',
        cyan: 'text-cyan-500 dark:text-cyan-400',
        blue: 'text-blue-500 dark:text-blue-400',
        lime: 'text-lime-500 dark:text-lime-400',
        fuchsia: 'text-fuchsia-500 dark:text-fuchsia-400',
        pink: 'text-pink-500 dark:text-pink-400',
    };
    return color ? colorMap[color] || colorMap.emerald : colorMap.emerald;
}

const getRingColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
        emerald: 'focus:ring-emerald-500 focus:border-emerald-500',
        sky: 'focus:ring-sky-500 focus:border-sky-500',
        amber: 'focus:ring-amber-500 focus:border-amber-500',
        rose: 'focus:ring-rose-500 focus:border-rose-500',
        indigo: 'focus:ring-indigo-500 focus:border-indigo-500',
        purple: 'focus:ring-purple-500 focus:border-purple-500',
        teal: 'focus:ring-teal-500 focus:border-teal-500',
        cyan: 'focus:ring-cyan-500 focus:border-cyan-500',
        blue: 'focus:ring-blue-500 focus:border-blue-500',
        lime: 'focus:ring-lime-500 focus:border-lime-500',
        fuchsia: 'focus:ring-fuchsia-500 focus:border-fuchsia-500',
        pink: 'focus:ring-pink-500 focus:border-pink-500',
    };
    return color ? colorMap[color] || colorMap.emerald : colorMap.emerald;
}


interface ProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projection: { amount: number; frequency: Frequency; targetDate: string; goalId: string }) => void;
  goal?: SavingsGoal | null;
}

export const ProjectionModal = ({ isOpen, onClose, onSave, goal }: ProjectionModalProps) => {
  const [targetDate, setTargetDate] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.BiWeekly);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  
  const ringColorClass = getRingColorClass(goal?.color);

  const getTodayString = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const day = tomorrow.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  useEffect(() => {
    if (goal && isOpen) {
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 1);
        
        const initialDateStr = goal.projection?.targetDate 
            ? goal.projection.targetDate
            : `${defaultDate.getFullYear()}-${(defaultDate.getMonth() + 1).toString().padStart(2, '0')}-${defaultDate.getDate().toString().padStart(2, '0')}`;

        setTargetDate(initialDateStr);
        setFrequency(goal.projection?.frequency || Frequency.BiWeekly);
    }
  }, [goal, isOpen]);

  useEffect(() => {
    if (!goal || !targetDate || !frequency) {
      setCalculatedAmount(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate + 'T00:00:00'); // Treat as local time
    
    if (target <= today) {
        setCalculatedAmount(0);
        return;
    }

    const remainingAmount = goal.targetAmount - goal.savedAmount;
    if (remainingAmount <= 0) {
        setCalculatedAmount(0);
        return;
    }
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let periods = 0;
    switch(frequency) {
        case Frequency.Weekly:
            periods = diffDays / 7;
            break;
        case Frequency.BiWeekly:
            periods = diffDays / 14;
            break;
        case Frequency.Monthly:
            periods = diffDays / (365.25 / 12);
            break;
        case Frequency.Annual:
            periods = diffDays / 365.25;
            break;
    }

    if (periods <= 0) {
      setCalculatedAmount(remainingAmount);
      return;
    }

    const amountPerPeriod = remainingAmount / periods;
    setCalculatedAmount(Math.ceil(amountPerPeriod));

  }, [goal, targetDate, frequency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedAmount > 0 && targetDate && goal) {
        onSave({ amount: calculatedAmount, frequency, targetDate, goalId: goal.id });
    }
    onClose();
  };
  
  if (!goal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Proyección de Ahorro">
      <p className="text-gray-600 dark:text-gray-400 mb-6">Elige una fecha para alcanzar tu meta y calcularemos cuánto necesitas ahorrar periódicamente.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="proj-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha para alcanzar la meta</label>
          <input type="date" id="proj-date" value={targetDate} min={getTodayString()} onChange={(e) => setTargetDate(e.target.value)} className={`w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 ${ringColorClass} outline-none`} required />
        </div>
        <div>
          <label htmlFor="proj-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia de ahorro</label>
          <select id="proj-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className={`w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 ${ringColorClass} outline-none appearance-none`} required>
            {Object.values(Frequency).filter(f => f !== Frequency.OneTime).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        
        {calculatedAmount > 0 && (
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center mt-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Abono sugerido:</p>
                <p className={`text-2xl font-bold ${getTextColorClass(goal?.color)}`}>
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(calculatedAmount)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{frequency}</p>
            </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
          <button type="submit" className={`px-4 py-2 rounded-md font-semibold transition-colors ${getButtonColorClass(goal?.color)}`} disabled={calculatedAmount <= 0}>Guardar Proyección</button>
        </div>
      </form>
    </Modal>
  );
};


interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<Payment, 'paidAmount' | 'color'> & { id?: string }) => void;
  paymentToEdit?: Payment | null;
  defaultDate?: Date | null;
}

export const PaymentModal = ({ isOpen, onClose, onSave, paymentToEdit, defaultDate }: PaymentModalProps) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState(0);
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('');
    const [frequency, setFrequency] = useState<Frequency>(Frequency.Monthly);

    const formatDateToInput = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (isOpen) {
            if (paymentToEdit) {
                setName(paymentToEdit.name);
                setAmount(paymentToEdit.amount);
                setDueDate(paymentToEdit.dueDate);
                setCategory(paymentToEdit.category);
                setFrequency(paymentToEdit.frequency);
            } else {
                setName('');
                setAmount(0);
                setDueDate(defaultDate ? formatDateToInput(defaultDate) : formatDateToInput(new Date()));
                setCategory('');
                setFrequency(Frequency.Monthly);
            }
        }
    }, [paymentToEdit, isOpen, defaultDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            id: paymentToEdit?.id,
            name, 
            amount, 
            dueDate, 
            category, 
            frequency 
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={paymentToEdit ? 'Editar Pago' : 'Nuevo Pago'}>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{paymentToEdit ? 'Actualiza los detalles de tu pago.' : 'Añade un pago recurrente o de una sola vez para no olvidar ninguna fecha.'}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="payment-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Gasto</label>
                    <input type="text" id="payment-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Pago Tarjeta de Crédito" className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto (MXN)</label>
                        <input type="number" id="payment-amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" required />
                    </div>
                    <div>
                        <label htmlFor="payment-due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Vencimiento</label>
                        <input type="date" id="payment-due-date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="payment-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                    <input type="text" id="payment-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej. Servicios" className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" required />
                </div>
                <div>
                    <label htmlFor="payment-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia</label>
                    <select id="payment-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none" required>
                        {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-sky-500 text-black font-semibold hover:bg-sky-400 transition-colors">Guardar Pago</button>
                </div>
            </form>
        </Modal>
    );
};

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contribution: { amount: number; goalId: string; }) => void;
  goal?: SavingsGoal | null;
}

export const ContributionModal = ({ isOpen, onClose, onSave, goal }: ContributionModalProps) => {
  const [amount, setAmount] = useState<number | string>('');
  const ringColorClass = getRingColorClass(goal?.color);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (numericAmount > 0 && goal) {
      onSave({ amount: numericAmount, goalId: goal.id });
    }
    onClose();
  };

  if (!goal) return null;

  const remainingAmount = goal.targetAmount - goal.savedAmount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Abonar a "${goal.name}"`}>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Ingresa la cantidad que deseas abonar a tu meta.</p>
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Monto Actual:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(goal.savedAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Monto Restante:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(remainingAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Meta:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(goal.targetAmount)}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contrib-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a abonar (MXN)</label>
          <input 
            type="number" 
            id="contrib-amount" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="0.00" 
            className={`w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 ${ringColorClass} outline-none`}
            required 
            min="0.01" 
            step="0.01" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
          <button type="submit" className={`px-4 py-2 rounded-md font-semibold transition-colors ${getButtonColorClass(goal?.color)}`}>Guardar Abono</button>
        </div>
      </form>
    </Modal>
  );
};

interface PaymentContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contribution: { amount: number; paymentId: string; }) => void;
    payment?: Payment | null;
}

export const PaymentContributionModal = ({ isOpen, onClose, onSave, payment }: PaymentContributionModalProps) => {
    const [amount, setAmount] = useState<number | string>('');
    const ringColorClass = getRingColorClass(payment?.color);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = Number(amount);
        if (numericAmount > 0 && payment) {
            onSave({ amount: numericAmount, paymentId: payment.id });
        }
        onClose();
    };

    if (!payment) return null;

    const remainingAmount = payment.amount - payment.paidAmount;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Abonar a "${payment.name}"`}>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Ingresa la cantidad que deseas abonar a este pago.</p>
            <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Monto Pagado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payment.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Monto Restante:</span>
                    <span className={`font-semibold ${getTextColorClass(payment?.color)}`}>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(remainingAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Monto Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payment.amount)}</span>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="payment-contrib-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a abonar (MXN)</label>
                    <input
                        type="number"
                        id="payment-contrib-amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 ${ringColorClass} outline-none`}
                        required
                        min="0.01"
                        step="0.01" 
                        max={remainingAmount}
                        />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                    <button type="submit" className={`px-4 py-2 rounded-md font-semibold transition-colors ${getButtonColorClass(payment?.color)}`}>Guardar Abono</button>
                </div>
            </form>
        </Modal>
    );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Eliminar', 
    cancelText = 'Cancelar',
    confirmButtonClass = 'bg-red-600 hover:bg-red-500 text-white'
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-300 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    {cancelText}
                </button>
                <button type="button" onClick={onConfirm} className={`px-4 py-2 rounded-md font-semibold transition-colors ${confirmButtonClass}`}>
                    {confirmText}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onToggleTheme: () => void;
    onChangePin: () => void;
    onLock: () => void;
    theme: 'light' | 'dark';
}

export const SettingsModal = ({ isOpen, onClose, onToggleTheme, onChangePin, onLock, theme }: SettingsModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ajustes">
            <div className="space-y-4">
                <button onClick={onToggleTheme} className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-900/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Cambiar Tema</span>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
                    </div>
                </button>
                <button onClick={onChangePin} className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-900/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Cambiar PIN</span>
                    <span className="text-gray-600 dark:text-gray-400 text-2xl">****</span>
                </button>
                <button onClick={onLock} className="w-full flex items-center justify-between p-3 bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-800/60 rounded-lg transition-colors">
                    <span className="font-semibold text-rose-800 dark:text-rose-200">Bloquear Aplicación</span>
                    <LockIcon className="w-6 h-6 text-rose-600 dark:text-rose-400"/>
                </button>
            </div>
        </Modal>
    );
};

interface ChangePinModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPin: string;
    onPinChanged: (newPin: string) => void;
}

export const ChangePinModal = ({ isOpen, onClose, currentPin, onPinChanged }: ChangePinModalProps) => {
    const [step, setStep] = useState(1); // 1: enter old, 2: enter new, 3: confirm new
    const [newPin, setNewPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setNewPin('');
            setError('');
        }
    }, [isOpen]);

    const handleOldPinSuccess = () => {
        setError('');
        setStep(2);
    };

    const handleNewPinSet = (pin: string) => {
        setError('');
        setNewPin(pin);
        setStep(3);
    };

    const handleNewPinConfirm = (pin: string) => {
        if (pin === newPin) {
            onPinChanged(pin);
            onClose();
        } else {
            setError('Los PINs no coinciden. Intenta de nuevo.');
            setNewPin('');
            setStep(2);
        }
    };
    
    const titles: { [key: number]: string } = {
        1: 'Ingresa tu PIN actual',
        2: 'Ingresa tu nuevo PIN',
        3: 'Confirma tu nuevo PIN'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cambiar PIN">
            <h3 className="text-center font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">{titles[step]}</h3>
            {error && <p className="text-center text-red-500 text-sm mb-4">{error}</p>}
            
            {step === 1 && <AuthScreen hasPin={true} onUnlockSuccess={handleOldPinSuccess} storedPin={currentPin} isModalVersion={true} />}
            {step === 2 && <AuthScreen hasPin={false} onSetPin={handleNewPinSet} isModalVersion={true} />}
            {step === 3 && <AuthScreen hasPin={false} onSetPin={handleNewPinConfirm} isModalVersion={true} />}

        </Modal>
    );
};


interface DayActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPayment: () => void;
    onAddGoal: () => void;
    date: Date | null;
}

export const DayActionModal = ({ isOpen, onClose, onAddPayment, onAddGoal, date }: DayActionModalProps) => {
    if (!isOpen || !date) return null;

    const formattedDate = date.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Añadir Evento">
            <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400">
                    ¿Qué deseas agregar para el <span className="font-bold text-gray-800 dark:text-gray-200">{formattedDate}</span>?
                </p>
                <button
                    onClick={onAddPayment}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-sky-100 dark:bg-sky-900/50 hover:bg-sky-200 dark:hover:bg-sky-800/60 rounded-lg transition-colors"
                >
                    <WalletIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    <span className="font-semibold text-sky-800 dark:text-sky-200">Nuevo Pago</span>
                </button>
                <button
                    onClick={onAddGoal}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 rounded-lg transition-colors"
                >
                    <LaptopIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-emerald-800 dark:text-emerald-200">Nueva Meta</span>
                </button>
            </div>
        </Modal>
    );
};