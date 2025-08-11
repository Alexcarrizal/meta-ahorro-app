
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

const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Treat as local time
    return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

const getDueDateInfo = (dueDate: string, isPaid: boolean): { text: string; className: string } => {
    if (isPaid) {
        return { text: 'Pagado', className: 'text-green-600 dark:text-green-400 font-semibold' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate + 'T00:00:00'); // Treat as local
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `Vencido hace ${Math.abs(diffDays)} día(s)`, className: 'text-red-500 dark:text-red-400 font-semibold' };
    }
    if (diffDays === 0) {
        return { text: 'Vence hoy', className: 'text-amber-500 dark:text-amber-400 font-semibold' };
    }
    if (diffDays === 1) {
        return { text: 'Vence mañana', className: 'text-gray-500 dark:text-gray-400' };
    }
    return { text: `Vence en ${diffDays} días`, className: 'text-gray-500 dark:text-gray-400' };
};

const getPaymentColorStyles = (color: string) => {
    const colorMap: { [key: string]: { [key: string]: string } } = {
        teal: {
            border: 'border-teal-200 dark:border-teal-800/40 hover:border-teal-400 dark:hover:border-teal-500/50',
            iconText: 'text-teal-600 dark:text-teal-400',
            button: 'bg-teal-500 hover:bg-teal-400 text-white',
        },
        cyan: {
            border: 'border-cyan-200 dark:border-cyan-800/40 hover:border-cyan-400 dark:hover:border-cyan-500/50',
            iconText: 'text-cyan-600 dark:text-cyan-400',
            button: 'bg-cyan-500 hover:bg-cyan-400 text-black',
        },
        blue: {
            border: 'border-blue-200 dark:border-blue-800/40 hover:border-blue-400 dark:hover:border-blue-500/50',
            iconText: 'text-blue-600 dark:text-blue-400',
            button: 'bg-blue-500 hover:bg-blue-400 text-white',
        },
        lime: {
            border: 'border-lime-200 dark:border-lime-800/40 hover:border-lime-400 dark:hover:border-lime-500/50',
            iconText: 'text-lime-600 dark:text-lime-400',
            button: 'bg-lime-500 hover:bg-lime-400 text-black',
        },
        fuchsia: {
            border: 'border-fuchsia-200 dark:border-fuchsia-800/40 hover:border-fuchsia-400 dark:hover:border-fuchsia-500/50',
            iconText: 'text-fuchsia-600 dark:text-fuchsia-400',
            button: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
        },
        pink: {
            border: 'border-pink-200 dark:border-pink-800/40 hover:border-pink-400 dark:hover:border-pink-500/50',
            iconText: 'text-pink-600 dark:text-pink-400',
            button: 'bg-pink-500 hover:bg-pink-400 text-white',
        },
    };
    return colorMap[color] || colorMap.blue;
};

const PaymentCard = ({ payment, onTogglePaid, onEdit, onDelete }: PaymentCardProps) => {
  const { id, name, amount, dueDate, category, frequency, isPaid, color } = payment;
  const dueDateInfo = getDueDateInfo(dueDate, isPaid);
  const styles = getPaymentColorStyles(color);

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
    <div className={`bg-white dark:bg-gray-800/50 border rounded-xl p-6 flex flex-col justify-between transition-all duration-300 ${styles.border} ${isPaid ? 'opacity-60 dark:opacity-50' : ''}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <WalletIcon className={`w-6 h-6 ${styles.iconText}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(payment.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors">
              <TrashIcon className="w-5 h-5" />
            </button>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white p-1 rounded-full transition-colors">
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
            <div>
              <p className={`text-sm ${dueDateInfo.className}`}>
                  {dueDateInfo.text}
              </p>
              {!isPaid && <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fecha: {formatDate(dueDate)}
              </p>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Frecuencia: {frequency}</p>
        </div>
      </div>
      
      <div className="mt-auto">
         <button 
            onClick={() => onTogglePaid(id)} 
            className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors ${isPaid ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500' : `${styles.button}`}`}>
            {isPaid ? 'Marcar como No Pagado' : 'Marcar como Pagado'}
         </button>
      </div>
    </div>
  );
};

export default PaymentCard;