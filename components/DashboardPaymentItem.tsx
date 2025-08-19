
import React, { useMemo } from 'react';
import { Payment, Frequency } from '../types.ts';
import { WalletIcon, CheckCircle2Icon, AlertTriangleIcon } from './icons.tsx';

interface DashboardPaymentItemProps {
  payment: Payment;
  onContribute: (payment: Payment) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
};

const DashboardPaymentItem = ({ payment, onContribute }: DashboardPaymentItemProps) => {
  const { name, amount, paidAmount, dueDate, frequency } = payment;
  const isPaid = paidAmount >= amount;

  const {
    progress,
    daysRemainingText,
    statusText,
    statusColor,
    progressColor,
    borderColor
  } = useMemo(() => {
    if (isPaid) {
      return {
        progress: 100,
        daysRemainingText: 'Completado',
        statusText: 'Pagado',
        statusColor: 'text-green-600 dark:text-green-400',
        progressColor: 'bg-green-500',
        borderColor: 'border-gray-200 dark:border-gray-700'
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let cycleStartDate = new Date(due);
    let cycleLengthDays = 30;

    switch (frequency) {
        case Frequency.Weekly:
            cycleStartDate.setDate(due.getDate() - 7);
            cycleLengthDays = 7;
            break;
        case Frequency.BiWeekly:
            cycleStartDate.setDate(due.getDate() - 14);
            cycleLengthDays = 14;
            break;
        case Frequency.Monthly:
            cycleStartDate.setMonth(due.getMonth() - 1);
            const tempDate = new Date(due);
            tempDate.setDate(0);
            cycleLengthDays = tempDate.getDate();
            break;
        case Frequency.Annual:
            cycleStartDate.setFullYear(due.getFullYear() - 1);
            cycleLengthDays = (new Date(due.getFullYear(), 1, 29).getDate() === 29 || new Date(cycleStartDate.getFullYear(), 1, 29).getDate() === 29) ? 366 : 365;
            break;
        case Frequency.OneTime:
        default:
            cycleStartDate = new Date();
            cycleStartDate.setDate(due.getDate() - 30);
            cycleLengthDays = 30;
            break;
    }

    const elapsed = today.getTime() - cycleStartDate.getTime();
    const elapsedDays = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)));
    const currentProgress = Math.min(100, (elapsedDays / cycleLengthDays) * 100);

    let currentStatusText = `Vence en ${diffDays} días`;
    let currentDaysRemainingText = `${diffDays} días restantes`;
    let currentStatusColor = 'text-gray-500 dark:text-gray-400';
    let currentProgressColor = 'bg-sky-500';
    let currentBorderColor = 'border-gray-200 dark:border-gray-700/80 hover:border-sky-400 dark:hover:border-sky-500/50';

    if (diffDays < 0) {
      currentStatusText = `Vencido hace ${Math.abs(diffDays)} día(s)`;
      currentDaysRemainingText = `Vencido`;
      currentStatusColor = 'text-red-500 dark:text-red-400';
      currentProgressColor = 'bg-red-500';
      currentBorderColor = 'border-red-500/50';
    } else if (diffDays <= 3) {
        currentStatusText = diffDays === 0 ? 'Vence hoy' : `Vence en ${diffDays} día(s)`;
        currentDaysRemainingText = diffDays === 0 ? 'Vence hoy' : `${diffDays} días restantes`;
        currentStatusColor = 'text-red-500 dark:text-red-400';
        currentProgressColor = 'bg-red-500';
        currentBorderColor = 'border-red-500/50';
    } else if (diffDays <= 7) {
      currentStatusText = `Vence en ${diffDays} día(s)`;
      currentDaysRemainingText = `${diffDays} días restantes`;
      currentStatusColor = 'text-amber-500 dark:text-amber-400';
      currentProgressColor = 'bg-amber-500';
      currentBorderColor = 'border-amber-500/50';
    }
    
    return {
      progress: currentProgress,
      daysRemainingText: currentDaysRemainingText,
      statusText: currentStatusText,
      statusColor: currentStatusColor,
      progressColor: currentProgressColor,
      borderColor: currentBorderColor
    };
  }, [payment]);

  const buttonColor = useMemo(() => {
      if (isPaid) return '';
      if (borderColor.includes('red')) return 'bg-red-500 hover:bg-red-600 text-white';
      if (borderColor.includes('amber')) return 'bg-amber-500 hover:bg-amber-600 text-black';
      return 'bg-sky-500 hover:bg-sky-600 text-black';
  }, [borderColor, isPaid]);

  return (
    <div className={`bg-white dark:bg-gray-800/50 border rounded-xl p-4 transition-all duration-300 ${borderColor} ${isPaid ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`font-bold text-gray-900 dark:text-white ${isPaid ? 'line-through' : ''}`}>{name}</h4>
          <p className={`text-sm font-semibold ${statusColor}`}>{statusText}</p>
        </div>
        <div className="text-right">
            <p className={`font-bold text-lg text-gray-900 dark:text-white ${isPaid ? 'line-through' : ''}`}>
                {formatCurrency(amount)}
            </p>
            {!isPaid && paidAmount > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400">
                    Abonado: {formatCurrency(paidAmount)}
                </p>
            )}
        </div>
      </div>
      
      {!isPaid && (
        <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progreso del ciclo</span>
                <span>{daysRemainingText}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                className={`${progressColor} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      )}
      
      {isPaid ? (
          <div className="flex items-center justify-center gap-2 text-center py-2 rounded-lg bg-green-500/10 text-green-700 dark:text-green-300 font-bold">
              <CheckCircle2Icon className="w-5 h-5"/>
              <span>¡Pago Cubierto!</span>
          </div>
      ) : (
          <button 
              onClick={() => onContribute(payment)} 
              className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors ${buttonColor}`}>
              Abonar
          </button>
      )}

    </div>
  );
};

export default DashboardPaymentItem;
