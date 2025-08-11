
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SavingsGoal, Payment, Priority, Frequency } from './types';
import { GoalModal, ProjectionModal, PaymentModal, ContributionModal, ConfirmationModal, SettingsModal } from './components/modals';
import GoalCard from './components/GoalCard';
import PaymentCard from './components/PaymentCard';
import { LaptopIcon, WalletIcon, PlusIcon, RefreshCwIcon, CogIcon, SunIcon, MoonIcon } from './components/icons';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 56); // ~8 weeks from now for the projection

const GOAL_COLORS = ['rose', 'sky', 'amber', 'emerald', 'indigo', 'purple'];

const initialGoals: SavingsGoal[] = [
  {
    id: '1',
    name: 'Laptop Gamer',
    targetAmount: 35000,
    savedAmount: 5000,
    category: 'Tecnología',
    priority: Priority.High,
    color: 'rose',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Viaje a Cancún',
    targetAmount: 18000,
    savedAmount: 12000,
    category: 'Viajes',
    priority: Priority.Medium,
    color: 'sky',
    projection: {
        amount: 1500,
        frequency: Frequency.BiWeekly,
        targetDate: futureDate.toISOString().split('T')[0],
    },
    createdAt: new Date(new Date().getTime() - 86400000).toISOString(),
  },
];

const initialPayments: Payment[] = [
    {
        id: 'p1',
        name: 'Renta',
        amount: 8000,
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
        category: 'Vivienda',
        frequency: Frequency.Monthly,
        isPaid: false
    },
    {
        id: 'p2',
        name: 'Plan Celular',
        amount: 450,
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
        category: 'Servicios',
        frequency: Frequency.Monthly,
        isPaid: true
    }
]

type ActiveTab = 'goals' | 'payments';
type ItemToDelete = { id: string; type: 'goal' | 'payment' } | null;
type Theme = 'light' | 'dark';

const PinScreen = ({ onLogin, pinLength = 4 }: { onLogin: (pin: string) => boolean, pinLength?: number }) => {
    const [enteredPin, setEnteredPin] = useState('');
    const [error, setError] = useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleLoginAttempt = useCallback(() => {
        if (!onLogin(enteredPin)) {
            setError('PIN incorrecto. Inténtalo de nuevo.');
            setTimeout(() => {
              setEnteredPin('');
              inputRef.current?.focus();
            }, 700);
        }
    }, [enteredPin, onLogin]);
    
    useEffect(() => {
        if (enteredPin.length === pinLength) {
            handleLoginAttempt();
        }
    }, [enteredPin, pinLength, handleLoginAttempt]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (enteredPin.length === pinLength) {
            handleLoginAttempt();
        }
    };

    const handleKeypadPress = (key: string) => {
        setError('');
        if (key === 'backspace') {
            setEnteredPin(prev => prev.slice(0, -1));
        } else if (enteredPin.length < pinLength) {
            setEnteredPin(prev => prev + key);
        }
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= pinLength) {
            setError('');
            setEnteredPin(value);
        }
    };

    const PinDots = () => (
        <div className="flex justify-center items-center gap-4 my-6">
            {Array.from({ length: pinLength }).map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${i < enteredPin.length ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'} ${error ? 'animate-shake' : ''}`}></div>
            ))}
        </div>
    );
    
    const KeypadButton = ({ value, onClick }: { value: string, onClick: (val: string) => void }) => (
        <button type="button" onClick={() => onClick(value)} className="text-3xl font-semibold text-gray-800 dark:text-white bg-gray-200/50 dark:bg-gray-800/50 rounded-full h-20 w-20 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {value}
        </button>
    );

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col justify-center items-center p-4" onClick={() => inputRef.current?.focus()}>
             <style>{`.animate-shake { animation: shake 0.5s; } @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`}</style>
            
            <form onSubmit={handleSubmit} className="max-w-xs w-full text-center">
                 <input
                    ref={inputRef}
                    type="tel"
                    value={enteredPin}
                    onChange={handleInputChange}
                    maxLength={pinLength}
                    className="opacity-0 w-0 h-0 p-0 m-0 border-0 absolute"
                    aria-label="PIN Input"
                    autoComplete="off"
                 />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meta Ahorro</h1>
                <p className="text-gray-500 dark:text-gray-400">Ingresa tu PIN de acceso</p>
                <PinDots />
                {error && <p className="text-red-500 dark:text-red-400 text-sm h-5">{error}</p>}
                {!error && <div className="h-5"></div>}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {'123456789'.split('').map(key => <KeypadButton key={key} value={key} onClick={handleKeypadPress} />)}
                    <div />
                    <KeypadButton value="0" onClick={handleKeypadPress} />
                    <button type="button" onClick={() => handleKeypadPress('backspace')} className="text-2xl font-semibold text-gray-800 dark:text-white bg-gray-200/50 dark:bg-gray-800/50 rounded-full h-20 w-20 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        &#9003;
                    </button>
                </div>
            </form>
        </div>
    );
};


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAuthenticated') === 'true');
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('goals');
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');

  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isProjectionModalOpen, setProjectionModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isContributionModalOpen, setContributionModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);
  const [goalToProject, setGoalToProject] = useState<SavingsGoal | null>(null);
  const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete>(null);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    let storedPin = localStorage.getItem('appPin');
    if (!storedPin) {
        storedPin = '1234'; // PIN por defecto
        localStorage.setItem('appPin', storedPin);
    }
    setPin(storedPin);
  }, []);

  const handleLogin = (enteredPin: string): boolean => {
    if (enteredPin === pin) {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        return true;
    }
    return false;
  };
  
  const handleChangePin = (oldPin: string, newPin: string): { success: boolean, message: string } => {
    if (oldPin !== pin) {
        return { success: false, message: 'El PIN actual es incorrecto.' };
    }
    localStorage.setItem('appPin', newPin);
    setPin(newPin);
    return { success: true, message: 'PIN actualizado con éxito.' };
  };

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [goals]);

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [payments]);

  const handleSaveGoal = useCallback((goalData: Omit<SavingsGoal, 'savedAmount' | 'createdAt' | 'projection' | 'color'> & { id?: string }) => {
    if (goalData.id) { // Editing
      setGoals(prev => prev.map(g => g.id === goalData.id ? { ...g, ...goalData } : g));
    } else { // Creating
      setGoals(prev => {
        const newGoal: SavingsGoal = {
          id: crypto.randomUUID(),
          savedAmount: 0,
          createdAt: new Date().toISOString(),
          color: GOAL_COLORS[prev.length % GOAL_COLORS.length],
          ...goalData,
        };
        return [newGoal, ...prev];
      });
    }
  }, []);

  const handleOpenEditGoal = useCallback((goal: SavingsGoal) => {
    setGoalToEdit(goal);
    setGoalModalOpen(true);
  }, []);

  const handleDeleteGoal = useCallback((goalId: string) => {
    setItemToDelete({ id: goalId, type: 'goal' });
    setConfirmModalOpen(true);
  }, []);
  
  const handleSaveProjection = useCallback((projectionData: { amount: number; frequency: Frequency, targetDate: string, goalId: string }) => {
    const { goalId, ...projection } = projectionData;
    setGoals(prevGoals => prevGoals.map(g => g.id === goalId ? { ...g, projection } : g));
  }, []);

  const openProjectionModal = useCallback((goal: SavingsGoal) => {
    setGoalToProject(goal);
    setProjectionModalOpen(true);
  }, []);

  const handleOpenContributionModal = useCallback((goal: SavingsGoal) => {
    setGoalToContribute(goal);
    setContributionModalOpen(true);
  }, []);

  const handleSaveContribution = useCallback((data: { amount: number, goalId: string }) => {
    const { amount, goalId } = data;
    setGoals(prevGoals => prevGoals.map(g => 
        g.id === goalId 
            ? { ...g, savedAmount: Math.min(g.targetAmount, g.savedAmount + amount) } 
            : g
    ));
  }, []);
  
  const handleSavePayment = useCallback((paymentData: Omit<Payment, 'isPaid'> & { id?: string }) => {
    if (paymentData.id) { // Editing
        setPayments(prev => prev.map(p => p.id === paymentData.id ? { ...p, ...paymentData, isPaid: p.isPaid } : p));
    } else { // Creating
        const newPayment: Payment = {
            id: crypto.randomUUID(),
            isPaid: false,
            ...paymentData,
        };
        setPayments(prev => [newPayment, ...prev]);
    }
  }, []);

  const handleOpenEditPayment = useCallback((payment: Payment) => {
    setPaymentToEdit(payment);
    setPaymentModalOpen(true);
  }, []);

  const handleDeletePayment = useCallback((paymentId: string) => {
    setItemToDelete({ id: paymentId, type: 'payment' });
    setConfirmModalOpen(true);
  }, []);
  
  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'goal') {
      setGoals(prevGoals => prevGoals.filter(g => g.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'payment') {
      setPayments(prevPayments => prevPayments.filter(p => p.id !== itemToDelete.id));
    }

    setConfirmModalOpen(false);
    setItemToDelete(null);
  }, [itemToDelete]);

  const handleTogglePaid = useCallback((paymentId: string) => {
    setPayments(prevPayments => prevPayments.map(p => p.id === paymentId ? {...p, isPaid: !p.isPaid} : p));
  }, []);
  
  const handleCloseGoalModal = useCallback(() => {
    setGoalModalOpen(false);
    setGoalToEdit(null);
  }, []);

  const handleCloseProjectionModal = useCallback(() => {
    setProjectionModalOpen(false);
    setGoalToProject(null);
  }, []);
  
  const handleCloseContributionModal = useCallback(() => {
    setContributionModalOpen(false);
    setGoalToContribute(null);
  }, []);

  const handleClosePaymentModal = useCallback(() => {
    setPaymentModalOpen(false);
    setPaymentToEdit(null);
  }, []);

  const handleCloseConfirmModal = useCallback(() => {
    setConfirmModalOpen(false);
    setItemToDelete(null);
  }, []);
  
  if (!isAuthenticated) {
    return <PinScreen onLogin={handleLogin} />;
  }

  const TabButton = ({ id, label, icon, active }: { id: ActiveTab; label: string; icon: React.ReactNode; active: boolean }) => {
    const activeClasses = id === 'goals' 
        ? 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white' 
        : 'bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white';
    const inactiveClasses = 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-white';
    
    return (
        <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-lg transition-all ${
            active ? activeClasses : inactiveClasses
        }`}
        >
        {icon}
        {label}
        </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen font-sans">
      <header className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Meta Ahorro</h1>
        <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {theme === 'dark' ? <SunIcon className="w-5 h-5 text-gray-400"/> : <MoonIcon className="w-5 h-5 text-gray-500"/>}
            </button>
            <button onClick={() => setSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <CogIcon className="w-5 h-5 text-gray-400"/>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <RefreshCwIcon className="w-5 h-5 text-gray-400"/>
            </button>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <TabButton id="goals" label="Mis Metas" icon={<LaptopIcon className="w-5 h-5"/>} active={activeTab === 'goals'} />
          <TabButton id="payments" label="Mis Pagos" icon={<WalletIcon className="w-5 h-5"/>} active={activeTab === 'payments'} />
        </div>
        
        <div className={`p-6 rounded-b-lg transition-colors duration-300 ${activeTab === 'goals' ? 'bg-gray-50 dark:bg-gray-800' : 'bg-slate-50 dark:bg-slate-800'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'goals' ? 'Mis Metas de Compra' : 'Mis Pagos Programados'}
            </h2>
            <button
                onClick={() => {
                  if (activeTab === 'goals') {
                    setGoalToEdit(null);
                    setGoalModalOpen(true);
                  } else {
                    setPaymentToEdit(null);
                    setPaymentModalOpen(true);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 text-black font-bold rounded-lg transition-colors ${activeTab === 'goals' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-sky-500 hover:bg-sky-400'}`}
            >
                <PlusIcon className="w-5 h-5"/>
                {activeTab === 'goals' ? 'Nueva Meta' : 'Nuevo Pago'}
            </button>
          </div>

          {activeTab === 'goals' && (
            sortedGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedGoals.map(goal => (
                        <GoalCard 
                            key={goal.id} 
                            goal={goal} 
                            onConfigure={openProjectionModal} 
                            onEdit={handleOpenEditGoal} 
                            onDelete={handleDeleteGoal}
                            onContribute={handleOpenContributionModal} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <LaptopIcon className="mx-auto w-12 h-12 text-gray-500 dark:text-gray-500 mb-4"/>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No tienes metas de ahorro</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">¡Crea tu primera meta para empezar a ahorrar!</p>
                </div>
            )
          )}

          {activeTab === 'payments' && (
             sortedPayments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPayments.map(payment => (
                        <PaymentCard key={payment.id} payment={payment} onTogglePaid={handleTogglePaid} onEdit={handleOpenEditPayment} onDelete={handleDeletePayment} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <WalletIcon className="mx-auto w-12 h-12 text-gray-500 dark:text-gray-500 mb-4"/>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No tienes pagos registrados</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Añade tus pagos para no olvidar ninguna fecha importante.</p>
                </div>
            )
          )}
        </div>
      </main>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={handleCloseGoalModal}
        onSave={handleSaveGoal}
        goalToEdit={goalToEdit}
      />
      <ProjectionModal
        isOpen={isProjectionModalOpen}
        onClose={handleCloseProjectionModal}
        onSave={handleSaveProjection}
        goal={goalToProject}
      />
      <ContributionModal
        isOpen={isContributionModalOpen}
        onClose={handleCloseContributionModal}
        onSave={handleSaveContribution}
        goal={goalToContribute}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onSave={handleSavePayment}
        paymentToEdit={paymentToEdit}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
      />
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onChangePin={handleChangePin}
      />
    </div>
  );
};

export default App;