
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SavingsGoal, Payment, Priority, Frequency, WishlistItem } from './types';
import { GoalModal, ProjectionModal, PaymentModal, ContributionModal, PaymentContributionModal, ConfirmationModal, SettingsModal, ChangePinModal, DayActionModal, WishlistModal } from './components/modals';
import GoalCard from './components/GoalCard';
import PaymentCard from './components/PaymentCard';
import WishlistCard from './components/WishlistCard';
import CalendarView from './components/CalendarView';
import DashboardPaymentItem from './components/DashboardPaymentItem';
import { LayoutDashboardIcon, LaptopIcon, WalletIcon, PlusIcon, CogIcon, CalendarIcon, ClipboardListIcon, AlertTriangleIcon, HistoryIcon, CheckCircle2Icon, ListTodoIcon } from './components/icons';
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

const sampleWishlist: WishlistItem[] = [
    {
        id: 'sample-wish-1',
        name: 'Silla de Oficina Ergonómica',
        category: 'Hogar',
        priority: Priority.Medium,
        estimatedAmount: 6000,
    },
    {
        id: 'sample-wish-2',
        name: 'Curso de Desarrollo Web',
        category: 'Educación',
        priority: Priority.High,
        estimatedAmount: 3500,
    },
];

function getInitialData<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if(stored) {
        return JSON.parse(stored);
    }
    // Only set fallback data if no key exists (first time use)
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
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

type ActiveTab = 'dashboard' | 'goals' | 'payments' | 'wishlist' | 'calendar';
type ItemToDelete = { id: string; type: 'goal' | 'payment' | 'wishlist' } | null;
type PaymentFilter = 'all_unpaid' | 'urgent' | 'overdue' | 'paid';

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [pin, setPin] = useState<string | null>(getInitialPin);
  const [isLocked, setLocked] = useState<boolean>(!!getInitialPin());
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [goals, setGoals] = useState<SavingsGoal[]>(() => getInitialData('goals_data', sampleGoals));
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => getInitialData('wishlist_data', sampleWishlist));
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
  
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all_unpaid');

  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isProjectionModalOpen, setProjectionModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isContributionModalOpen, setContributionModalOpen] = useState(false);
  const [isPaymentContributionModalOpen, setPaymentContributionModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isChangePinOpen, setChangePinOpen] = useState(false);
  const [isDayActionModalOpen, setDayActionModalOpen] = useState(false);
  const [isWishlistModalOpen, setWishlistModalOpen] = useState(false);
  
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);
  const [goalToProject, setGoalToProject] = useState<SavingsGoal | null>(null);
  const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [paymentToContribute, setPaymentToContribute] = useState<Payment | null>(null);
  const [wishlistItemToEdit, setWishlistItemToEdit] = useState<WishlistItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete>(null);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);


  useEffect(() => {
    // Data sanitization to fix potential duplicate IDs from older app versions.
    const sanitizeAndSetData = <T extends { id: string }>(
      data: T[],
      setData: React.Dispatch<React.SetStateAction<T[]>>,
      storageKey: string
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
        localStorage.setItem(storageKey, JSON.stringify(sanitizedData));
      }
    };

    sanitizeAndSetData(goals, setGoals, 'goals_data');
    sanitizeAndSetData(payments, setPayments, 'payments_data');
    sanitizeAndSetData(wishlist, setWishlist, 'wishlist_data');
  }, []); // Run only once on mount to clean up data.


  useEffect(() => {
    localStorage.setItem('goals_data', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('payments_data', JSON.stringify(payments));
  }, [payments]);
  
  useEffect(() => {
    localStorage.setItem('wishlist_data', JSON.stringify(wishlist));
  }, [wishlist]);
  
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

  const monthlyAndOverduePayments = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return payments
        .filter(p => {
            const dueDate = new Date(p.dueDate + 'T00:00:00');
            // Include if it's unpaid and overdue from a previous month
            const isUnpaidAndOverdue = p.paidAmount < p.amount && dueDate < startOfMonth;
            // Include if it's due in the current month
            const isDueThisMonth = dueDate >= startOfMonth && dueDate <= endOfMonth;
            return isDueThisMonth || isUnpaidAndOverdue;
        })
        .sort((a, b) => {
            const isAPaid = a.paidAmount >= a.amount;
            const isBPaid = b.paidAmount >= b.amount;

            if (isAPaid && !isBPaid) return 1;
            if (!isAPaid && isBPaid) return -1;

            const dateA = new Date(a.dueDate + 'T00:00:00');
            const dateB = new Date(b.dueDate + 'T00:00:00');
            
            return dateA.getTime() - dateB.getTime();
        });
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const sorted = [...payments].sort((a, b) => {
      const isAPaid = a.paidAmount >= a.amount;
      const isBPaid = b.paidAmount >= b.amount;
      if (isAPaid && !isBPaid) return 1;
      if (!isAPaid && isBPaid) return -1;
      if(isAPaid && isBPaid) return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(); // Sort paid descending
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); // Sort unpaid ascending
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sorted.filter(p => {
        const isPaid = p.paidAmount >= p.amount;
        const dueDate = new Date(p.dueDate + 'T00:00:00');
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (paymentFilter) {
            case 'urgent':
                return !isPaid && diffDays >= 0 && diffDays <= 7;
            case 'overdue':
                return !isPaid && diffDays < 0;
            case 'paid':
                return isPaid;
            case 'all_unpaid':
            default:
                return !isPaid;
        }
    });
  }, [payments, paymentFilter]);


  const sortedWishlist = useMemo(() => {
      return [...wishlist].sort((a, b) => {
          const priorityOrder = { [Priority.High]: 1, [Priority.Medium]: 2, [Priority.Low]: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [wishlist]);

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
                case Frequency.Annual:
                    nextTargetDate.setFullYear(nextTargetDate.getFullYear() + 1);
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
                case Frequency.Annual:
                    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
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

  const handleSaveWishlistItem = useCallback((itemData: Omit<WishlistItem, 'id'> & { id?: string }) => {
    if (itemData.id) { // Editing
        setWishlist(prev => prev.map(item => item.id === itemData.id ? { ...item, ...itemData } : item));
    } else { // Creating
        setWishlist(prev => [{ id: crypto.randomUUID(), ...itemData }, ...prev]);
    }
  }, []);

  const handleOpenEditWishlistItem = useCallback((item: WishlistItem) => {
    setWishlistItemToEdit(item);
    setWishlistModalOpen(true);
  }, []);

  const handleDeleteWishlistItem = useCallback((itemId: string) => {
    setItemToDelete({ id: itemId, type: 'wishlist' });
    setConfirmModalOpen(true);
  }, []);
  
  const handleMoveToGoal = useCallback((item: WishlistItem) => {
      const newGoal: SavingsGoal = {
          id: crypto.randomUUID(),
          name: item.name,
          targetAmount: item.estimatedAmount || 0,
          savedAmount: 0,
          category: item.category,
          priority: item.priority,
          color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
          createdAt: new Date().toISOString(),
      };
      setGoals(prev => [newGoal, ...prev]);
      setWishlist(prev => prev.filter(w => w.id !== item.id));
      setActiveTab('goals');
  }, [goals]);
  
  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'goal') {
      setGoals(prevGoals => prevGoals.filter(g => g.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'payment') {
      setPayments(prevPayments => prevPayments.filter(p => p.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'wishlist') {
      setWishlist(prevWishlist => prevWishlist.filter(w => w.id !== itemToDelete.id));
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
  const handleCloseWishlistModal = useCallback(() => { setWishlistModalOpen(false); setWishlistItemToEdit(null); }, []);


  if (isLocked || !pin) {
    return <AuthScreen hasPin={!!pin} onSetPin={handleSetPin} onUnlockSuccess={handleUnlockSuccess} storedPin={pin} />
  }

  const TabButton = ({ id, label, icon, active, colorClass }: { id: ActiveTab; label: string; icon: React.ReactNode; active: boolean, colorClass: string }) => {
    const baseClasses = 'flex items-center gap-2 px-4 md:px-6 py-3 font-semibold rounded-t-lg transition-all border-b-2';
    const activeClasses = `bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${colorClass}`;
    const inactiveClasses = 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-white border-transparent';
    
    return (
        <button onClick={() => setActiveTab(id)} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {icon} <span className="hidden md:inline">{label}</span>
        </button>
    );
  };
  
  const getHeaderInfo = () => {
    switch(activeTab) {
        case 'goals':
            return { title: 'Mis Metas de Compra', buttonText: 'Nueva Meta', buttonClass: 'bg-emerald-500 hover:bg-emerald-400', onClick: () => { setGoalToEdit(null); setGoalModalOpen(true); } };
        case 'payments':
            return { title: 'Mis Pagos Programados', buttonText: 'Nuevo Pago', buttonClass: 'bg-sky-500 hover:bg-sky-400', onClick: () => { setPaymentToEdit(null); setPaymentModalOpen(true); } };
        case 'wishlist':
            return { title: 'Mi Lista de Deseos', buttonText: 'Nuevo Deseo', buttonClass: 'bg-indigo-500 hover:bg-indigo-600 text-white', onClick: () => { setWishlistItemToEdit(null); setWishlistModalOpen(true); } };
        case 'dashboard':
        default:
            return null;
    }
  }
  
  const headerInfo = getHeaderInfo();
  
  const PaymentFilterControls = () => {
    const filters: { id: PaymentFilter, label: string, icon: React.ReactNode, color: string }[] = [
      { id: 'all_unpaid', label: 'Pendientes', icon: <ListTodoIcon className="w-5 h-5" />, color: 'text-sky-600 dark:text-sky-400' },
      { id: 'urgent', label: 'Urgentes', icon: <AlertTriangleIcon className="w-5 h-5" />, color: 'text-amber-600 dark:text-amber-400' },
      { id: 'overdue', label: 'Vencidos', icon: <HistoryIcon className="w-5 h-5" />, color: 'text-red-600 dark:text-red-400' },
      { id: 'paid', label: 'Pagados', icon: <CheckCircle2Icon className="w-5 h-5" />, color: 'text-green-600 dark:text-green-400' },
    ];
    
    return (
      <div className="mb-6 bg-gray-200/50 dark:bg-gray-800/50 p-2 rounded-lg flex flex-wrap justify-center items-center gap-2">
        {filters.map(filter => {
          const isActive = paymentFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setPaymentFilter(filter.id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                isActive
                  ? `bg-white dark:bg-gray-900 shadow ${filter.color}`
                  : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          )
        })}
      </div>
    );
  };

  const getEmptyStateConfig = () => {
    if (activeTab === 'payments') {
        switch (paymentFilter) {
            case 'all_unpaid': return { icon: <WalletIcon/>, title: "¡Todo al día!", message: "No tienes pagos pendientes. ¡Buen trabajo!" };
            case 'urgent': return { icon: <AlertTriangleIcon/>, title: "Sin pagos urgentes", message: "Ningún pago vence en los próximos 7 días." };
            case 'overdue': return { icon: <HistoryIcon/>, title: "Sin pagos vencidos", message: "No tienes deudas pasadas. ¡Excelente!" };
            case 'paid': return { icon: <CheckCircle2Icon/>, title: "Aún no has completado pagos", message: "Completa un pago para verlo en este historial." };
            default: return { icon: <WalletIcon/>, title: "No tienes pagos registrados", message: "Añade tus pagos para no olvidar ninguna fecha importante." };
        }
    }
    return null;
  }

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
          <TabButton id="dashboard" label="Dashboard" icon={<LayoutDashboardIcon className="w-5 h-5"/>} active={activeTab === 'dashboard'} colorClass="border-violet-500" />
          <TabButton id="goals" label="Metas" icon={<LaptopIcon className="w-5 h-5"/>} active={activeTab === 'goals'} colorClass="border-emerald-500" />
          <TabButton id="payments" label="Pagos" icon={<WalletIcon className="w-5 h-5"/>} active={activeTab === 'payments'} colorClass="border-sky-500" />
          <TabButton id="wishlist" label="Deseos" icon={<ClipboardListIcon className="w-5 h-5"/>} active={activeTab === 'wishlist'} colorClass="border-indigo-500" />
          <TabButton id="calendar" label="Calendario" icon={<CalendarIcon className="w-5 h-5"/>} active={activeTab === 'calendar'} colorClass="border-rose-500" />
        </div>
        
        <div className={`pt-6 rounded-b-lg transition-colors duration-300`}>
          {headerInfo && <div className="flex justify-between items-center mb-6 px-6 py-4 bg-white dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {headerInfo.title}
            </h2>
            <button
                onClick={headerInfo.onClick}
                className={`flex items-center gap-2 px-4 py-2 text-black font-bold rounded-lg transition-colors ${headerInfo.buttonClass}`}
            >
                <PlusIcon className="w-5 h-5"/>
                {headerInfo.buttonText}
            </button>
          </div>}

          {activeTab === 'dashboard' && (
             <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen del Mes</h2>
                    <button
                        onClick={() => { setPaymentToEdit(null); setPaymentModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 text-black font-bold rounded-lg transition-colors bg-sky-500 hover:bg-sky-400"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        Nuevo Pago
                    </button>
                </div>
                 {monthlyAndOverduePayments.length > 0 ? (
                    <div className="space-y-3">
                        {monthlyAndOverduePayments.map(payment => (
                            <DashboardPaymentItem key={payment.id} payment={payment} onContribute={handleOpenPaymentContributionModal}/>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <WalletIcon className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"/>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">¡Sin pagos este mes!</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">No tienes pagos programados para este mes.</p>
                    </div>
                 )}
             </div>
          )}
          
          {activeTab === 'payments' && <PaymentFilterControls />}

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
          
          {activeTab === 'wishlist' && (
            sortedWishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedWishlist.map(item => (
                        <WishlistCard key={item.id} item={item} onEdit={handleOpenEditWishlistItem} onDelete={handleDeleteWishlistItem} onMoveToGoal={handleMoveToGoal} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <ClipboardListIcon className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"/>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Tu lista de deseos está vacía</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">¡Añade algo que te gustaría comprar en el futuro!</p>
                </div>
            )
          )}

          {activeTab === 'payments' && (
             filteredPayments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPayments.map(payment => (
                        <PaymentCard key={payment.id} payment={payment} onEdit={handleOpenEditPayment} onDelete={handleDeletePayment} onContribute={handleOpenPaymentContributionModal}/>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <div className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4">{getEmptyStateConfig()?.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{getEmptyStateConfig()?.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{getEmptyStateConfig()?.message}</p>
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
      <WishlistModal isOpen={isWishlistModalOpen} onClose={handleCloseWishlistModal} onSave={handleSaveWishlistItem} itemToEdit={wishlistItemToEdit} />
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