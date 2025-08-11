
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
    const date = new Date(dateString);
    // Adjust for timezone offset to display the correct date as entered by the user
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

const PaymentCard = ({ payment, onTogglePaid, onEdit, onDelete }: PaymentCardProps) => {
  const { id, name, amount, dueDate, category, frequency, isPaid } = payment;
  const today = new Date();
  today.setHours(0,0,0,0);
  const isOverdue = new Date(dueDate) < today && !isPaid;

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
    <div className={`bg-gray-800/50 border border-sky-800/40 rounded-xl p-6 flex flex-col justify-between hover:border-sky-500/50 transition-all duration-300 ${isPaid ? 'opacity-50' : ''}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-700 p-3 rounded-lg">
              <WalletIcon className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{name}</h3>
              <p className="text-sm text-gray-400">{category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(payment.id)} className="text-gray-500 hover:text-red-400 p-1 rounded-full transition-colors">
              <TrashIcon className="w-5 h-5" />
            </button>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-white p-1 rounded-full transition-colors">
                <DotsVerticalIcon className="w-5 h-5" />
              </button>
              {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                      <button onClick={() => { onEdit(payment); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer rounded-md">Editar</button>
                  </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
            <p className="text-2xl font-bold text-white">{formatCurrency(amount)}</p>
            <p className={`text-sm ${isOverdue ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                Vence: {formatDate(dueDate)}
            </p>
            <p className="text-sm text-gray-400">Frecuencia: {frequency}</p>
        </div>
      </div>
      
      <div className="mt-auto">
         <button 
            onClick={() => onTogglePaid(id)} 
            className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors ${isPaid ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-sky-500 text-black hover:bg-sky-400'}`}>
            {isPaid ? 'Marcar como No Pagado' : 'Marcar como Pagado'}
         </button>
      </div>
    </div>
  );
};

export default PaymentCard;
