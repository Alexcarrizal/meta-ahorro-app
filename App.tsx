import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SavingsGoal, Payment, Priority, Frequency } from './types';
import { GoalModal, ProjectionModal, PaymentModal, ContributionModal, PaymentContributionModal, ConfirmationModal, SettingsModal, ChangePinModal, DayActionModal } from './components/modals';
import GoalCard from './components/GoalCard';
import PaymentCard from './components/PaymentCard';
import CalendarView from './components/CalendarView';
import { LaptopIcon, WalletIcon, PlusIcon, CogIcon, CalendarIcon } from './components/icons';
import { AuthScreen } from './components/Auth';

const GOAL_COLORS = ['rose', 'sky', 'amber', 'emerald', 'indigo', 'purple'];
const PAYMENT_COLORS = ['teal', 'cyan', 'blue', 'lime', 'fuchsia', 'pink'];

const sampleGoals: SavingsGoal[] = [
    {
        id: 'sample-goal-1',
        name: 'Nueva Laptop Pro',
        targetAmount: 45000,
        savedAmount: 38000,
        category: 'Tecnología',
        priority: Priority.High,
        color: 'emerald',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    },
    {
        id: 'sample-goal-2',
        name: 'Vacaciones en la playa',
        targetAmount: 25000,
        savedAmount: 7500,
        category: 'Viajes',
        priority: Priority.Medium,
        color: 'sky',
        projection: {
            amount: 1500,
            frequency: Frequency.BiWeekly,
            targetDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0], // 90 days from now
        },
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    },
    {
        id: 'sample-goal-3',
        name: 'Renovar el celular',
        targetAmount: 18000,
        savedAmount: 18000,
        category: 'Tecnología',
        priority: Priority.Low,
        color: 'amber',
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), // 60 days ago
    },
];

const samplePayments: Payment[] = [
    {
        id: 'sample-payment-1',
        name: 'Pago Tarjeta de Crédito',
        amount: 5200,
        paidAmount: 1000,
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
        category: 'Finanzas',
        frequency: Frequency.Monthly,
        color: 'blue',
    },
    {
        id: 'sample-payment-2',
        name: 'Suscripción a Streaming',
        amount: 299,
        paidAmount: 0,
        dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago (overdue)
        category: 'Entretenimiento',
        frequency: Frequency.Monthly,
        color: 'teal',
    },
    {
        id: 'sample-payment-3',
        name: 'Plan de Celular',
        amount: 450,
        paidAmount: 450,
        dueDate: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0], // 15 days ago (paid)
        category: 'Servicios',
        frequency: Frequency.OneTime, // Marked as one time because it's paid
        color: 'pink',
    },
];

function getInitialData<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return fallback;
  }
}

const getInitialTheme = (): 'light' | 'dark' => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialPin = (): string | null => {
    return localStorage.getItem('app_pin');
};

type ActiveTab = 'goals' | 'payments' | 'calendar';
type ItemToDelete = { id: string; type: 'goal' | 'payment' } | null;

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [pin, setPin] = useState<string | null>(getInitialPin);
  const [isLocked, setLocked] = useState<boolean>(!!getInitialPin());
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('goals');
  const [goals, setGoals] = useState<SavingsGoal[]>(() => getInitialData('goals_data', sampleGoals));
  const [payments, setPayments] = useState<Payment[]>(() => {
    const initialData = getInitialData('payments_data', samplePayments) as any[];
    // Perform one-time migration for items in the old format
    return initialData.map(p => {
        if (p.isPaid !== undefined) { // Old format detected
            const { isPaid, ...rest } = p;
            return {
                ...rest,
                paidAmount: isPaid ? p.amount : (p.paidAmount || 0),
            };
        }
        if (p.paidAmount === undefined) {
          p.paidAmount = 0;
        }
        return p;
    });
  });

  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isProjectionModalOpen, setProjectionModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isContributionModalOpen, setContributionModalOpen] = useState(false);
  const [isPaymentContributionModalOpen, setPaymentContributionModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isChangePinOpen, setChangePinOpen] = useState(false);
  const [isDayActionModalOpen, setDayActionModalOpen] = useState(false);
  
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);
  const [goalToProject, setGoalToProject] = useState<SavingsGoal | null>(null);
  const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [paymentToContribute, setPaymentToContribute] = useState<Payment | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete>(null);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);


  useEffect(() => {
    // Data sanitization to fix potential duplicate IDs from older app versions.
    const sanitizeAndSetData = <T extends { id: string }>(
      data: T[],
      setData: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const idMap = new Map<string, boolean>();
      let needsUpdate = false;
      const sanitizedData = data.map(item => {
        if (!item.id || idMap.has(item.id)) {
          needsUpdate = true;
          return { ...item, id: crypto.randomUUID() };
        }
        idMap.set(item.id, true);
        return item;
      });

      if (needsUpdate) {
        setData(sanitizedData);
      }
    };

    sanitizeAndSetData(goals, setGoals);
    sanitizeAndSetData(payments, setPayments);
  }, []); // Run only once on mount to clean up data.


  useEffect(() => {
    localStorage.setItem('goals_data', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('payments_data', JSON.stringify(payments));
  }, [payments]);
  
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSetPin = (newPin: string) => {
    setPin(newPin);
    localStorage.setItem('app_pin', newPin);
    setLocked(false);
  };
  
  const handleUnlockSuccess = () => {
    setLocked(false);
  };
  
  const handleLockApp = () => {
    setSettingsOpen(false);
    setLocked(true);
  };

  const handleChangePin = (newPin: string) => {
    setPin(newPin);
    localStorage.setItem('app_pin', newPin);
  };
  
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [goals]);

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
        const isAPaid = a.paidAmount >= a.amount;
        const isBPaid = b.paidAmount >= b.amount;
        if (isAPaid && !isBPaid) return 1;
        if (!isAPaid && isBPaid) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    });
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
    const { amount: contributionAmount, goalId } = data;
    setGoals(currentGoals => {
        const goalIndex = currentGoals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) {
            return currentGoals;
        }

        const originalGoal = currentGoals[goalIndex];
        const newSavedAmount = originalGoal.savedAmount + contributionAmount;
        const finalSavedAmount = Math.min(originalGoal.targetAmount, newSavedAmount);

        const updatedGoal = {
            ...originalGoal,
            savedAmount: finalSavedAmount,
        };

        const newGoals = [...currentGoals];
        const isNowFullySaved = finalSavedAmount >= originalGoal.targetAmount;

        if (isNowFullySaved && originalGoal.projection && originalGoal.projection.frequency !== Frequency.OneTime && originalGoal.projection.targetDate) {
            
            const currentTargetDate = new Date(originalGoal.projection.targetDate + 'T00:00:00');
            let nextTargetDate = new Date(currentTargetDate);

            switch (originalGoal.projection.frequency) {
                case Frequency.Weekly:
                    nextTargetDate.setDate(nextTargetDate.getDate() + 7);
                    break;
                case Frequency.BiWeekly:
                    nextTargetDate.setDate(nextTargetDate.getDate() + 14);
                    break;
                case Frequency.Monthly:
                    nextTargetDate.setMonth(nextTargetDate.getMonth() + 1);
                    if (nextTargetDate.getDate() < currentTargetDate.getDate()) {
                        nextTargetDate.setDate(0);
                    }
                    break;
            }

            const formatDateToInput = (date: Date) => {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            const newRecurringGoal: SavingsGoal = {
                ...originalGoal,
                id: crypto.randomUUID(),
                savedAmount: 0,
                createdAt: new Date().toISOString(),
                projection: {
                    ...originalGoal.projection,
                    targetDate: formatDateToInput(nextTargetDate),
                }
            };

            if (updatedGoal.projection) {
              updatedGoal.projection.frequency = Frequency.OneTime;
            }
            
            newGoals[goalIndex] = updatedGoal;
            newGoals.push(newRecurringGoal);
        } else {
            newGoals[goalIndex] = updatedGoal;
        }

        return newGoals;
    });
  }, []);
  
  const handleSavePayment = useCallback((paymentData: Omit<Payment, 'paidAmount' | 'color'> & { id?: string }) => {
    if (paymentData.id) { // Editing
        setPayments(prevPayments => 
            prevPayments.map(payment => {
                if (payment.id === paymentData.id) {
                    return { ...payment, ...paymentData };
                }
                return payment;
            })
        );
    } else { // Creating
      setPayments(currentPayments => {
        const newPayment: Payment = {
          id: crypto.randomUUID(),
          paidAmount: 0,
          color: PAYMENT_COLORS[currentPayments.length % PAYMENT_COLORS.length],
          ...paymentData,
        };
        return [newPayment, ...currentPayments];
      });
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

  const handleOpenPaymentContributionModal = useCallback((payment: Payment) => {
    setPaymentToContribute(payment);
    setPaymentContributionModalOpen(true);
  }, []);

  const handleSavePaymentContribution = useCallback((data: { amount: number; paymentId: string; }) => {
    const { amount: contributionAmount, paymentId } = data;
    
    setPayments(currentPayments => {
        const paymentIndex = currentPayments.findIndex(p => p.id === paymentId);
        if (paymentIndex === -1) {
            return currentPayments;
        }

        const originalPayment = currentPayments[paymentIndex];

        const newPaidAmount = originalPayment.paidAmount + contributionAmount;
        const finalPaidAmount = Math.min(originalPayment.amount, newPaidAmount);

        const updatedPayment = {
            ...originalPayment,
            paidAmount: finalPaidAmount,
        };

        const newPayments = [...currentPayments];
        const isNowFullyPaid = finalPaidAmount >= originalPayment.amount;

        if (isNowFullyPaid && originalPayment.frequency !== Frequency.OneTime) {
            const currentDueDate = new Date(originalPayment.dueDate + 'T00:00:00');
            let nextDueDate = new Date(currentDueDate);

            switch (originalPayment.frequency) {
                case Frequency.Weekly:
                    nextDueDate.setDate(nextDueDate.getDate() + 7);
                    break;
                case Frequency.BiWeekly:
                    nextDueDate.setDate(nextDueDate.getDate() + 14);
                    break;
                case Frequency.Monthly:
                    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                    // Adjust if the day of the month changed (e.g. Jan 31 -> Feb 28)
                    if (nextDueDate.getDate() < currentDueDate.getDate()) {
                        nextDueDate.setDate(0); // Sets to the last day of the previous month
                    }
                    break;
                default:
                    newPayments[paymentIndex] = updatedPayment;
                    return newPayments;
            }

            const formatDateToInput = (date: Date) => {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const newRecurringPayment: Payment = {
                ...originalPayment,
                id: crypto.randomUUID(),
                dueDate: formatDateToInput(nextDueDate),
                paidAmount: 0,
            };

            updatedPayment.frequency = Frequency.OneTime;
            
            newPayments[paymentIndex] = updatedPayment;
            newPayments.push(newRecurringPayment);
        } else {
            newPayments[paymentIndex] = updatedPayment;
        }

        return newPayments;
    });
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

  const handleCalendarDayClick = useCallback((date: Date) => {
      setSelectedDateForModal(date);
      setDayActionModalOpen(true);
  }, []);
  
  const handleCloseGoalModal = useCallback(() => { setGoalModalOpen(false); setGoalToEdit(null); }, []);
  const handleCloseProjectionModal = useCallback(() => { setProjectionModalOpen(false); setGoalToProject(null); }, []);
  const handleCloseContributionModal = useCallback(() => { setContributionModalOpen(false); setGoalToContribute(null); }, []);
  const handleClosePaymentContributionModal = useCallback(() => { setPaymentContributionModalOpen(false); setPaymentToContribute(null); }, []);
  const handleClosePaymentModal = useCallback(() => { setPaymentModalOpen(false); setPaymentToEdit(null); setSelectedDateForModal(null) }, []);
  const handleCloseConfirmModal = useCallback(() => { setConfirmModalOpen(false); setItemToDelete(null); }, []);
  const handleCloseDayActionModal = useCallback(() => { setDayActionModalOpen(false); setSelectedDateForModal(null); }, []);


  if (isLocked || !pin) {
    return <AuthScreen hasPin={!!pin} onSetPin={handleSetPin} onUnlockSuccess={handleUnlockSuccess} storedPin={pin} />
  }

  const TabButton = ({ id, label, icon, active }: { id: ActiveTab; label: string; icon: React.ReactNode; active: boolean }) => {
    const baseClasses = 'flex items-center gap-2 px-4 md:px-6 py-3 font-semibold rounded-t-lg transition-all border-b-2';
    const activeClasses = 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-emerald-500';
    const inactiveClasses = 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-white border-transparent';
    
    return (
        <button onClick={() => setActiveTab(id)} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {icon} <span className="hidden md:inline">{label}</span>
        </button>
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen font-sans">
      <header className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Meta Ahorro</h1>
        <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <CogIcon className="w-6 h-6 text-gray-600 dark:text-gray-400"/>
        </button>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <TabButton id="goals" label="Metas" icon={<LaptopIcon className="w-5 h-5"/>} active={activeTab === 'goals'} />
          <TabButton id="payments" label="Pagos" icon={<WalletIcon className="w-5 h-5"/>} active={activeTab === 'payments'} />
          <TabButton id="calendar" label="Calendario" icon={<CalendarIcon className="w-5 h-5"/>} active={activeTab === 'calendar'} />
        </div>
        
        <div className={`pt-6 rounded-b-lg transition-colors duration-300`}>
          {activeTab !== 'calendar' && <div className="flex justify-between items-center mb-6 px-6 py-4 bg-white dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'goals' ? 'Mis Metas de Compra' : 'Mis Pagos Programados'}
            </h2>
            <button
                onClick={() => {
                  if (activeTab === 'goals') { setGoalToEdit(null); setGoalModalOpen(true); } 
                  else { setPaymentToEdit(null); setPaymentModalOpen(true); }
                }}
                className={`flex items-center gap-2 px-4 py-2 text-black font-bold rounded-lg transition-colors ${activeTab === 'goals' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-sky-500 hover:bg-sky-400'}`}
            >
                <PlusIcon className="w-5 h-5"/>
                {activeTab === 'goals' ? 'Nueva Meta' : 'Nuevo Pago'}
            </button>
          </div>}

          {activeTab === 'goals' && (
            sortedGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedGoals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} onConfigure={openProjectionModal} onEdit={handleOpenEditGoal} onDelete={handleDeleteGoal} onContribute={handleOpenContributionModal} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <LaptopIcon className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"/>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No tienes metas de ahorro</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">¡Crea tu primera meta para empezar a ahorrar!</p>
                </div>
            )
          )}

          {activeTab === 'payments' && (
             sortedPayments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPayments.map(payment => (
                        <PaymentCard key={payment.id} payment={payment} onEdit={handleOpenEditPayment} onDelete={handleDeletePayment} onContribute={handleOpenPaymentContributionModal}/>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <WalletIcon className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"/>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No tienes pagos registrados</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Añade tus pagos para no olvidar ninguna fecha importante.</p>
                </div>
            )
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              payments={payments} 
              goals={goals} 
              onDayClick={handleCalendarDayClick} 
            />
          )}
        </div>
      </main>

      <GoalModal isOpen={isGoalModalOpen} onClose={handleCloseGoalModal} onSave={handleSaveGoal} goalToEdit={goalToEdit} />
      <ProjectionModal isOpen={isProjectionModalOpen} onClose={handleCloseProjectionModal} onSave={handleSaveProjection} goal={goalToProject} />
      <ContributionModal isOpen={isContributionModalOpen} onClose={handleCloseContributionModal} onSave={handleSaveContribution} goal={goalToContribute}/>
      <PaymentContributionModal isOpen={isPaymentContributionModalOpen} onClose={handleClosePaymentContributionModal} onSave={handleSavePaymentContribution} payment={paymentToContribute} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} onSave={handleSavePayment} paymentToEdit={paymentToEdit} defaultDate={selectedDateForModal}/>
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal} onConfirm={handleConfirmDelete} title="Confirmar Eliminación" message="¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer." />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} onToggleTheme={handleToggleTheme} onChangePin={() => { setSettingsOpen(false); setChangePinOpen(true); }} onLock={handleLockApp} theme={theme}/>
      {pin && <ChangePinModal isOpen={isChangePinOpen} onClose={() => setChangePinOpen(false)} currentPin={pin} onPinChanged={handleChangePin}/>}
      <DayActionModal 
        isOpen={isDayActionModalOpen} 
        onClose={handleCloseDayActionModal}
        date={selectedDateForModal}
        onAddPayment={() => {
            handleCloseDayActionModal();
            setPaymentToEdit(null);
            setPaymentModalOpen(true);
        }}
        onAddGoal={() => {
            handleCloseDayActionModal();
            setGoalToEdit(null);
            setGoalModalOpen(true);
        }}
       />
    </div>
  );
};

export default App;