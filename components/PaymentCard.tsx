
import React, { useState, useRef, useEffect } from 'react';
import { Payment, Frequency } from '../types';
import { WalletIcon, DotsVerticalIcon, TrashIcon } from './icons';

interface PaymentCardProps {
  payment: Payment;
  onTogglePaid: (id: string) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

const getPaymentColorStyles = (color: string) => {
    const colorMap: { [key: string]: { [key: string]: string } } = {
        emerald: {
            border: 'border-gray-200 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-500/50',
            iconBg: 'bg-emerald-100 dark:bg-gray-700',
            iconText: 'text-emerald-600 dark:text-emerald-400',
            button: 'bg-emerald-500 hover:bg-emerald-400 text-black',
        },
        sky: {
            border: 'border-gray-200 dark:border-sky-800/40 hover:border-sky-400 dark:hover:border-sky-500/50',
            iconBg: 'bg-sky-100 dark:bg-gray-700',
            iconText: 'text-sky-600 dark:text-sky-400',
            button: 'bg-sky-500 hover:bg-sky-400 text-black',
        },
        amber: {
            border: 'border-gray-200 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-500/50',
            iconBg: 'bg-amber-100 dark:bg-gray-700',
            iconText: 'text-amber-600 dark:text-amber-400',
            button: 'bg-amber-500 hover:bg-amber-400 text-black',
        },
        rose: {
            border: 'border-gray-200 dark:border-rose-800/40 hover:border-rose-400 dark:hover:border-rose-500/50',
            iconBg: 'bg-rose-100 dark:bg-gray-700',
            iconText: 'text-rose-600 dark:text-rose-400',
            button: 'bg-rose-500 hover:bg-rose-400 text-black',
        },
        indigo: {
            border: 'border-gray-200 dark:border-indigo-800/40 hover:border-indigo-400 dark:hover:border-indigo-500/50',
            iconBg: 'bg-indigo-100 dark:bg-gray-700',
            iconText: 'text-indigo-600 dark:text-indigo-400',
            button: 'bg-indigo-500 hover:bg-indigo-400 text-white',
        },
        purple: {
            border: 'border-gray-200 dark:border-purple-800/40 hover:border-purple-400 dark:hover:border-purple-500/50',
            iconBg: 'bg-purple-100 dark:bg-gray-700',
            iconText: 'text-purple-600 dark:text-purple-400',
            button: 'bg-purple-500 hover:bg-purple-400 text-white',
        },
    };
    return colorMap[color] || colorMap.sky;
};

const getDueDateInfo = (dueDate: string, isPaid: boolean) => {
    if (isPaid) {
        return { text: 'Pagado', className: 'text-green-600 dark:text-green-400 font-semibold' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setMinutes(due.getMinutes() + due.getTimezoneOffset());
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `Vencido hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'día' : 'días'}`, className: 'text-red-500 dark:text-red-400 font-semibold' };
    }
    if (diffDays === 0) {
        return { text: 'Vence hoy', className: 'text-amber-500 dark:text-amber-400 font-semibold' };
    }
    return { text: `Vence en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`, className: 'text-gray-500 dark:text-gray-400' };
};

const PaymentCard = ({ payment, onTogglePaid, onEdit, onDelete }: PaymentCardProps) => {
  const { id, name, amount, dueDate, category, frequency, isPaid, color } = payment;
  const styles = getPaymentColorStyles(color);
  const dueDateInfo = getDueDateInfo(dueDate, isPaid);

  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800/50 border rounded-xl p-6 flex flex-col justify-between transition-all duration-300 ${styles.border} ${isPaid ? 'opacity-50' : ''}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${styles.iconBg}`}>
              <WalletIcon className={`w-6 h-6 ${styles.iconText}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(payment.id)} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 rounded-full transition-colors">
              <TrashIcon className="w-5 h-5" />
            </button>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-white p-1 rounded-full transition-colors">
                <DotsVerticalIcon className="w-5 h-5" />
              </button>
              {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                      <button onClick={() => { onEdit(payment); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md">Editar</button>
                  </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</p>
             <p className={`text-sm ${dueDateInfo.className}`}>
                {dueDateInfo.text}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Frecuencia: {frequency}</p>
        </div>
      </div>
      
      <div className="mt-auto">
         <button 
            onClick={() => onTogglePaid(id)} 
            className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors ${isPaid ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500' : styles.button}`}>
            {isPaid ? 'Marcar como No Pagado' : 'Marcar como Pagado'}
         </button>
      </div>
    </div>
  );
};

export default PaymentCard;