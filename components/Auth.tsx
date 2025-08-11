import React, { useState, useEffect } from 'react';
import { DeleteIcon, LockIcon } from './icons';

interface AuthScreenProps {
    hasPin: boolean;
    onSetPin?: (pin: string) => void;
    onUnlockSuccess?: () => void;
    storedPin?: string | null;
    isModalVersion?: boolean;
}

export const AuthScreen = ({ hasPin, onSetPin, onUnlockSuccess, storedPin, isModalVersion = false }: AuthScreenProps) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleDeleteClick = () => {
        setPin(pin.slice(0, -1));
    };

    const handleClearClick = () => {
        setPin('');
    };

    useEffect(() => {
        if (pin.length === 4) {
            if (hasPin) {
                if (pin === storedPin) {
                    onUnlockSuccess?.();
                } else {
                    setError('PIN incorrecto');
                    setPin('');
                }
            } else {
                onSetPin?.(pin);
            }
        }
    }, [pin, hasPin, storedPin, onSetPin, onUnlockSuccess]);

    const PinDots = () => (
        <div className="flex justify-center space-x-4 my-6">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 ${error ? 'border-red-500' : 'border-sky-500'} transition-all duration-200 ${pin.length > i ? (error ? 'bg-red-500' : 'bg-sky-500') : 'bg-transparent'}`}
                />
            ))}
        </div>
    );
    
    const NumberPad = () => {
        const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return (
            <div className="grid grid-cols-3 gap-4">
                {buttons.map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className="p-4 rounded-full text-2xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {num}
                    </button>
                ))}
                <button onClick={handleClearClick} className="p-4 rounded-full text-lg font-bold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">C</button>
                <button onClick={() => handleNumberClick('0')} className="p-4 rounded-full text-2xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">0</button>
                <button onClick={handleDeleteClick} className="p-4 rounded-full flex justify-center items-center bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <DeleteIcon className="w-7 h-7" />
                </button>
            </div>
        );
    }

    const authContent = (
      <div className="w-full max-w-xs mx-auto">
        {!isModalVersion && (
            <div className="text-center mb-8">
                <LockIcon className="mx-auto w-12 h-12 text-sky-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {hasPin ? 'Ingresa tu PIN' : 'Crea un PIN de seguridad'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {hasPin ? 'Para proteger tus datos' : 'De 4 dígitos para acceder a la app'}
                </p>
            </div>
        )}
        <PinDots />
        <NumberPad />
        {error && !isModalVersion && <p className="text-center text-red-500 mt-4 h-6">{error}</p>}
      </div>
    );

    if (isModalVersion) {
        return authContent;
    }
    
    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
            {authContent}
        </div>
    );
};
