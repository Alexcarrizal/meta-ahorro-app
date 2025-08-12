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

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

interface MonthProps {
    monthDate: Date;
    events: { id: string; date: Date; title: string; color: string; type: 'payment' | 'goal' }[];
    onDayClick: (date: Date) => void;
}

const Month = ({ monthDate, events, onDayClick }: MonthProps) => {
    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const days = [];
        const startingDay = firstDayOfMonth.getDay();

        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), i));
        }
        return days;
    }, [monthDate]);

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
                {monthDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
            </h3>
            <div className="grid grid-cols-7 text-center text-base font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {WEEK_DAYS.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 flex-grow">
                {calendarGrid.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="border-t border-gray-200 dark:border-gray-700/20"></div>;
                    
                    const today = new Date();
                    const isToday = isSameDay(day, today);
                    const eventsOnDay = events.filter(event => isSameDay(event.date, day));

                    return (
                        <div 
                            key={day.toString()} 
                            className="relative border-t border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors p-3 flex flex-col min-h-[12rem]"
                            onClick={() => onDayClick(day)}
                        >
                            <span className={`flex items-center justify-center text-base font-medium h-8 w-8 rounded-full ${isToday ? 'bg-emerald-500 text-white' : 'dark:text-white'}`}>
                                {day.getDate()}
                            </span>
                            <div className="flex-grow overflow-y-auto mt-3 space-y-1.5">
                                {eventsOnDay.slice(0, 4).map(event => (
                                    <div key={event.id} className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${tailwindColorClasses[event.color] || 'bg-gray-400'}`}></div>
                                        <p className="text-sm truncate text-left text-gray-700 dark:text-gray-300">{event.title}</p>
                                    </div>
                                ))}
                                {eventsOnDay.length > 4 && (
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">+ {eventsOnDay.length - 4} más</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CalendarView = ({ payments, goals, onDayClick }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date(new Date().setDate(1)));

    const nextMonthDate = useMemo(() => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }, [currentDate]);

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

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md w-full">
            <div className="flex justify-between items-center mb-6 px-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
                    Calendario
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                <Month monthDate={currentDate} events={events} onDayClick={onDayClick} />
                <Month monthDate={nextMonthDate} events={events} onDayClick={onDayClick} />
            </div>
        </div>
    );
};

export default CalendarView;