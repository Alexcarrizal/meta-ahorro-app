import React, { useMemo } from 'react';
import { Payment } from '../types.ts';
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
  const { name, amount, paidAmount, dueDate } = payment;
  const isPaid = paidAmount >= amount;
  const remainingAmount = amount - paidAmount;

  const {
    statusIcon,
    iconColor,
    statusText,
    statusColor,
    borderColor,
  } = useMemo(() => {
    if (isPaid) {
      return {
        statusIcon: <CheckCircle2Icon className="w-6 h-6" />,
        iconColor: 'text-green-500 dark:text-green-400',
        statusText: 'Pagado',
        statusColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-gray-200 dark:border-gray-700'
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        statusIcon: <AlertTriangleIcon className="w-6 h-6" />,
        iconColor: 'text-red-500 dark:text-red-400',
        statusText: `Vencido hace ${Math.abs(diffDays)} día(s)`,
        statusColor: 'text-red-500 dark:text-red-400',
        borderColor: 'border-red-500/50'
      };
    }
    if (diffDays <= 3) {
      return {
        statusIcon: <AlertTriangleIcon className="w-6 h-6" />,
        iconColor: 'text-amber-500 dark:text-amber-400',
        statusText: diffDays === 0 ? 'Vence hoy' : `Vence en ${diffDays} día(s)`,
        statusColor: 'text-amber-500 dark:text-amber-400',
        borderColor: 'border-amber-500/50'
      };
    }
    
    // Default case (more than 3 days left)
    return {
      statusIcon: <WalletIcon className="w-6 h-6" />,
      iconColor: 'text-sky-500 dark:text-sky-400',
      statusText: `Vence en ${diffDays} días`,
      statusColor: 'text-gray-500 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-700/80 hover:border-sky-400 dark:hover:border-sky-500/50'
    };
  }, [isPaid, dueDate]);

  const buttonColor = useMemo(() => {
      if (isPaid) return '';
      if (borderColor.includes('red')) return 'bg-red-500 hover:bg-red-600 text-white';
      if (borderColor.includes('amber')) return 'bg-amber-500 hover:bg-amber-600 text-black';
      return 'bg-sky-500 hover:bg-sky-600 text-black';
  }, [borderColor, isPaid]);

  return (
    <div className={`bg-white dark:bg-gray-800/50 border rounded-lg p-3 transition-all duration-300 ${borderColor} ${isPaid ? 'opacity-70' : ''}`}>
        <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex-shrink-0 ${iconColor}`}>
                    {statusIcon}
                </div>
                <div className="overflow-hidden">
                    <h4 title={name} className={`font-bold text-gray-900 dark:text-white truncate ${isPaid ? 'line-through' : ''}`}>{name}</h4>
                    <p className={`text-sm font-semibold ${statusColor}`}>{statusText}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                    <p className={`font-semibold text-base text-gray-900 dark:text-white ${isPaid ? 'line-through' : ''}`}>
                        {formatCurrency(amount)}
                    </p>
                    {!isPaid && paidAmount > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Restante: {formatCurrency(remainingAmount)}
                        </p>
                    )}
                </div>
                {isPaid ? (
                    <div className="hidden sm:flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold text-sm px-3 py-1.5 rounded-md bg-green-500/10">
                        <CheckCircle2Icon className="w-4 h-4" />
                        <span>Pagado</span>
                    </div>
                ) : (
                    <button
                        onClick={() => onContribute(payment)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${buttonColor}`}>
                        Abonar
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default DashboardPaymentItem;