
import React from 'react';
import { Payment } from '../types.ts';
import { WalletIcon } from './icons.tsx';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

const getDueDateStatus = (dueDate: string): { text: string, colorClass: string, iconColorClass: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Vencido`, colorClass: 'text-red-500 dark:text-red-400', iconColorClass: 'bg-red-500/10 text-red-500' };
    if (diffDays === 0) return { text: 'Vence Hoy', colorClass: 'text-amber-500 dark:text-amber-400', iconColorClass: 'bg-amber-500/10 text-amber-500' };
    if (diffDays <= 7) return { text: `Vence en ${diffDays}d`, colorClass: 'text-amber-500 dark:text-amber-400', iconColorClass: 'bg-amber-500/10 text-amber-500' };
    return { text: `Vence en ${diffDays}d`, colorClass: 'text-gray-500 dark:text-gray-400', iconColorClass: 'bg-gray-100 dark:bg-gray-700 text-gray-500' };
};

interface DashboardPaymentItemProps {
    payment: Payment;
    onClick: () => void;
}

export const DashboardPaymentItem = ({ payment, onClick }: DashboardPaymentItemProps) => {
    const status = getDueDateStatus(payment.dueDate);
    const remainingAmount = payment.amount - payment.paidAmount;

    return (
        <li
            onClick={onClick}
            className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
            role="button"
            aria-label={`Ver detalles del pago ${payment.name}`}
        >
            <div className="flex items-center gap-4 truncate">
                <div className={`p-3 rounded-lg ${status.iconColorClass}`}>
                    <WalletIcon className="w-6 h-6" />
                </div>
                <div className="truncate">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{payment.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.category}
                    </p>
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(remainingAmount)}</p>
                <p className={`font-semibold text-sm ${status.colorClass}`}>{status.text}</p>
            </div>
        </li>
    );
};
