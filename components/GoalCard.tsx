
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SavingsGoal, Frequency, Priority } from '../types';
import { LaptopIcon, DotsVerticalIcon, TrashIcon } from './icons';

interface GoalCardProps {
  goal: SavingsGoal;
  onConfigure: (goal: SavingsGoal) => void;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: SavingsGoal) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

const getPriorityClass = (priority: Priority) => {
  switch (priority) {
    case Priority.High:
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case Priority.Medium:
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case Priority.Low:
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
};

const getGoalColorStyles = (color: string) => {
    const colorMap: { [key: string]: { [key: string]: string } } = {
        emerald: {
            border: 'border-emerald-800/40 hover:border-emerald-500/50',
            completedBorder: 'border-emerald-500',
            iconText: 'text-emerald-400',
            progressBar: 'bg-emerald-500',
            category: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            projectionBg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            projectionText: 'text-emerald-300',
            projectionSubText: 'text-emerald-400',
            projectionEditText: 'text-emerald-300',
            contributeButton: 'bg-emerald-500 hover:bg-emerald-400 text-black',
            completedText: 'text-emerald-300',
            completedBg: 'bg-emerald-500/20',
        },
        sky: {
            border: 'border-sky-800/40 hover:border-sky-500/50',
            completedBorder: 'border-sky-500',
            iconText: 'text-sky-400',
            progressBar: 'bg-sky-500',
            category: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
            projectionBg: 'bg-sky-500/10 hover:bg-sky-500/20',
            projectionText: 'text-sky-300',
            projectionSubText: 'text-sky-400',
            projectionEditText: 'text-sky-300',
            contributeButton: 'bg-sky-500 hover:bg-sky-400 text-black',
            completedText: 'text-sky-300',
            completedBg: 'bg-sky-500/20',
        },
        amber: {
            border: 'border-amber-800/40 hover:border-amber-500/50',
            completedBorder: 'border-amber-500',
            iconText: 'text-amber-400',
            progressBar: 'bg-amber-500',
            category: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            projectionBg: 'bg-amber-500/10 hover:bg-amber-500/20',
            projectionText: 'text-amber-300',
            projectionSubText: 'text-amber-400',
            projectionEditText: 'text-amber-300',
            contributeButton: 'bg-amber-500 hover:bg-amber-400 text-black',
            completedText: 'text-amber-300',
            completedBg: 'bg-amber-500/20',
        },
        rose: {
            border: 'border-rose-800/40 hover:border-rose-500/50',
            completedBorder: 'border-rose-500',
            iconText: 'text-rose-400',
            progressBar: 'bg-rose-500',
            category: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            projectionBg: 'bg-rose-500/10 hover:bg-rose-500/20',
            projectionText: 'text-rose-300',
            projectionSubText: 'text-rose-400',
            projectionEditText: 'text-rose-300',
            contributeButton: 'bg-rose-500 hover:bg-rose-400 text-black',
            completedText: 'text-rose-300',
            completedBg: 'bg-rose-500/20',
        },
        indigo: {
            border: 'border-indigo-800/40 hover:border-indigo-500/50',
            completedBorder: 'border-indigo-500',
            iconText: 'text-indigo-400',
            progressBar: 'bg-indigo-500',
            category: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            projectionBg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
            projectionText: 'text-indigo-300',
            projectionSubText: 'text-indigo-400',
            projectionEditText: 'text-indigo-300',
            contributeButton: 'bg-indigo-500 hover:bg-indigo-400 text-white',
            completedText: 'text-indigo-300',
            completedBg: 'bg-indigo-500/20',
        },
        purple: {
            border: 'border-purple-800/40 hover:border-purple-500/50',
            completedBorder: 'border-purple-500',
            iconText: 'text-purple-400',
            progressBar: 'bg-purple-500',
            category: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            projectionBg: 'bg-purple-500/10 hover:bg-purple-500/20',
            projectionText: 'text-purple-300',
            projectionSubText: 'text-purple-400',
            projectionEditText: 'text-purple-300',
            contributeButton: 'bg-purple-500 hover:bg-purple-400 text-white',
            completedText: 'text-purple-300',
            completedBg: 'bg-purple-500/20',
        },
    };
    return colorMap[color] || colorMap.emerald;
};


const GoalCard = ({ goal, onConfigure, onEdit, onDelete, onContribute }: GoalCardProps) => {
  const { name, targetAmount, savedAmount, category, priority, projection, color } = goal;
  const progress = targetAmount > 0 ? Math.min((savedAmount / targetAmount) * 100, 100) : 0;
  const remainingAmount = targetAmount - savedAmount;
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const styles = getGoalColorStyles(color);

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

  const projectionText = useMemo(() => {
    if (!projection || savedAmount >= targetAmount) return null;
    
    const { amount, frequency, targetDate } = projection;

    if (!targetDate) { // Fallback for old projection model, if any
      if (amount <= 0) return null;
      const remaining = targetAmount - savedAmount;
      const periods = Math.ceil(remaining / amount);
      let timeUnit = '';
      switch(frequency) {
          case Frequency.Weekly: timeUnit = periods === 1 ? 'semana' : 'semanas'; break;
          case Frequency.BiWeekly: timeUnit = periods === 1 ? 'quincena' : 'quincenas'; break;
          case Frequency.Monthly: timeUnit = periods === 1 ? 'mes' : 'meses'; break;
      }
      return `Alcanzarás tu meta en ${periods} ${timeUnit}.`;
    }
    
    const formattedDate = new Date(targetDate);
    formattedDate.setMinutes(formattedDate.getMinutes() + formattedDate.getTimezoneOffset());

    const dateString = formattedDate.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedAmount = formatCurrency(amount);

    return `Ahorrando ${formattedAmount} de forma ${frequency.toLowerCase()}, alcanzarás tu meta para el ${dateString}.`;
  }, [goal]);
  
  const isCompleted = savedAmount >= targetAmount;

  return (
    <div className={`bg-gray-800/50 border rounded-xl p-6 flex flex-col justify-between transition-all duration-300 ${styles.border} ${isCompleted ? styles.completedBorder : ''}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-700 p-3 rounded-lg">
              <LaptopIcon className={`w-6 h-6 ${styles.iconText}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{name}</h3>
              <p className="text-sm text-gray-400">{formatCurrency(targetAmount)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(goal.id)} className="text-gray-500 hover:text-red-400 p-1 rounded-full transition-colors">
              <TrashIcon className="w-5 h-5" />
            </button>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-white p-1 rounded-full transition-colors">
                <DotsVerticalIcon className="w-5 h-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                  <button onClick={() => { onEdit(goal); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer rounded-md">Editar</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progreso</span>
            <span>{formatCurrency(savedAmount)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className={`${styles.progressBar} h-2.5 rounded-full`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-gray-400 mt-1">
            Restante: {formatCurrency(remainingAmount)}
          </p>
        </div>

        {isCompleted ? (
            <div className={`text-center py-3 rounded-md mb-4 ${styles.completedBg}`}>
                <p className={`font-bold ${styles.completedText}`}>¡Meta Alcanzada!</p>
            </div>
        ) : (
            <div className="space-y-4 mb-4">
                {projectionText ? (
                    <button onClick={() => onConfigure(goal)} className={`text-sm p-3 rounded-md text-left w-full cursor-pointer transition-colors ${styles.projectionBg}`}>
                      <p className={`font-semibold ${styles.projectionText}`}>Plan de ahorro:</p>
                      <p className={`text-xs ${styles.projectionSubText}`}>{projectionText}</p>
                      <p className={`text-xs font-bold mt-2 text-center ${styles.projectionEditText}`}>Editar Proyección</p>
                    </button>
                ) : (
                    <button onClick={() => onConfigure(goal)} className="w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                      Configura tu ahorro para ver una proyección
                    </button>
                )}
                 <button onClick={() => onContribute(goal)} className={`w-full text-center font-bold py-2 px-4 rounded-lg transition-colors ${styles.contributeButton}`}>
                    Abonar
                </button>
            </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles.category}`}>
          {category}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getPriorityClass(priority)}`}>
          {priority}
        </span>
      </div>
    </div>
  );
};

export default GoalCard;
