import React, { useState, useMemo } from 'react';
import { Payment, SavingsGoal } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarViewProps {
    payments: Payment[];
    goals: SavingsGoal[];
    onDayClick: (date: Date) => void;
}

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const tailwindColorClasses: { [key: string]: string } = {
    // Goal Colors
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    // Payment Colors
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
    lime: 'bg-lime-500',
    fuchsia: 'bg-fuchsia-500',
    pink: 'bg-pink-500',
};

const CalendarView = ({ payments, goals, onDayClick }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const events = useMemo(() => {
        const paymentEvents = payments
            .filter(p => p.paidAmount < p.amount)
            .map(p => ({
                id: `p-${p.id}`,
                date: new Date(p.dueDate + 'T00:00:00'),
                title: p.name,
                color: p.color,
                type: 'payment' as const
            }));
        
        const goalEvents = goals
            .filter(g => g.projection?.targetDate)
            .map(g => ({
                id: `g-${g.id}`,
                date: new Date(g.projection!.targetDate + 'T00:00:00'),
                title: g.name,
                color: g.color,
                type: 'goal' as const
            }));

        return [...paymentEvents, ...goalEvents];
    }, [payments, goals]);

    const calendarGrid = useMemo(() => {
        const days = [];
        const startingDay = firstDayOfMonth.getDay();

        // Add blank days for the start of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        return days;
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-center">
                    {currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {WEEK_DAYS.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="border border-transparent"></div>;
                    
                    const today = new Date();
                    const isToday = isSameDay(day, today);
                    const eventsOnDay = events.filter(event => isSameDay(event.date, day));

                    return (
                        <div 
                            key={day.toString()} 
                            className="relative aspect-square border border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md cursor-pointer transition-colors p-1 flex flex-col"
                            onClick={() => onDayClick(day)}
                        >
                            <span className={`flex items-center justify-center text-xs font-medium h-5 w-5 rounded-full ${isToday ? 'bg-emerald-500 text-white' : ''}`}>
                                {day.getDate()}
                            </span>
                            <div className="flex-grow overflow-y-auto mt-1 space-y-0.5">
                                {eventsOnDay.slice(0, 2).map(event => (
                                    <div key={event.id} className="flex items-center gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${tailwindColorClasses[event.color] || 'bg-gray-400'}`}></div>
                                        <p className="text-xs truncate text-left text-gray-700 dark:text-gray-300">{event.title}</p>
                                    </div>
                                ))}
                                {eventsOnDay.length > 2 && (
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">+ {eventsOnDay.length - 2} más</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;