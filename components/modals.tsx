
import React, { useState, useEffect, ReactNode } from 'react';
import { SavingsGoal, Payment, Priority, Frequency } from '../types';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
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

  const inputClasses = "w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? 'Editar Meta' : 'Nueva Meta de Ahorro'}>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{goalToEdit ? 'Actualiza los detalles de tu meta.' : 'Añade un nuevo artículo que deseas comprar a tu lista de metas.'}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del artículo</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Nueva Laptop" className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto / Costo (MXN)</label>
          <input type="number" id="amount" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej. Tecnología" className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={`${inputClasses} appearance-none`} required>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors">Guardar Meta</button>
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
    };
    return color ? colorMap[color] || colorMap.emerald : colorMap.emerald;
};

const getTextColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
        emerald: 'text-emerald-600 dark:text-emerald-400',
        sky: 'text-sky-600 dark:text-sky-400',
        amber: 'text-amber-600 dark:text-amber-400',
        rose: 'text-rose-600 dark:text-rose-400',
        indigo: 'text-indigo-600 dark:text-indigo-400',
        purple: 'text-purple-600 dark:text-purple-400',
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
  const inputClasses = `w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 ${ringColorClass} outline-none`;

  const getTodayString = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
    return tomorrow.toISOString().split('T')[0];
  }
  
  useEffect(() => {
    if (goal && isOpen) {
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 1);
        defaultDate.setMinutes(defaultDate.getMinutes() - defaultDate.getTimezoneOffset());

        const initialDateStr = goal.projection?.targetDate 
            ? goal.projection.targetDate
            : defaultDate.toISOString().split('T')[0];

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

    const target = new Date(targetDate);
    target.setMinutes(target.getMinutes() + target.getTimezoneOffset());
    target.setHours(0,0,0,0);
    
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
      <p className="text-gray-500 dark:text-gray-400 mb-6">Elige una fecha para alcanzar tu meta y calcularemos cuánto necesitas ahorrar periódicamente.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="proj-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha para alcanzar la meta</label>
          <input type="date" id="proj-date" value={targetDate} min={getTodayString()} onChange={(e) => setTargetDate(e.target.value)} className={inputClasses} required />
        </div>
        <div>
          <label htmlFor="proj-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia de ahorro</label>
          <select id="proj-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className={`${inputClasses} appearance-none`} required>
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
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
          <button type="submit" className={`px-4 py-2 rounded-md font-semibold transition-colors ${getButtonColorClass(goal?.color)}`} disabled={calculatedAmount <= 0}>Guardar Proyección</button>
        </div>
      </form>
    </Modal>
  );
};


interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<Payment, 'isPaid'> & { id?: string }) => void;
  paymentToEdit?: Payment | null;
}

export const PaymentModal = ({ isOpen, onClose, onSave, paymentToEdit }: PaymentModalProps) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState(0);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');
    const [frequency, setFrequency] = useState<Frequency>(Frequency.Monthly);

    const inputClasses = "w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none";

    useEffect(() => {
        if (paymentToEdit) {
            setName(paymentToEdit.name);
            setAmount(paymentToEdit.amount);
            const localDate = new Date(paymentToEdit.dueDate);
            localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
            setDueDate(localDate.toISOString().split('T')[0]);
            setCategory(paymentToEdit.category);
            setFrequency(paymentToEdit.frequency);
        } else {
            setName('');
            setAmount(0);
            setDueDate(new Date().toISOString().split('T')[0]);
            setCategory('');
            setFrequency(Frequency.Monthly);
        }
    }, [paymentToEdit, isOpen]);

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
            <p className="text-gray-500 dark:text-gray-400 mb-6">{paymentToEdit ? 'Actualiza los detalles de tu pago.' : 'Añade un pago recurrente o de una sola vez para no olvidar ninguna fecha.'}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="payment-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Gasto</label>
                    <input type="text" id="payment-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Pago Tarjeta de Crédito" className={inputClasses} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto (MXN)</label>
                        <input type="number" id="payment-amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="payment-due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Vencimiento</label>
                        <input type="date" id="payment-due-date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClasses} required />
                    </div>
                </div>
                <div>
                    <label htmlFor="payment-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                    <input type="text" id="payment-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej. Servicios" className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="payment-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia</label>
                    <select id="payment-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className={`${inputClasses} appearance-none`} required>
                        {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
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
  const inputClasses = `w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 ${ringColorClass} outline-none`;

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
      <p className="text-gray-500 dark:text-gray-400 mb-6">Ingresa la cantidad que deseas abonar a tu meta.</p>
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Monto Actual:</span>
          <span className="font-semibold text-gray-800 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(goal.savedAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Monto Restante:</span>
          <span className="font-semibold text-gray-800 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(remainingAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Meta:</span>
          <span className="font-semibold text-gray-800 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(goal.targetAmount)}</span>
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
            className={inputClasses}
            required 
            min="0.01" 
            step="0.01" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
          <button type="submit" className={`px-4 py-2 rounded-md font-semibold transition-colors ${getButtonColorClass(goal?.color)}`}>Guardar Abono</button>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
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
  onChangePin: (oldPin: string, newPin: string) => { success: boolean, message: string };
  onLogout: () => void;
}

export const SettingsModal = ({ isOpen, onClose, onChangePin, onLogout }: SettingsModalProps) => {
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const inputClasses = "w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPin !== confirmPin) {
            setError('El nuevo PIN no coincide.');
            return;
        }
        if (newPin.length < 4) {
            setError('El nuevo PIN debe tener al menos 4 dígitos.');
            return;
        }

        const result = onChangePin(oldPin, newPin);
        if (result.success) {
            setSuccess(result.message);
            setOldPin('');
            setNewPin('');
            setConfirmPin('');
            setTimeout(() => {
                setSuccess('');
            }, 2000);
        } else {
            setError(result.message);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setOldPin('');
            setNewPin('');
            setConfirmPin('');
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ajustes">
            <div className="flex flex-col gap-6">
                {/* Change PIN Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Cambiar PIN</h3>
                    <div>
                        <label htmlFor="old-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN Actual</label>
                        <input type="password" id="old-pin" value={oldPin} onChange={(e) => setOldPin(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="new-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nuevo PIN</label>
                        <input type="password" id="new-pin" value={newPin} onChange={(e) => setNewPin(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="confirm-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nuevo PIN</label>
                        <input type="password" id="confirm-pin" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className={inputClasses} required />
                    </div>
                    {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                    {success && <p className="text-sm text-emerald-500 dark:text-emerald-400">{success}</p>}
                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 rounded-md bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors">Guardar Cambios</button>
                    </div>
                </form>

                {/* Session Management */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Sesión</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cierra tu sesión para requerir el PIN de acceso nuevamente.</p>
                    <div className="flex justify-end">
                        <button 
                            type="button" 
                            onClick={onLogout} 
                            className="w-full sm:w-auto px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
