import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Payment, Frequency } from '../types.ts';
import { WalletIcon, DotsVerticalIcon, TrashIcon, CheckCircle2Icon } from './icons.tsx';

interface DashboardPaymentItemProps {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
  onContribute: (payment: Payment) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getDueDateInfoText = (dueDate: string, isCovered: boolean): string => {
    if (isCovered) return 'Pago Cubierto';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)} día(s)`;
    if (diffDays === 0) return 'Vence hoy';
    return `Vence en ${diffDays} días`;
};

const getPaymentColorStyles = (color: string) => {
    const colorMap: { [key: string]: { [key: string]: string } } = {
        lime: { border: 'border-[#96C82B]', shadow: '#96C82B', icon: 'text-[#96C82B]', progress: 'bg-[#96C82B]', button: 'bg-[#96C82B] text-black hover:bg-lime-300' },
        fuchsia: { border: 'border-[#B434A4]', shadow: '#B434A4', icon: 'text-[#B434A4]', progress: 'bg-[#B434A4]', button: 'bg-[#B434A4] text-white hover:bg-fuchsia-400' },
        teal: { border: 'border-teal-400', shadow: '#2dd4bf', icon: 'text-teal-400', progress: 'bg-teal-500', button: 'bg-teal-500 text-white hover:bg-teal-400' },
        cyan: { border: 'border-cyan-400', shadow: '#22d3ee', icon: 'text-cyan-400', progress: 'bg-cyan-500', button: 'bg-cyan-500 text-black hover:bg-cyan-400' },
        blue: { border: 'border-blue-400', shadow: '#60a5fa', icon: 'text-blue-400', progress: 'bg-blue-500', button: 'bg-blue-500 text-white hover:bg-blue-400' },
        pink: { border: 'border-pink-400', shadow: '#f472b6', icon: 'text-pink-400', progress: 'bg-pink-500', button: 'bg-pink-500 text-white hover:bg-pink-400' },
    };
    return colorMap[color] || colorMap.blue;
};


const DashboardPaymentItem = ({ payment, onEdit, onDelete, onContribute }: DashboardPaymentItemProps) => {
  const { id, name, amount, paidAmount, dueDate, category, frequency, color } = payment;
  const isCovered = paidAmount >= amount;
  const progress = amount > 0 ? Math.min((paidAmount / amount) * 100, 100) : 0;
  const remainingAmount = Math.max(0, amount - paidAmount);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { timeProgress, timeBarColorClass } = useMemo(() => {
    if (isCovered) return { timeProgress: 0, timeBarColorClass: 'bg-gray-500' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let totalPeriod;
    switch (frequency) {
      case Frequency.Weekly: totalPeriod = 7; break;
      case Frequency.BiWeekly: totalPeriod = 14; break;
      case Frequency.Monthly: totalPeriod = 30; break;
      case Frequency.Annual: totalPeriod = 365; break;
      default: totalPeriod = 30; break;
    }

    const daysElapsed = Math.max(0, totalPeriod - daysLeft);
    const progress = totalPeriod > 0 ? (daysElapsed / totalPeriod) * 100 : 100;
    const finalProgress = Math.min(100, Math.max(0, progress));

    let barColor = 'bg-green-500';
    if (finalProgress >= 80) barColor = 'bg-red-500';
    else if (finalProgress >= 50) barColor = 'bg-amber-500';
    
    return { timeProgress: finalProgress, timeBarColorClass: barColor };
  }, [dueDate, isCovered, frequency]);

  const { urgencyText, styles, isUrgent } = useMemo(() => {
    const s = getPaymentColorStyles(color);
    if (isCovered) return { urgencyText: null, styles: s, isUrgent: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let text = null;
    let urgent = false;
    if (diffDays < 0) {
      text = 'Vencido';
    } else if (diffDays <= 3) {
      text = 'Vence Pronto';
      urgent = true; 
    }
    
    return { urgencyText: text, styles: s, isUrgent: urgent };
  }, [dueDate, isCovered, color]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cardClasses = `bg-white dark:bg-[#202331] rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 border ${isCovered ? 'border-gray-200 dark:border-gray-700 opacity-70 dark:opacity-60 bg-gray-100' : styles.border} ${isUrgent ? 'animate-soft-glow' : ''}`;
  const cardStyles = isUrgent ? { '--glow-color': `${styles.shadow}90` } as React.CSSProperties : {};
  
  return (
    <div className={cardClasses} style={cardStyles}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-black/20">
            <WalletIcon className={`w-6 h-6 ${isCovered ? 'text-gray-500' : styles.icon}`} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isCovered ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">{category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {urgencyText && !isCovered && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-[#4A3B2B] text-amber-800 dark:text-[#D49D4B]">
              {urgencyText}
            </span>
          )}
          <button onClick={() => onDelete(id)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white p-1 rounded-full transition-colors">
            <TrashIcon className="w-5 h-5" />
          </button>
          {!isCovered && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white p-1 rounded-full transition-colors">
                <DotsVerticalIcon className="w-5 h-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#2A2D3A] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                  <button onClick={() => { onEdit(payment); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer rounded-md">Editar</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{formatCurrency(paidAmount)}</span>
          <span>{formatCurrency(amount)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-black/30 rounded-full h-1.5">
          <div className={`${isCovered ? 'bg-green-500' : styles.progress} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
          Restante: {formatCurrency(remainingAmount)}
        </p>
        
        {!isCovered && (
            <div className="mt-2">
                 <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Inicio del periodo</span>
                    <span>Vencimiento</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-black/30 rounded-full h-1.5">
                    <div className={`${timeBarColorClass} h-1.5 rounded-full`} style={{ width: `${timeProgress}%` }}></div>
                </div>
            </div>
        )}
      </div>

      <div className="flex justify-between items-end mt-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{getDueDateInfoText(dueDate, isCovered)}</p>
          <p>Fecha Límite: {formatDate(dueDate)}</p>
          <p>Frecuencia: {frequency}</p>
        </div>
        {isCovered ? (
          <div className="text-center font-semibold py-2 px-6 rounded-lg text-sm bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
            <CheckCircle2Icon className="w-5 h-5"/> ¡Pagado!
          </div>
        ) : (
          <button onClick={() => onContribute(payment)} className={`text-center font-semibold py-2 px-6 rounded-lg transition-colors text-sm ${styles.button}`}>
            Abonar
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardPaymentItem;