import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Payment, Frequency } from '../types.ts';
import { WalletIcon, DotsVerticalIcon, TrashIcon, CheckCircle2Icon } from './icons.tsx';

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
        return { text: 'Vence hoy', className: 'text-orange-500 dark:text-orange-400 font-semibold' };
    }
    return { text: `Vence en ${diffDays} días`, className: 'text-gray-500 dark:text-gray-400' };
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

const PaymentCard = ({ payment, onEdit, onDelete, onContribute }: PaymentCardProps) => {
  const { id, name, amount, paidAmount, dueDate, category, frequency, color } = payment;
  const isCovered = paidAmount >= amount;
  const progress = amount > 0 ? Math.min((paidAmount / amount) * 100, 100) : 0;
  const remainingAmount = Math.max(0, amount - paidAmount);

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
  
    const { timeProgress, timeBarColorClass } = useMemo(() => {
        if (isCovered) return { timeProgress: 100, timeBarColorClass: 'bg-green-500' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate + 'T00:00:00');
        const diffTime = due.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let totalPeriod;
        switch (frequency) {
            case Frequency.Weekly: totalPeriod = 7; break;
            case Frequency.BiWeekly: totalPeriod = 14; break;
            case Frequency.Monthly: totalPeriod = 30; break;
            case Frequency.Annual: totalPeriod = 365; break;
            default: totalPeriod = daysLeft > 0 ? daysLeft + 1 : 30; break;
        }

        const daysElapsed = Math.max(0, totalPeriod - daysLeft);
        const progress = totalPeriod > 0 ? Math.min(100, (daysElapsed / totalPeriod) * 100) : 100;

        let barColor = 'bg-green-500';
        if (daysLeft <= 3) barColor = 'bg-red-500';
        else if (daysLeft <= 10) barColor = 'bg-orange-500';

        return { timeProgress: progress, timeBarColorClass: barColor };
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


    if (isCovered) {
        return (
            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 border border-gray-300 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-300 dark:bg-gray-700 p-3 rounded-lg">
                      <WalletIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 line-through">{name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onDelete(payment.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span>{formatCurrency(paidAmount)}</span>
                        <span>{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: `100%` }}></div>
                    </div>
                    <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Restante: {formatCurrency(0)}
                    </p>
                </div>

                <div className="space-y-1 mb-4">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        Pago Cubierto
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fecha de Pago: {formatDate(dueDate)}
                    </p>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Frecuencia: {frequency}</p>
                </div>

                <div className="mt-auto">
                    <div className="text-center py-2 px-6 rounded-lg text-sm bg-green-500/20 text-green-700 dark:bg-green-500/20 dark:text-green-300 font-semibold flex items-center justify-center gap-2">
                         <CheckCircle2Icon className="w-5 h-5"/> ¡Pagado!
                    </div>
                </div>
            </div>
        );
    }
    
    const cardClasses = `bg-[#202331] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 border ${styles.border} ${isUrgent ? 'animate-soft-glow' : ''}`;
    const cardStyles = isUrgent ? { '--glow-color': `${styles.shadow}90` } as React.CSSProperties : {};

    return (
        <div className={cardClasses} style={cardStyles}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-black/20 p-3 rounded-lg">
                  <WalletIcon className={`w-6 h-6 ${styles.icon}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{name}</h3>
                  <p className="text-sm text-gray-400">{category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {urgencyText && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#4A3B2B] text-[#D49D4B]">
                        {urgencyText}
                    </span>
                )}
                <button onClick={() => onDelete(id)} className="text-gray-400 hover:text-white p-1 rounded-full transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white p-1 rounded-full transition-colors">
                    <DotsVerticalIcon className="w-5 h-5" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-[#2A2D3A] border border-gray-700 rounded-md shadow-lg z-10">
                      <button onClick={() => { onEdit(payment); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 cursor-pointer rounded-md">Editar</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{formatCurrency(paidAmount)}</span>
                    <span>{formatCurrency(amount)}</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3">
                    <div className={`${styles.progress} h-3 rounded-full`} style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right text-sm text-gray-400 mt-1">
                    Restante: {formatCurrency(remainingAmount)}
                </p>
            </div>
            
            <div className="mb-4">
                 <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Inicio del periodo</span>
                    <span>Vencimiento</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-1.5">
                    <div className={`${timeBarColorClass} h-1.5 rounded-full`} style={{ width: `${timeProgress}%` }}></div>
                </div>
            </div>

            <div className="flex justify-between items-end mt-auto">
                <div className="text-sm text-gray-400 leading-tight">
                    <p className="font-semibold text-white">{getDueDateInfo(dueDate, false).text}</p>
                    <p>Fecha Límite: {formatDate(dueDate)}</p>
                    <p>Frecuencia: {frequency}</p>
                </div>
                <button onClick={() => onContribute(payment)} className={`text-center font-semibold py-3 px-8 rounded-lg transition-colors ${styles.button}`}>
                    Abonar
                </button>
            </div>
        </div>
    );
};

export default PaymentCard;