
import React, { useMemo } from 'react';
import { Payment } from '../types';
import { WalletIcon, CheckCircle2Icon, AlertTriangleIcon } from './icons';

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
  const { name, amount, paidAmount, dueDate, category } = payment;

  const { status, icon, textColor, bgColor, borderColor, buttonColor, showButton } = useMemo(() => {
    const isPaid = paidAmount >= amount;
    if (isPaid) {
      return {
        status: 'Pagado',
        icon: <CheckCircle2Icon className="w-6 h-6 text-green-500" />,
        textColor: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800/50 opacity-60',
        borderColor: 'border-gray-200 dark:border-gray-700',
        buttonColor: '',
        showButton: false,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: `Vencido hace ${Math.abs(diffDays)} día(s)`,
        icon: <AlertTriangleIcon className="w-6 h-6 text-red-500" />,
        textColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/5 dark:bg-red-500/10',
        borderColor: 'border-red-500/50',
        buttonColor: 'bg-red-500 hover:bg-red-600 text-white',
        showButton: true,
      };
    }

    if (diffDays <= 7) {
      const statusText = diffDays === 0 ? 'Vence hoy' : `Vence en ${diffDays} día(s)`;
      return {
        status: statusText,
        icon: <AlertTriangleIcon className="w-6 h-6 text-amber-500" />,
        textColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/5 dark:bg-amber-500/10',
        borderColor: 'border-amber-500/50',
        buttonColor: 'bg-amber-500 hover:bg-amber-600 text-black',
        showButton: true,
      };
    }

    const formattedDate = due.toLocaleDateString('es-MX', { day: '2-digit', month: 'long' });
    return {
      status: `Vence el ${formattedDate}`,
      icon: <WalletIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
      textColor: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800/50',
      borderColor: 'border-gray-200 dark:border-gray-700',
      buttonColor: 'bg-sky-500 hover:bg-sky-600 text-black',
      showButton: true,
    };
  }, [payment]);

  const isPaid = paidAmount >= amount;

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-all ${bgColor} ${borderColor}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <p className={`font-bold text-gray-800 dark:text-gray-200 ${isPaid ? 'line-through' : ''}`}>{name}</p>
          <p className={`text-sm font-medium ${textColor}`}>{status}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
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
        {showButton ? (
          <button
            onClick={() => onContribute(payment)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${buttonColor}`}
          >
            Abonar
          </button>
        ) : (
            <div className="w-[88px] text-center"></div> // Placeholder to keep alignment
        )}
      </div>
    </div>
  );
};

export default DashboardPaymentItem;