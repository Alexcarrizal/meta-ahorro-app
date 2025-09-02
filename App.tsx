

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SavingsGoal, Payment, Priority, Frequency, WishlistItem } from './types.ts';
import { GoalModal, ProjectionModal, PaymentModal, ContributionModal, PaymentContributionModal, ConfirmationModal, SettingsModal, ChangePinModal, DayActionModal, WishlistModal } from './components/modals.tsx';
import GoalCard from './components/GoalCard.tsx';
import PaymentCard from './components/PaymentCard.tsx';
import WishlistCard from './components/WishlistCard.tsx';
import CalendarView from './components/CalendarView.tsx';
import { LayoutDashboardIcon, LaptopIcon, WalletIcon, PlusIcon, CogIcon, CalendarIcon, ClipboardListIcon, AlertTriangleIcon, HistoryIcon, CheckCircle2Icon, ListTodoIcon, PiggyBankIcon, TrendingUpIcon } from './components/icons.tsx';
import { AuthScreen } from './components/Auth.tsx';
import { DashboardPaymentItem } from './components/DashboardPaymentItem.tsx';

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
        color: 'fuchsia',
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
     {
        id: 'sample-payment-4',
        name: 'Didi Card',
        amount: 698.61,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        category: 'Transporte',
        frequency: Frequency.Monthly,
        color: 'lime',
    },
];

const sampleWishlist: WishlistItem[] = [
    {
        id: 'sample-wish-1',
        name: 'Silla de Oficina Ergonómica',
        category: 'Hogar',
        priority: Priority.Medium,
        estimatedAmount: 6000,
        url: 'https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/',
        distributor: 'Herman Miller',
    },
    {
        id: 'sample-wish-2',
        name: 'Curso de Desarrollo Web',
        category: 'Educación',
        priority: Priority.High,
        estimatedAmount: 3500,
        distributor: 'Udemy',
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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

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

  // Payment Reminder Notifications
  useEffect(() => {
    if (isLocked) {
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingPayments = payments.filter(p => {
        if (p.paidAmount >= p.amount) {
            return false; // Already paid
        }

        const dueDate = new Date(p.dueDate + 'T00:00:00');
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 3;
    });

    upcomingPayments.forEach(p => {
        const notificationKey = `notified_${p.id}`;
        if (!sessionStorage.getItem(notificationKey)) {
            const dueDate = new Date(p.dueDate + 'T00:00:00');
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const remainingAmount = p.amount - p.paidAmount;

            let dueDateText = '';
            if (diffDays === 0) {
                dueDateText = 'hoy';
            } else if (diffDays === 1) {
                dueDateText = 'mañana';
            } else {
                dueDateText = `en ${diffDays} días`;
            }
            
            window.alert(
                `¡Recordatorio de Pago Urgente!\n\n` +
                `Tu pago para "${p.name}" vence ${dueDateText}.\n` +
                `Monto restante: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(remainingAmount)}`
            );
            
            sessionStorage.setItem(notificationKey, 'true');
        }
    });
  }, [payments, isLocked]);

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

  const dashboardData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const paymentsThisMonth = payments.filter(p => {
        const dueDate = new Date(p.dueDate + 'T00:00:00');
        return dueDate >= startOfMonth && dueDate <= endOfMonth;
    });

    const unpaidPayments = payments
        .filter(p => p.paidAmount < p.amount)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const totalPendingInMonth = paymentsThisMonth.reduce((sum, p) => sum + Math.max(0, p.amount - p.paidAmount), 0);
    const totalPaidInMonth = paymentsThisMonth.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalSavings = goals.reduce((sum, g) => sum + g.savedAmount, 0);

    const sortedGoalsByProgress = [...goals]
        .filter(g => g.targetAmount > 0 && g.savedAmount < g.targetAmount)
        .map(g => ({ ...g, progress: (g.savedAmount / g.targetAmount) * 100 }))
        .sort((a, b) => b.progress - a.progress);
    
    const topGoals = sortedGoalsByProgress.slice(0, 3);
    const upcomingPayments = unpaidPayments.slice(0, 5);
    
    const categorySpending = paymentsThisMonth.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + p.amount;
        return acc;
    }, {} as Record<string, number>);

    const totalMonthSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    
    const categorySpendingWithPercentage = Object.entries(categorySpending)
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalMonthSpending > 0 ? (amount / totalMonthSpending) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

    return {
        totalPendingInMonth,
        totalPaidInMonth,
        totalSavings,
        topGoals,
        upcomingPayments,
        categorySpending: categorySpendingWithPercentage
    };
  }, [payments, goals]);

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


  const groupedAndSortedWishlist = useMemo(() => {
    const grouped: Record<string, WishlistItem[]> = wishlist.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, WishlistItem[]>);

    const priorityOrder = { [Priority.High]: 1, [Priority.Medium]: 2, [Priority.Low]: 3 };

    Object.values(grouped).forEach(items => {
      items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    });

    return Object.entries(grouped)
      .sort(([catA], [catB]) => catA.localeCompare(catB))
      .map(([category, items]) => ({ category, items }));
  }, [wishlist]);

  const groupedAndSortedPayments = useMemo(() => {
    if (filteredPayments.length === 0) return [];

    const grouped: Record<string, Payment[]> = filteredPayments.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, Payment[]>);

    return Object.entries(grouped)
      .sort(([catA], [catB]) => catA.localeCompare(catB))
      .map(([category, items]) => ({ category, items }));
  }, [filteredPayments]);

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

  const handleDashboardPaymentClick = (payment: Payment) => {
    setActiveTab('payments');
    handleOpenPaymentContributionModal(payment);
  };
  
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
  
  const StatCard = ({ icon, title, value, color }: { icon: React.ReactElement<{ className?: string }>, title: string, value: string, color: string }) => {
    const colorClasses: Record<string, { border: string, text: string }> = {
        red: { border: 'border-red-500', text: 'text-red-500 dark:text-red-400' },
        green: { border: 'border-green-500', text: 'text-green-500 dark:text-green-400' },
        blue: { border: 'border-sky-500', text: 'text-sky-500 dark:text-sky-400' },
    };
    const classes = colorClasses[color] || colorClasses.blue;
    return (
        <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl flex items-center gap-4 border-l-4 ${classes.border}`}>
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                {React.cloneElement(icon, { className: `w-7 h-7 ${classes.text}` })}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
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
          <TabButton id="dashboard" label="Dashboard" icon={<LayoutDashboardIcon className="w-5 h-5"/>} active={activeTab === 'dashboard'} colorClass="border-violet-500" />
          <TabButton id="payments" label="Pagos" icon={<WalletIcon className="w-5 h-5"/>} active={activeTab === 'payments'} colorClass="border-sky-500" />
          <TabButton id="goals" label="Metas" icon={<LaptopIcon className="w-5 h-5"/>} active={activeTab === 'goals'} colorClass="border-emerald-500" />
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
             <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Resumen del Mes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard icon={<WalletIcon />} title="Pendiente en Pagos" value={formatCurrency(dashboardData.totalPendingInMonth)} color="red" />
                        <StatCard icon={<CheckCircle2Icon />} title="Pagado este Mes" value={formatCurrency(dashboardData.totalPaidInMonth)} color="green" />
                        <StatCard icon={<PiggyBankIcon />} title="Ahorro Total en Metas" value={formatCurrency(dashboardData.totalSavings)} color="blue" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl">
                            <h3 className="font-bold text-xl mb-4">Próximos Pagos</h3>
                            {dashboardData.upcomingPayments.length > 0 ? (
                                <ul className="space-y-2">
                                {dashboardData.upcomingPayments.map(p => (
                                    <DashboardPaymentItem 
                                        key={p.id} 
                                        payment={p} 
                                        onClick={() => handleDashboardPaymentClick(p)} 
                                    />
                                ))}
                                </ul>
                            ) : (
                                <p className="text-center py-8 text-gray-500 dark:text-gray-400">¡No hay pagos pendientes!</p>
                            )}
                             <button onClick={() => setActiveTab('payments')} className="w-full mt-4 text-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                                Ver todos los pagos
                            </button>
                        </div>

                         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl">
                            <h3 className="font-bold text-xl mb-4">Gastos por Categoría (Este Mes)</h3>
                            {dashboardData.categorySpending.length > 0 ? (
                                <ul className="space-y-4">
                                    {dashboardData.categorySpending.map(({ category, amount, percentage }) => (
                                        <li key={category}>
                                            <div className="flex justify-between text-sm mb-1 font-medium text-gray-600 dark:text-gray-300">
                                                <span>{category}</span>
                                                <span>{formatCurrency(amount)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center py-8 text-gray-500 dark:text-gray-400">Sin gastos registrados este mes.</p>
                            )}
                        </div>

                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl">
                        <h3 className="font-bold text-xl mb-4">Progreso de Metas</h3>
                        {dashboardData.topGoals.length > 0 ? (
                            <ul className="space-y-5">
                            {dashboardData.topGoals.map(g => (
                                <li key={g.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{g.name}</p>
                                        <span className="text-sm font-bold text-emerald-500">{Math.floor(g.progress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${g.progress}%` }}></div>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        ) : (
                             <p className="text-center py-8 text-gray-500 dark:text-gray-400">No hay metas activas.</p>
                        )}
                        <button onClick={() => setActiveTab('goals')} className="w-full mt-6 text-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            Ver todas las metas
                        </button>
                    </div>
                </div>
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
            groupedAndSortedWishlist.length > 0 ? (
                <div className="space-y-8">
                    {groupedAndSortedWishlist.map(({ category, items }) => (
                        <div key={category}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{category}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(item => (
                                    <WishlistCard key={item.id} item={item} onEdit={handleOpenEditWishlistItem} onDelete={handleDeleteWishlistItem} onMoveToGoal={handleMoveToGoal} />
                                ))}
                            </div>
                        </div>
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
             groupedAndSortedPayments.length > 0 ? (
                <div className="space-y-8">
                    {groupedAndSortedPayments.map(({ category, items }) => (
                        <div key={category}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-2 h-8 bg-sky-500 rounded-full"></span>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{category}</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {items.map(payment => (
                                    <PaymentCard key={payment.id} payment={payment} onEdit={handleOpenEditPayment} onDelete={handleDeletePayment} onContribute={handleOpenPaymentContributionModal}/>
                                ))}
                            </div>
                        </div>
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