
import React, { useState, useRef, useEffect } from 'react';
import { Payment, Frequency } from '../types';
import { WalletIcon, DotsVerticalIcon, TrashIcon } from './icons';

interface PaymentCardProps {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
  onContribute: (payment: Payment) => void;
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

const getDueDateInfo = (dueDate: string, isCovered: boolean): { text: string; className: string } => {
    if (isCovered) {
        return { text: 'Pago Cubierto', className: 'text-green-600 dark:text-green-400 font-semibold' };
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
            progressBar: 'bg-teal-500',
            paidBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold',
        },
        cyan: {
            border: 'border-cyan-200 dark:border-cyan-800/40 hover:border-cyan-400 dark:hover:border-cyan-500/50',
            iconText: 'text-cyan-600 dark:text-cyan-400',
            button: 'bg-cyan-500 hover:bg-cyan-400 text-black',
            progressBar: 'bg-cyan-500',
            paidBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold',
        },
        blue: {
            border: 'border-blue-200 dark:border-blue-800/40 hover:border-blue-400 dark:hover:border-blue-500/50',
            iconText: 'text-blue-600 dark:text-blue-400',
            button: 'bg-blue-500 hover:bg-blue-400 text-white',
            progressBar: 'bg-blue-500',
            paidBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold',
        },
        lime: {
            border: 'border-lime-200 dark:border-lime-800/40 hover:border-lime-400 dark:hover:border-lime-500/50',
            iconText: 'text-lime-600 dark:text-lime-400',
            button: 'bg-lime-500 hover:bg-lime-400 text-black',
            progressBar: 'bg-lime-500',
            paidBg: 'bg-lime-500/10 text-lime-700 dark:text-lime-300 font-bold',
        },
        fuchsia: {
            border: 'border-fuchsia-200 dark:border-fuchsia-800/40 hover:border-fuchsia-400 dark:hover:border-fuchsia-500/50',
            iconText: 'text-fuchsia-600 dark:text-fuchsia-400',
            button: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
            progressBar: 'bg-fuchsia-500',
            paidBg: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 font-bold',
        },
        pink: {
            border: 'border-pink-200 dark:border-pink-800/40 hover:border-pink-400 dark:hover:border-pink-500/50',
            iconText: 'text-pink-600 dark:text-pink-400',
            button: 'bg-pink-500 hover:bg-pink-400 text-white',
            progressBar: 'bg-pink-500',
            paidBg: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold',
        },
    };
    return colorMap[color] || colorMap.blue;
};

const PaymentCard = ({ payment, onEdit, onDelete, onContribute }: PaymentCardProps) => {
  const { id, name, amount, paidAmount, dueDate, category, frequency, color } = payment;
  const isCovered = paidAmount >= amount;
  const progress = amount > 0 ? Math.min((paidAmount / amount) * 100, 100) : 0;
  const remainingAmount = Math.max(0, amount - paidAmount);
  
  const dueDateInfo = getDueDateInfo(dueDate, isCovered);
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
    <div className={`bg-white dark:bg-gray-800/50 border rounded-xl p-6 flex flex-col justify-between transition-all duration-300 ${styles.border} ${isCovered ? 'opacity-60 dark:opacity-50' : ''}`}>
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

        <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>{formatCurrency(paidAmount)}</span>
                <span>{formatCurrency(amount)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                className={`${styles.progressBar} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                Restante: {formatCurrency(remainingAmount)}
            </p>
        </div>
        
        <div className="space-y-1 mb-4">
            <p className={`text-sm ${dueDateInfo.className}`}>
                {dueDateInfo.text}
            </p>
            {!isCovered && <p className="text-sm text-gray-500 dark:text-gray-400">
                Fecha Límite: {formatDate(dueDate)}
            </p>}
             <p className="text-sm text-gray-500 dark:text-gray-400">Frecuencia: {frequency}</p>
        </div>

      </div>
      
      <div className="mt-auto">
        {isCovered ? (
            <div className={`text-center py-2 rounded-lg ${styles.paidBg}`}>
                ¡Pago Cubierto!
            </div>
        ) : (
            <button 
                onClick={() => onContribute(payment)} 
                className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors ${styles.button}`}>
                Abonar
            </button>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;