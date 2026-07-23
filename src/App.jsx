import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Camera, TrendingUp, DollarSign, CheckCircle2, PlusCircle, 
  Briefcase, LogOut, Lock, Mail, Target, Trash2 
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stato Form Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dati Utente
  const [equipment, setEquipment] = useState([]);
  const [services, setServices] = useState([]);
  const [sales, setSales] = useState([]);

  // Form Inserimenti
  const [newEqName, setNewEqName] = useState('');
  const [newEqCost, setNewEqCost] = useState('');
  const [newSerName, setNewSerName] = useState('');
  const [newSerPrice, setNewSerPrice] = useState('');
  const [newSerCost, setNewSerCost] = useState('');

  // 1. Controllo Sessione e Listener Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Caricamento Dati dal Cloud
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    const { data: eq } = await supabase.from('equipment').select('*').order('created_at', { ascending: false });
    const { data: ser } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    const { data: sl } = await supabase.from('sales').select('*').order('created_at', { ascending: false });

    if (eq) setEquipment(eq);
    if (ser) setServices(ser);
    if (sl) setSales(sl);
  };

  // Gestione Login / Registrazione
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else alert('Registrazione completata! Controlla la tua posta per la conferma.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
    setLoading(false);
  };

  const handleLogout = () => supabase.auth.signOut();

  // Operazioni Dati
  const addEquipment = async (e) => {
    e.preventDefault();
    if (!newEqName || !newEqCost) return;

    const newItem = { user_id: session.user.id, name: newEqName, cost: parseFloat(newEqCost) };
    const { data, error } = await supabase.from('equipment').insert([newItem]).select();

    if (!error && data) {
      setEquipment([data[0], ...equipment]);
      setNewEqName('');
      setNewEqCost('');
    }
  };

  const addService = async (e) => {
    e.preventDefault();
    if (!newSerName || !newSerPrice) return;

    const newSer = {
      user_id: session.user.id,
      name: newSerName,
      price: parseFloat(newSerPrice),
      direct_cost: parseFloat(newSerCost || 0)
    };
    const { data, error } = await supabase.from('services').insert([newSer]).select();

    if (!error && data) {
      setServices([data[0], ...services]);
      setNewSerName('');
      setNewSerPrice('');
      setNewSerCost('');
    }
  };

  const registerSale = async (service) => {
    const margin = service.price - service.direct_cost;
    const newSale = {
      user_id: session.user.id,
      service_id: service.id,
      client_name: service.name,
      net_margin: margin
    };

    const { data, error } = await supabase.from('sales').insert([newSale]).select();
    if (!error && data) {
      setSales([data[0], ...sales]);
    }
  };

  // Calcoli Finanziari
  const totalExpenses = equipment.reduce((acc, item) => acc + Number(item.cost), 0);
  const totalNetEarnings = sales.reduce((acc, item) => acc + Number(item.net_margin), 0);
  const breakEvenRemaining = Math.max(0, totalExpenses - totalNetEarnings);
  const progressPercent = totalExpenses > 0 ? Math.min(100, (totalNetEarnings / totalExpenses) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 font-sans">
        Caricamento in corso...
      </div>
    );
  }

  // --- SCHERMATA LOGIN / ACCESSO WEB ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-2">
              <Camera className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">PhotoFinance Web</h1>
            <p className="text-sm text-slate-500">Accedi al tuo gestionale finanziario per la fotografia</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fotografo@email.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-100 text-sm"
            >
              {isSignUp ? 'Crea Account' : 'Accedi'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati subito'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- INTERFACCIA WEB DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navbar / Header Web */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-7 h-7 text-indigo-600" /> PhotoFinance Studio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Utente: {session.user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Target className="w-4 h-4" /> Target Attrezzatura: {totalExpenses.toLocaleString()} €
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" /> Esci
            </button>
          </div>
        </header>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Totale Speso Attrezzatura</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalExpenses.toLocaleString()} €</div>
            <div className="text-xs text-rose-500 mt-1 font-medium">{equipment.length} articoli acquistati</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Guadagno Netto Totale</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalNetEarnings.toLocaleString()} €</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">{sales.length} vendite effettuate</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Mancante al Break-Even</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{breakEvenRemaining.toLocaleString()} €</div>
            <div className="text-xs text-amber-600 mt-1 font-medium">Per coprire il 100% delle spese</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Ammortamento Spese</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{progressPercent.toFixed(1)} %</div>
            <div className="text-xs text-slate-400 mt-1">
              {progressPercent >= 100 ? '🎉 Complimenti! Sei in attivo' : 'In fase di rientro'}
            </div>
          </div>
        </div>

        {/* Barra di Progresso Break-Even */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">Copertura Attrezzatura</span>
            <span className="text-indigo-600">{totalNetEarnings} € / {totalExpenses} €</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sezioni Operative Web */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Uscite / Attrezzatura */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-500" /> Registro Attrezzatura (Uscite)
            </h2>

            <form onSubmit={addEquipment} className="flex gap-2">
              <input
                type="text"
                placeholder="Nome oggetto (es. Sony A7 IV)"
                value={newEqName}
                onChange={(e) => setNewEqName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-sm"
              />
              <input
                type="number"
                placeholder="Costo €"
                value={newEqCost}
                onChange={(e) => setNewEqCost(e.target.value)}
                className="w-28 px-3 py-2 bg-slate-50 border rounded-xl text-sm"
              />
              <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-sm font-semibold">
                + Add
              </button>
            </form>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {equipment.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="font-semibold text-rose-600">-{item.cost} €</span>
                </div>
              ))}
            </div>
          </div>

          {/* Servizi & Margini */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" /> Catalogo Servizi & Margini
            </h2>

            <form onSubmit={addService} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Servizio"
                value={newSerName}
                onChange={(e) => setNewSerName(e.target.value)}
                className="px-3 py-2 bg-slate-50 border rounded-xl text-sm"
              />
              <input
                type="number"
                placeholder="Prezzo €"
                value={newSerPrice}
                onChange={(e) => setNewSerPrice(e.target.value)}
                className="px-3 py-2 bg-slate-50 border rounded-xl text-sm"
              />
              <input
                type="number"
                placeholder="Costo vivo €"
                value={newSerCost}
                onChange={(e) => setNewSerCost(e.target.value)}
                className="px-3 py-2 bg-slate-50 border rounded-xl text-sm"
              />
              <button type="submit" className="sm:col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-semibold mt-1">
                Aggiungi Servizio
              </button>
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {services.map((ser) => {
                const net = ser.price - ser.direct_cost;
                const jobsNeeded = breakEvenRemaining > 0 ? Math.ceil(breakEvenRemaining / net) : 0;

                return (
                  <div key={ser.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{ser.name}</div>
                      <div className="text-xs text-slate-500">
                        Prezzo: {ser.price}€ | Costo vivo: {ser.direct_cost}€
                      </div>
                      <div className="text-xs font-semibold text-emerald-600">
                        Margine Netto: +{net} €
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {breakEvenRemaining > 0 && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-semibold">
                          Mancano ~{jobsNeeded}
                        </span>
                      )}
                      <button
                        onClick={() => registerSale(ser)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                      >
                        + Incassa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
        }
