

import React, { useState, useRef, useEffect } from 'react';
import { WishlistItem, Priority } from '../types.ts';
import { ClipboardListIcon, DotsVerticalIcon, TrashIcon, ArrowUpCircleIcon, LinkIcon } from './icons.tsx';

interface WishlistCardProps {
    item: WishlistItem;
    onEdit: (item: WishlistItem) => void;
    onDelete: (id: string) => void;
    onMoveToGoal: (item: WishlistItem) => void;
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
            return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20 dark:border-red-500/30';
        case Priority.Medium:
            return 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-500/20 dark:border-yellow-500/30';
        case Priority.Low:
            return 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20 dark:border-green-500/30';
        default:
            return 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-500/20 dark:border-gray-500/30';
    }
};

const WishlistCard = ({ item, onEdit, onDelete, onMoveToGoal }: WishlistCardProps) => {
    const { id, name, category, priority, estimatedAmount, url, distributor } = item;
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
        <div className="bg-white dark:bg-gray-800/50 border border-indigo-200 dark:border-indigo-800/40 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-xl p-6 flex flex-col justify-between transition-all duration-300">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                            <ClipboardListIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
                            {estimatedAmount && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Estimado: {formatCurrency(estimatedAmount)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white p-1 rounded-full transition-colors">
                            <DotsVerticalIcon className="w-5 h-5" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                                <button onClick={() => { onEdit(item); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-t-md">Editar Deseo</button>
                                <button onClick={() => { onDelete(id); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer rounded-b-md">Eliminar Deseo</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/30">
                        {category}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getPriorityClass(priority)}`}>
                        {priority}
                    </span>
                    {distributor && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20 dark:border-gray-500/30">
                            {distributor}
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-auto space-y-2">
                 {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 text-center font-semibold py-2 px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LinkIcon className="w-5 h-5" />
                        Ver Producto
                    </a>
                )}
                <button
                    onClick={() => onMoveToGoal(item)}
                    className="w-full flex items-center justify-center gap-2 text-center font-semibold py-2 px-4 rounded-lg transition-colors bg-indigo-500 hover:bg-indigo-600 text-white">
                    <ArrowUpCircleIcon className="w-5 h-5" />
                    Convertir a Meta
                </button>
            </div>
        </div>
    );
};

export default WishlistCard;