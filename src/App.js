import React, { useState, useEffect, useMemo } from 'react';
import { initialTransactions } from './mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wallet, User, Search, Activity, X, Edit2, Trash2, Shield, Sun, Moon, Zap, Tag, Coffee, Home, Car, ShoppingBag, Briefcase, Calendar, Filter, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const categories = {
  Food: { icon: <Coffee size={16}/>, color: 'text-orange-500' },
  Housing: { icon: <Home size={16}/>, color: 'text-blue-500' },
  Transport: { icon: <Car size={16}/>, color: 'text-purple-500' },
  Shopping: { icon: <ShoppingBag size={16}/>, color: 'text-pink-500' },
  Salary: { icon: <Briefcase size={16}/>, color: 'text-emerald-500' },
  General: { icon: <Tag size={16}/>, color: 'text-slate-500' }
};

const AppLogo = () => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-12">
    <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
      <Wallet size={26} />
    </div>
    <div className="flex flex-col">
      <span className="font-black text-xl tracking-tight text-[var(--text-main)]">TrackWise</span>
      <span className="text-[10px] font-bold tracking-[0.1em] text-indigo-500 uppercase italic">Expense Tracking System</span>
    </div>
  </motion.div>
);

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [userRole, setUserRole] = useState('Admin'); 
  const [userName] = useState('Varshith Kumar S');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [tempTx, setTempTx] = useState({ 
    id: null, 
    description: '', 
    amount: '', 
    category: 'General', 
    type: 'expense',
    date: new Date().toISOString().split('T')[0] 
  });

  const API_URL = 'http://localhost:5000/api/transactions';

  // --- 1. FORM RESET LOGIC ---
  useEffect(() => {
    if (isModalOpen && !tempTx.id) {
      setTempTx({ 
        id: null, 
        description: '', 
        amount: '', 
        category: 'General', 
        type: 'expense',
        date: new Date().toISOString().split('T')[0] 
      });
    }
  }, [isModalOpen, tempTx.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const backendData = await response.json();
        setTransactions([...backendData, ...initialTransactions]);
      } catch (err) {
        setTransactions(initialTransactions);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStart = startDate ? new Date(t.date) >= new Date(startDate) : true;
      const matchesEnd = endDate ? new Date(t.date) <= new Date(endDate) : true;
      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [transactions, searchTerm, startDate, endDate]);

  const syncedChartData = useMemo(() => {
    const dataMap = {};
    filteredTransactions.forEach(t => {
      const dateKey = t.date;
      if (!dataMap[dateKey]) dataMap[dateKey] = { date: dateKey, income: 0, expense: 0 };
      if (t.type === 'income') dataMap[dateKey].income += t.amount;
      else dataMap[dateKey].expense += t.amount;
    });

    return Object.values(dataMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        name: item.date.split('-').slice(1).join('/')
      }));
  }, [filteredTransactions]);

  const incomeTotal = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  
  // --- 2. LOW BALANCE THRESHOLD ---
  const currentBalance = incomeTotal - expenseTotal;
  const isLowBalance = currentBalance < 5000;

  const handleSave = async () => {
    // --- 3. FORM VALIDATION ---
    if (!tempTx.description || !tempTx.amount || !tempTx.date || Number(tempTx.amount) <= 0) {
      alert("Please enter a valid description and amount.");
      return;
    }

    const amount = Math.abs(Number(tempTx.amount));
    
    if (tempTx.type === 'expense') {
      const existingTx = tempTx.id ? transactions.find(t => t.id === tempTx.id) : null;
      const balanceWithAdjustment = existingTx ? currentBalance + existingTx.amount : currentBalance;
      if (amount > balanceWithAdjustment) {
        alert("Insufficient Balance!");
        return;
      }
    }

    const txData = { ...tempTx, amount: amount };
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      const savedTx = await response.json();
      setTransactions(tempTx.id ? transactions.map(t => t.id === tempTx.id ? savedTx : t) : [savedTx, ...transactions]);
      setIsModalOpen(false);
    } catch (err) {
      const localId = tempTx.id || Date.now();
      const localTx = { ...txData, id: localId };
      setTransactions(tempTx.id ? transactions.map(t => t.id === tempTx.id ? localTx : t) : [localTx, ...transactions]);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    try { await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); } catch (e) {}
    setTransactions(transactions.filter(item => item.id !== id));
  };

  const exportToCSV = () => {
    const headers = "Description,Amount,Category,Type,Date\n";
    const rows = filteredTransactions.map(t => `${t.description},${t.amount},${t.category},${t.type},${t.date}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Filtered_Financial_Report.csv'; a.click();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500">
      <aside className="w-full lg:w-80 bg-[var(--bg-sidebar)] border-r-2 border-[var(--border-color)] p-10 flex flex-col shrink-0 z-20">
        <AppLogo />
        <nav className="space-y-4 flex-1">
          <div className="flex items-center gap-4 px-5 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/40 cursor-pointer">
            <Activity size={18}/> Dashboard
          </div>
          <div className="pt-8 mt-8 border-t-2 border-[var(--border-color)] space-y-2">
            <button onClick={() => setUserRole('Admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-black transition-all ${userRole === 'Admin' ? 'bg-indigo-600/10 text-indigo-500 border-2 border-indigo-500/20' : 'text-slate-400'}`}>
              <Shield size={18}/> Admin Privileges
            </button>
            <button onClick={() => setUserRole('Viewer')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-black transition-all ${userRole === 'Viewer' ? 'bg-indigo-600/10 text-indigo-500 border-2 border-indigo-500/20' : 'text-slate-400'}`}>
              <User size={18}/> Standard Access
            </button>
          </div>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="mt-8 w-full flex items-center justify-between px-5 py-5 border-2 border-[var(--border-color)] rounded-2xl font-black text-[10px] uppercase tracking-widest">
            <span>{theme === 'light' ? 'Night Mode' : 'Day Mode'}</span>
            {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
          </button>
        </nav>
        <div className="pt-8 border-t-2 border-[var(--border-color)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">{userName.charAt(0)}</div>
          <div>
            <p className="text-sm font-black truncate w-32">{userName}</p>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{userRole} Status</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-5xl font-black tracking-tighter">Financial Portfolio</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Live System Sync</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={exportToCSV} className="bg-slate-800 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl">
              <Download size={16}/> Extract Report
            </button>
            {userRole === 'Admin' && (
              <button onClick={() => { setTempTx({ id: null, description: '', amount: '', category: 'General', type: 'expense', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                + Create Entry
              </button>
            )}
          </div>
        </header>

        <div className="bg-[var(--bg-card)] p-6 rounded-[24px] border-2 border-[var(--border-color)] mb-8 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
                <Filter size={18} className="text-indigo-500"/>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Range Filter:</span>
            </div>
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <input type="date" className="bg-transparent border-2 border-[var(--border-color)] rounded-xl px-4 py-2 font-bold text-xs focus:border-indigo-500 outline-none text-[var(--text-main)]" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                <span className="text-slate-400 font-bold">to</span>
                <input type="date" className="bg-transparent border-2 border-[var(--border-color)] rounded-xl px-4 py-2 font-bold text-xs focus:border-indigo-500 outline-none text-[var(--text-main)]" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                {(startDate || endDate) && (
                    <button onClick={() => {setStartDate(''); setEndDate('');}} className="text-[10px] font-black text-rose-500 uppercase ml-auto">Clear Range</button>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Net Liquidity', val: currentBalance, color: 'indigo' },
            { label: 'Gross Revenue', val: incomeTotal, color: 'emerald' },
            { label: 'Total Expenditure', val: expenseTotal, color: 'rose' }
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-10 bg-[var(--bg-card)] rounded-[32px] border-2 border-[var(--border-color)] border-l-8 ${card.color === 'indigo' ? 'border-l-indigo-600' : card.color === 'emerald' ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{card.label}</p>
              <h3 className={`text-4xl font-black tracking-tighter transition-colors duration-300 ${card.label === 'Net Liquidity' && isLowBalance ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-[var(--text-main)]'}`}>
                ₹{card.val.toLocaleString()}
              </h3>
              {card.label === 'Net Liquidity' && isLowBalance && (
                 <div className="flex items-center gap-1 mt-2 animate-bounce">
                    <AlertCircle size={12} className="text-rose-500"/>
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Liquidity Warning</span>
                 </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <div className="lg:col-span-2 p-10 bg-[var(--bg-card)] rounded-[32px] border-2 border-[var(--border-color)]">
            <h4 className="font-black text-xs uppercase tracking-widest mb-10 text-slate-400">Cashflow Analytics (Filtered)</h4>
            <div className="h-72 w-full">
              {/* --- 4. EMPTY CHART STATE --- */}
              {syncedChartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[32px]">
                   <Search size={32} className="text-slate-300 mb-2"/>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics Unavailable for this Period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={syncedChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="var(--text-main)" />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="var(--text-main)" />
                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 'bold' }} />
                    <Bar dataKey="income" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <Zap className="mb-6" size={40} fill="white"/>
                <h4 className="text-3xl font-black mb-4 tracking-tighter">Asset Intelligence</h4>
                <p className="font-black leading-relaxed text-xl text-white">"Spending volatility has normalized. Redirecting active capital into long-term yields will maximize equity growth."</p>
             </div>
             <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          </div>
        </div>

        <div className="pb-20">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Transaction History</h4>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Filter records..." className="pl-12 pr-6 py-3 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl font-bold outline-none focus:border-indigo-500 w-64 text-[var(--text-main)]"/>
            </div>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.map((t) => (
                <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ scale: 0.9, opacity: 0 }} key={t.id} className="bg-[var(--bg-card)] p-6 rounded-2xl border-2 border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 ${categories[t.category]?.color || 'text-indigo-500'}`}>
                      {categories[t.category]?.icon || <Tag size={16}/>}
                    </div>
                    <div>
                      <p className="font-black text-lg">{t.description}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.date} • {t.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <p className={`font-black text-2xl ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </p>
                    {userRole === 'Admin' && (
                      <div className="flex gap-2">
                        <button onClick={() => { setTempTx(t); setIsModalOpen(true); }} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Edit2 size={18}/></button>
                        <button onClick={() => handleDelete(t.id)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={18}/></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredTransactions.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-3xl">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</p>
                </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[var(--bg-card)] p-10 max-w-md w-full rounded-[40px] border-2 border-[var(--border-color)] relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400"><X/></button>
                <h3 className="text-2xl font-black mb-8 tracking-tighter">Modify Entry</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18}/>
                    <input type="date" className="w-full p-5 pl-14 rounded-2xl border-2 border-[var(--border-color)] font-bold bg-transparent outline-none focus:border-indigo-600 text-[var(--text-main)]" value={tempTx.date} onChange={(e) => setTempTx({...tempTx, date: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Description" className="w-full p-5 rounded-2xl border-2 border-[var(--border-color)] font-bold bg-transparent outline-none focus:border-indigo-600 text-[var(--text-main)]" value={tempTx.description} onChange={(e) => setTempTx({...tempTx, description: e.target.value})} />
                  <input type="number" placeholder="Value" className="w-full p-5 rounded-2xl border-2 border-[var(--border-color)] font-bold bg-transparent outline-none focus:border-indigo-600 text-[var(--text-main)]" value={tempTx.amount} onChange={(e) => setTempTx({...tempTx, amount: e.target.value})} />
                  <select className="w-full p-5 rounded-2xl border-2 border-[var(--border-color)] font-bold bg-transparent outline-none focus:border-indigo-600 text-[var(--text-main)]" value={tempTx.category} onChange={(e) => setTempTx({...tempTx, category: e.target.value})}>
                    {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setTempTx({...tempTx, type: 'income'})} className={`py-4 rounded-xl font-black text-xs uppercase transition-all ${tempTx.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}>Revenue</button>
                    <button onClick={() => setTempTx({...tempTx, type: 'expense'})} className={`py-4 rounded-xl font-black text-xs uppercase transition-all ${tempTx.type === 'expense' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}>Outflow</button>
                  </div>
                  <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all">
                    <CheckCircle2 size={18}/> Authorize Transaction
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;