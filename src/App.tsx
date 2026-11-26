import React, { useState, useEffect } from 'react';
import { HybridOrchestrator } from './orchestrator';
import { WorkerExecutionResult, OrchestratorMetric, RoutingMode, RoutingDecision } from './orchestrator/types';
import { RoutingEvaluator } from './orchestrator/rules/evaluator';
import { getRouteFromHash, setRouteHash, AppRoute } from './router';
import { HomeView } from './views/HomeView';
import { DocsView } from './views/DocsView';
import { ApiView } from './views/ApiView';
import { SecurityView } from './views/SecurityView';
import { AuthModal, UserProfile } from './components/AuthModal';
import { Footer } from './components/Footer';
import { HydraLogo } from './components/HydraLogo';
import { logoutUser, loginWithGoogle, subscribeToAuthChanges, saveAuditToFirestore, loadAuditFromFirestore } from './firebase';
import { Language, translations } from './i18n';
import { 
  Zap, Cloud, Wifi, WifiOff, Cpu, Activity, 
  Layers, Clock, ShieldCheck, CheckCircle2, ArrowRight,
  Sparkles, Terminal, RefreshCw, Compass, FileSpreadsheet,
  FileCode, Play, Lock, Home, BookOpen, Code2, LogIn, LogOut,
  Shield, Sun, Moon, Globe, Check, AlertCircle, DollarSign,
  TrendingDown, Gauge, Copy, Trash2
} from 'lucide-react';

export const App: React.FC = () => {
  const [orchestrator] = useState(() => new HybridOrchestrator());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromHash());
  
  // Language and theme
  const [lang, setLang] = useState<Language>('es');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const t = translations[lang];

  // Authentication state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAnonLoading, setIsAnonLoading] = useState(false);

  // Inference dashboard state
  const [prompt, setPrompt] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLocalReady, setIsLocalReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isNativeHardware, setIsNativeHardware] = useState(false);
  const [mode, setMode] = useState<RoutingMode>('auto');
  const [history, setHistory] = useState<WorkerExecutionResult[]>([]);
  const [metrics, setMetrics] = useState<OrchestratorMetric[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeDecision, setActiveDecision] = useState<RoutingDecision | null>(null);
  const [latestResult, setLatestResult] = useState<WorkerExecutionResult | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'local' | 'cloud' | 'cascade'>('all');

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : (lang === 'es' ? 'Invitado' : 'Guest User')),
          isAnonymous: fbUser.isAnonymous
        });
      }
    });
    return () => unsubscribe();
  }, [lang]);

  // Sync URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    setRouteHash(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hardware check and network listeners

  useEffect(() => {
    orchestrator.getLocalWorker().checkNativeAvailability().then((available) => {
      setIsNativeHardware(available);
      if (available) {
        setIsLocalReady(true);
        setDownloadProgress(100);
      }
    });

    const handleOnline = async () => {
      setIsOnline(true);
      const drained = await orchestrator.drainQueue(true);
      if (drained.length > 0) {
        setHistory((prev) => [...drained, ...prev]);
        setMetrics(orchestrator.getMetrics());
        setQueueCount(orchestrator.getQueueLength());
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [orchestrator]);

  const handleDownloadModel = async () => {
    setIsDownloading(true);
    await orchestrator.getLocalWorker().initializeDeviceModel((pct) => {
      setDownloadProgress(pct);
    });
    setIsDownloading(false);
    setIsLocalReady(true);
    setIsNativeHardware(orchestrator.getLocalWorker().getStatus().isNative);
  };

  // Load persisted history & metrics per user
  useEffect(() => {
    if (!user?.uid) return;
    const hKey = `hydra_history_${user.uid}`;
    const mKey = `hydra_metrics_${user.uid}`;
    try {
      const savedH = localStorage.getItem(hKey);
      const savedM = localStorage.getItem(mKey);
      if (savedH) {
        const parsedH: WorkerExecutionResult[] = JSON.parse(savedH);
        setHistory(parsedH);
        if (parsedH.length > 0) setLatestResult(parsedH[0]);
      }
      if (savedM) {
        setMetrics(JSON.parse(savedM));
      }
    } catch {
      // Ignore corrupted local storage
    }

    loadAuditFromFirestore(user.uid).then((remoteDocs) => {
      if (remoteDocs.length > 0) {
        setHistory((prev) => {
          const existingIds = new Set(prev.map((p) => p.taskId));
          const merged = [...prev, ...remoteDocs.filter((d) => d?.taskId && !existingIds.has(d.taskId))];
          merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          return merged.slice(0, 50);
        });
      }
    });
  }, [user?.uid]);

  const persistHistoryItem = (result: WorkerExecutionResult, updatedMetrics: OrchestratorMetric[]) => {
    const safeResult: WorkerExecutionResult = {
      ...result,
      content: RoutingEvaluator.redactPII(result.content),
      routerReason: RoutingEvaluator.redactPII(result.routerReason),
      summary: result.summary ? RoutingEvaluator.redactPII(result.summary) : undefined
    };

    setLatestResult(safeResult);
    setHistory((prev) => {
      const next = [safeResult, ...prev].slice(0, 50);
      if (user?.uid) {
        try {
          localStorage.setItem(`hydra_history_${user.uid}`, JSON.stringify(next));
          localStorage.setItem(`hydra_metrics_${user.uid}`, JSON.stringify(updatedMetrics.slice(-100)));
        } catch {
          // Ignore storage quota errors
        }
        saveAuditToFirestore(user.uid, safeResult as unknown as Record<string, unknown>);
      }
      return next;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    setMetrics([]);
    setLatestResult(null);
    if (user?.uid) {
      localStorage.removeItem(`hydra_history_${user.uid}`);
      localStorage.removeItem(`hydra_metrics_${user.uid}`);
    }
  };

  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 1800);
  };

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt !== undefined ? customPrompt : prompt;
    if (!promptToSend.trim() || isProcessing) return;

    setIsProcessing(true);
    setStreamingText('');
    orchestrator.setMode(mode);

    const preDecision = await orchestrator.evaluateTask(promptToSend, isOnline);
    setActiveDecision(preDecision);

    const outcome = await orchestrator.dispatch(
      promptToSend, 
      isOnline, 
      user ? user.uid : 'anon_user',
      (chunk) => {
        setStreamingText((prev) => prev + chunk);
      }
    );

    const updatedMetrics = orchestrator.getMetrics();
    if (outcome.result) {
      persistHistoryItem(outcome.result, updatedMetrics);
    }
    setMetrics(updatedMetrics);
    setQueueCount(orchestrator.getQueueLength());

    setPrompt('');
    setStreamingText('');
    setIsProcessing(false);
  };

  const handleRunBenchmark = async () => {
    if (isBenchmarking || isProcessing) return;
    setIsBenchmarking(true);

    const benchmarkPrompts = lang === 'es'
      ? [
          'Reunión de sync: revisar tareas pendientes del sprint',
          'Checklist de entrega para versión v1.0.0',
          'Nota rápida: llamar al cliente sobre actualización de servicio',
          'Resumir nota de standup matutino',
          'Recordatorio: verificar logs del servidor a las 3pm',
          'Anotar feedback de usuario sobre interfaz oscura',
          'Lista de compras de oficina para el equipo',
          'Extraer ítems de acción de la llamada con diseño',
          'Actualizar documentación interna de bienvenida',
          'Confirmar asistencia para el demo del sistema',
          'Análisis profundo y arquitectura de microservicios distribuida con alta concurrencia y sharding de base de datos',
          'Diseño formal de protocolo de autenticación federada con tokens JWT asimétricos y validación App Check',
          'Comparativa técnica exhaustiva entre arquitecturas monolíticas y serverless con estimación de costos',
          'Algoritmo matemático de balanceo dinámico de carga con ventana deslizante y SLA estricto',
          'Refactorización integral de capa de persistencia offline con reconciliación de conflictos en Firestore'
        ]
      : [
          'Sync meeting: review pending sprint action items',
          'Release checklist for version v1.0.0',
          'Quick note: call client regarding service update',
          'Summarize morning standup note',
          'Reminder: check server logs at 3pm',
          'Log user feedback on dark mode interface',
          'Office supply list for the engineering team',
          'Extract action items from design review call',
          'Update internal onboarding documentation',
          'Confirm attendance for system demo',
          'Deep analysis and distributed microservices architecture with high concurrency and database sharding',
          'Formal design of federated authentication protocol with asymmetric JWT tokens and App Check validation',
          'Thorough technical comparison between monolithic and serverless architectures with cost estimation',
          'Mathematical dynamic load balancing algorithm with sliding window and strict SLA',
          'Full refactor of offline persistence layer with conflict reconciliation in Firestore'
        ];

    for (const p of benchmarkPrompts) {
      const outcome = await orchestrator.dispatch(p, isOnline, user ? user.uid : 'benchmark_user');
      const updatedMetrics = orchestrator.getMetrics();
      if (outcome.result) {
        persistHistoryItem(outcome.result, updatedMetrics);
      }
      setMetrics(updatedMetrics);
      setQueueCount(orchestrator.getQueueLength());
      await new Promise((r) => setTimeout(r, 40));
    }

    setIsBenchmarking(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const handleQuickGoogleLogin = async () => {
    setIsAnonLoading(true);
    try {
      const fbUser = await loginWithGoogle();
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Google User'),
        isAnonymous: false
      });
    } catch (e) {
      console.warn('Google login error:', e);
    } finally {
      setIsAnonLoading(false);
    }
  };

  const handleExportJSON = () => {
    const data = orchestrator.exportAuditLogsAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydra-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const data = orchestrator.exportAuditLogsAsCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydra-audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCalls = metrics.length;
  const localCalls = metrics.filter((m) => m.source === 'local').length;
  const cloudCalls = metrics.filter((m) => m.source === 'cloud').length;
  const cascadeCalls = metrics.filter((m) => m.source === 'cascade').length;
  const localSavings = totalCalls > 0 ? Math.round(((localCalls + cascadeCalls * 0.5) / totalCalls) * 100) : 0;
  const totalCostSaved = metrics.reduce((acc, m) => acc + (m.costSavedUSD || 0), 0);
  const avgLatency =
    totalCalls > 0
      ? Math.round(metrics.reduce((acc, m) => acc + m.latencyMs, 0) / totalCalls)
      : 0;

  /* Sidebar nav items */
  const navItems = [
    { id: 'home',      label: t.nav_home,      icon: <Home size={17} />,     requiresAuth: false },
    { id: 'dashboard', label: t.nav_dashboard,  icon: <Terminal size={17} />, requiresAuth: false },
    { id: 'docs',      label: t.nav_docs,       icon: <BookOpen size={17} />, requiresAuth: false },
    { id: 'api',       label: t.nav_api,        icon: <Code2 size={17} />,    requiresAuth: false },
    { id: 'security',  label: t.nav_security,   icon: <Shield size={17} />,   requiresAuth: false },
  ];

  /* User initials for avatar */
  const userInitial = user?.displayName ? user.displayName[0].toUpperCase() : '?';

  return (
    <div className="app-shell">

      {/* ─── SIDEBAR ─── */}
      <aside className="sidebar">

        {/* Brand */}
        <div className="sidebar-brand" onClick={() => navigateTo('home')}>
          <div className="brand-icon">
            <HydraLogo size={24} color="#ffffff" />
          </div>
          <div className="brand-text">
            <div className="brand-name">HYDRA</div>
            <div className="brand-sub">{lang === 'es' ? 'AGENT IA' : 'AGENT AI'}</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link${currentRoute === item.id ? ' active' : ''}`}
              onClick={() => navigateTo(item.id as AppRoute)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="link-label">
                {item.label}
                {item.id === 'dashboard' && !user && (
                  <Lock size={10} style={{ marginLeft: 4, opacity: 0.5 }} />
                )}
              </span>
            </button>
          ))}
        </nav>

        {/* Footer: actions + user */}
        <div className="sidebar-footer">
          <div className="sidebar-actions">
            {/* Language toggle */}
            <button
              className="btn-icon"
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              style={{ flex: 1, gap: 6, fontSize: 11, fontWeight: 700 }}
            >
              <Globe size={13} /> <span className="link-label">{lang.toUpperCase()}</span>
            </button>
            {/* Theme toggle */}
            <button
              className="btn-icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark'
                ? <Sun size={14} color="var(--accent-amber)" />
                : <Moon size={14} color="var(--accent-primary)" />}
            </button>
          </div>

          {user ? (
            <div className="sidebar-user">
              <div className="avatar">{userInitial}</div>
              <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName}
                </div>
                <div className="user-status">
                  <span className="dot dot-green" />
                  {t.nav_auth_connected}
                </div>
              </div>
              <button
                className="btn-icon"
                onClick={handleLogout}
                title={t.nav_logout_title}
                style={{ flexShrink: 0 }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              className="btn-primary"
              onClick={() => setIsAuthOpen(true)}
              style={{ width: '100%', padding: '9px 12px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <LogIn size={13} /> <span className="link-label">{t.nav_login}</span>
            </button>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="main-content">
        {/* Mobile Topbar (<= 640px) */}
        <header className="mobile-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigateTo('home')}>
            <HydraLogo size={24} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '0.12em', color: 'var(--text-main)', lineHeight: 1 }}>
                HYDRA
              </div>
              <div style={{ fontSize: '8.5px', fontWeight: '700', letterSpacing: '0.18em', color: 'var(--text-dim)' }}>
                {lang === 'es' ? 'AGENT IA' : 'AGENT AI'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="btn-icon"
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              style={{ fontSize: '11px', fontWeight: '700', padding: '6px 8px', gap: '4px' }}
              title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe size={12} /> {lang.toUpperCase()}
            </button>
            <button
              className="btn-icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark'
                ? <Sun size={14} color="var(--accent-amber)" />
                : <Moon size={14} color="var(--accent-primary)" />}
            </button>
            {user ? (
              <button className="btn-icon" onClick={handleLogout} title={t.nav_logout_title}>
                <LogOut size={14} />
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setIsAuthOpen(true)} style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogIn size={12} />
              </button>
            )}
          </div>
        </header>

        <div className="page-wrapper">

        {/* ─── ACTIVE VIEWS ─── */}
        {currentRoute === 'home' && (
          <HomeView
            onGoToDashboard={() => navigateTo('dashboard')}
            onGoToDocs={() => navigateTo('docs')}
            onGoToAPI={() => navigateTo('api')}
            lang={lang}
          />
        )}

        {currentRoute === 'docs' && <DocsView lang={lang} />}

        {currentRoute === 'api' && <ApiView lang={lang} />}

        {currentRoute === 'security' && <SecurityView lang={lang} />}

        {currentRoute === 'dashboard' && (
        <>
          {/* CONTROL DE ACCESO: EL USUARIO DEBE ESTAR LOGUEADO PARA EL DASHBOARD */}
          {!user ? (
            <div className="glass-panel" style={{ 
              maxWidth: '580px', margin: '30px auto', padding: '48px 36px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px'
            }}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '16px', 
                background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Lock size={28} color="var(--primary-glow)" />
              </div>

              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {t.auth_gate_title}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  {t.auth_gate_desc}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
                <button
                  onClick={handleQuickGoogleLogin}
                  disabled={isAnonLoading}
                  className="btn-ghost"
                  style={{ 
                    color: 'var(--text-main)', padding: '12px 20px', borderRadius: '10px', 
                    fontSize: '13px', fontWeight: '600', cursor: isAnonLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"/>
                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"/>
                  </svg>
                  {t.auth_btn_google}
                </button>

                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <LogIn size={15} />
                  {t.auth_gate_sign_in}
                </button>
              </div>

              <div style={{ 
                marginTop: '12px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)', 
                width: '100%', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11px', color: 'var(--text-dim)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} color="var(--accent-emerald)" /> Firebase App Check
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} color="var(--primary-glow)" /> Zero-Trust PII Redaction
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Dashboard Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    {t.dash_subtitle}
                  </div>
                  <h1 className="section-title" style={{ fontSize: '26px', marginTop: '2px' }}>
                    {t.dash_title}
                  </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={isOnline ? 'badge badge-green' : 'badge badge-rose'}>
                    <span className={isOnline ? 'dot dot-green' : 'dot dot-rose'} />
                    {isOnline ? t.status_online : t.status_offline}
                  </span>
                  <span className="badge badge-blue">
                    <DollarSign size={11} /> ${totalCostSaved.toFixed(5)} {t.factor_cost_saved}
                  </span>
                </div>
              </div>

              {/* 4 Heads Status Strip (1 -> 2 -> 3 -> 4) */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>

                {/* Head 1: Gemini Nano */}
                <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                      {t.status_nano_title}
                    </span>
                    <Cpu size={16} color={isLocalReady ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: isLocalReady ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {isLocalReady ? (isNativeHardware ? t.status_nano_native : t.status_nano_ready) : isDownloading ? `${t.status_nano_downloading}${downloadProgress}%` : t.status_nano_inactive}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isLocalReady ? t.nano_latency_hint : 'Chrome Prompt API'}
                      </div>
                    </div>
                    {!isLocalReady && !isDownloading && (
                      <button
                        onClick={handleDownloadModel}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {t.btn_activate_nano}
                      </button>
                    )}
                  </div>
                </div>

                {/* Head 2: Cloud & Strategy */}
                <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                      {t.status_strategy_title}
                    </span>
                    <Layers size={16} color="var(--primary-glow)" />
                  </div>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as RoutingMode)}
                    style={{
                      width: '100%', background: 'var(--input-bg)', color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)', padding: '7px 10px', borderRadius: '8px',
                      fontSize: '12px', outline: 'none'
                    }}
                  >
                    <option value="auto">{t.opt_strategy_auto}</option>
                    <option value="cascade">{t.opt_strategy_cascade}</option>
                    <option value="local_only">{t.opt_strategy_local}</option>
                    <option value="cloud_only">{t.opt_strategy_cloud}</option>
                  </select>
                </div>

                {/* Head 3: Privacy Shield */}
                <div className="glass-panel" style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }} onClick={() => navigateTo('security')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                      {t.status_sec_title}
                    </span>
                    <ShieldCheck size={16} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                      {t.status_sec_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {t.status_sec_desc}
                    </div>
                  </div>
                </div>

                {/* Head 4: Network & Offline Sync */}
                <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                      {t.status_net_title}
                    </span>
                    {isOnline ? <Wifi size={16} color="var(--accent-emerald)" /> : <WifiOff size={16} color="var(--accent-rose)" />}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: isOnline ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                        {isOnline ? t.status_online : t.status_offline}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isOnline ? t.status_synced : t.status_queued}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOnline(!isOnline)}
                      className="btn-ghost"
                      style={{
                        color: 'var(--text-main)', padding: '6px 10px', borderRadius: '6px',
                        fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', flexShrink: 0
                      }}
                    >
                      <RefreshCw size={11} />
                      {t.btn_simulate_net}
                    </button>
                  </div>
                </div>

              </section>

              {/* Metrics Row */}
              <section className="metric-row">
                
                <div className="metric-card">
                  <div className="mc-label">
                    <span>{t.metric_savings_title}</span>
                    <span className="dot dot-green" />
                  </div>
                  <div className="mc-value" style={{ color: 'var(--accent-emerald)' }}>
                    {localSavings}%
                  </div>
                  <div className="mc-sub">
                    {t.metric_savings_sub}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${localSavings}%`, background: 'var(--accent-emerald)' }} />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="mc-label">
                    <span>{t.metric_latency_title}</span>
                    <span className="dot dot-cyan" />
                  </div>
                  <div className="mc-value" style={{ color: 'var(--accent-cyan)' }}>
                    {avgLatency} <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-muted)' }}>ms</span>
                  </div>
                  <div className="mc-sub">
                    {t.metric_latency_sub}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((avgLatency / 2000) * 100))}%`, background: 'var(--accent-cyan)' }} />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="mc-label">
                    <span>{t.metric_ratio_title}</span>
                    <span className="dot dot-blue" />
                  </div>
                  <div className="mc-value" style={{ color: 'var(--primary-glow)' }}>
                    {localCalls + cascadeCalls} <span style={{ fontSize: '16px', color: 'var(--text-dim)', fontWeight: '400' }}>/</span> {cloudCalls}
                  </div>
                  <div className="mc-sub">
                    {totalCalls} {t.metric_ratio_sub}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${totalCalls > 0 ? Math.round(((localCalls + cascadeCalls) / totalCalls) * 100) : 0}%`, background: 'var(--accent-primary)' }} />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="mc-label">
                    <span>{t.metric_queue_title}</span>
                    <span className="dot dot-amber" />
                  </div>
                  <div className="mc-value" style={{ color: 'var(--accent-amber)' }}>
                    {queueCount}
                  </div>
                  <div className="mc-sub">
                    {t.metric_queue_sub}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, queueCount * 20)}%`, background: 'var(--accent-amber)' }} />
                  </div>
                </div>

              </section>

              {/* Consola de Envío con Orquestación Avanzada */}
              <section className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal size={17} color="var(--primary-glow)" />
                      {t.console_title}
                    </h2>
                    
                    {/* Botón de Benchmark Reproducible (M-07) */}
                    <button
                      onClick={handleRunBenchmark}
                      disabled={isBenchmarking || isProcessing}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.2))',
                        color: 'var(--primary-glow)', border: '1px solid rgba(99, 102, 241, 0.35)',
                        cursor: isBenchmarking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      title={t.btn_benchmark_title}
                    >
                      <Sparkles size={12} color="var(--accent-cyan)" />
                      {isBenchmarking ? t.btn_running_benchmark : t.btn_run_benchmark}
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>{t.demo_prompts_label}</span>
                    
                    <button
                      onClick={() => handleSend(undefined, lang === 'es' ? 'Reunión rápida de sync: revisar tareas del sprint y fijar fecha' : 'Quick sync meeting: review sprint action items and set deadline')}
                      style={{ 
                        fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.25)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <Cpu size={12} /> {t.btn_demo_simple}
                    </button>

                    <button
                      onClick={() => handleSend(undefined, lang === 'es' ? 'Pega de nota: "Revisar arquitectura de login, depurar token de App Check y exportar reporte" -> generar resumen y tareas en JSON' : 'Note paste: "Review login architecture, debug App Check token, and export report" -> generate summary and JSON tasks')}
                      style={{ 
                        fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(56, 189, 248, 0.25)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                      title={t.btn_demo_json_tasks_title}
                    >
                      <FileSpreadsheet size={12} /> {t.btn_demo_json_tasks}
                    </button>

                    <button
                      onClick={() => handleSend(undefined, lang === 'es' ? 'Análisis profundo y arquitectura de microservicios distribuida con alta concurrencia' : 'Deep analysis and distributed microservices architecture with high concurrency')}
                      style={{ 
                        fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-glow)', border: '1px solid rgba(99, 102, 241, 0.25)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <Cloud size={12} /> {t.btn_demo_complex}
                    </button>

                    <button
                      onClick={() => handleSend(undefined, lang === 'es' ? 'Guardar credenciales privadas: usuario juan@empresa.com con api_key: sk-proj-99482910' : 'Store private credentials: user john@company.com with api_key: sk-proj-99482910')}
                      style={{ 
                        fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.25)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <Lock size={12} /> {t.btn_demo_privacy}
                    </button>

                    <button
                      onClick={() => {
                        setMode('cascade');
                        handleSend(undefined, lang === 'es' ? 'Diseñar arquitectura escalable en tiempo real y extraer un plan de migración paso a paso' : 'Design scalable real-time architecture and extract a step-by-step migration plan');
                      }}
                      style={{ 
                        fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(56, 189, 248, 0.12))', 
                        color: 'var(--primary-glow)', border: '1px solid rgba(99, 102, 241, 0.3)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <Zap size={12} color="var(--accent-cyan)" /> {t.btn_demo_cascade}
                    </button>
                  </div>
                </div>

                <form className="console-form" onSubmit={(e) => handleSend(e)} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.input_placeholder}
                    style={{
                      flex: 1, background: 'var(--input-bg)', color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)', padding: '13px 16px', borderRadius: '10px',
                      fontSize: '13px', outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-primary"
                    style={{
                      padding: '0 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    {isProcessing ? <RefreshCw size={15} className="pulse-badge" /> : <Play size={15} />}
                    {isProcessing ? t.btn_dispatching : t.btn_dispatch}
                  </button>
                </form>

                {/* Matriz de Decisión Multidimensional (XAI Vector) */}
                {activeDecision && (
                  <div style={{ marginTop: '16px', padding: '16px 20px', background: 'var(--bg-stripe)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                    
                    {/* Header del Vector */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Gauge size={16} color="var(--primary-glow)" />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                          {t.factors_evaluated}
                        </span>
                        <span style={{ 
                          fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                          background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-glow)', border: '1px solid rgba(99, 102, 241, 0.3)'
                        }}>
                          {activeDecision.breakdown.confidenceScore}% {t.factor_confidence}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {t.decision_time} {activeDecision.evaluationMs.toFixed(2)} ms (&lt; 50 ms)
                        </span>
                        <span style={{ 
                          fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '6px', 
                          background: activeDecision.target === 'local' 
                            ? 'rgba(16,185,129,0.15)' 
                            : activeDecision.target === 'cascade'
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(56,189,248,0.2))'
                            : 'rgba(99,102,241,0.15)', 
                          color: activeDecision.target === 'local' ? 'var(--accent-emerald)' : 'var(--primary-glow)',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                          {t.factor_route} {activeDecision.target.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Complejidad Semántica */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                        <span>{t.semantic_complexity_label}</span>
                        <strong style={{ color: activeDecision.breakdown.complexityScore >= 50 ? 'var(--primary-glow)' : 'var(--accent-emerald)' }}>
                          {activeDecision.breakdown.complexityScore} / 100
                        </strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${activeDecision.breakdown.complexityScore}%`, 
                          height: '100%', 
                          background: activeDecision.breakdown.complexityScore >= 50 
                            ? 'linear-gradient(90deg, #6366f1, #818cf8)' 
                            : 'linear-gradient(90deg, #10b981, #34d399)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Grid de 4 Vectores */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                      
                      <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.factor_tokens}</span>
                        <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>{activeDecision.breakdown.tokenCount}</strong>
                      </div>

                      <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.factor_intent}</span>
                        <strong style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>{activeDecision.breakdown.intent.toUpperCase()}</strong>
                      </div>

                      <div style={{ 
                        padding: '8px 12px', borderRadius: '8px', 
                        background: activeDecision.breakdown.hasPII ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.08)', 
                        border: `1px solid ${activeDecision.breakdown.hasPII ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
                      }}>
                        <span style={{ fontSize: '11px', color: activeDecision.breakdown.hasPII ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                          {activeDecision.breakdown.hasPII ? t.factor_pii_detected : t.factor_no_pii}
                        </span>
                        <strong style={{ fontSize: '11px', color: activeDecision.breakdown.hasPII ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                          {activeDecision.breakdown.hasPII ? activeDecision.breakdown.detectedPIITypes.join(', ') : 'OK'}
                        </strong>
                      </div>

                      <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.factor_cost_avoided}</span>
                        <strong style={{ fontSize: '12px', color: 'var(--accent-emerald)' }}>
                          +${activeDecision.breakdown.estimatedCostUSD.toFixed(5)}
                        </strong>
                      </div>

                    </div>
                  </div>
                )}

                {/* Streaming */}
                {isProcessing && streamingText && (
                  <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(99, 102, 241, 0.04)', border: '1px dashed rgba(99, 102, 241, 0.3)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--primary-glow)', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={12} /> {t.streaming_label}
                    </div>
                    <pre style={{ fontSize: '12.5px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                      {streamingText}
                    </pre>
                  </div>
                )}

                {/* Dedicated Response Output Panel */}
                {!isProcessing && latestResult && (
                  <div style={{ marginTop: '14px', padding: '16px', background: 'var(--bg-code)', border: '1px solid var(--border-mid)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {latestResult.source === 'local' ? <Cpu size={14} color="var(--accent-emerald)" /> : latestResult.source === 'cascade' ? <Zap size={14} color="var(--accent-cyan)" /> : <Cloud size={14} color="var(--primary-glow)" />}
                          {t.response_panel_title}
                        </span>
                        <span className={latestResult.source === 'local' ? 'badge badge-green' : latestResult.source === 'cascade' ? 'badge badge-cyan' : 'badge badge-blue'}>
                          {latestResult.source.toUpperCase()} · {latestResult.latencyMs} ms
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyResponse(latestResult.content)}
                        className="btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)' }}
                      >
                        {copiedResponse ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                        {copiedResponse ? t.btn_copied_response : t.btn_copy_response}
                      </button>
                    </div>
                    <pre style={{
                      fontSize: '12.5px',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowX: 'auto',
                      margin: 0
                    }}>
                      {RoutingEvaluator.redactPII(latestResult.content)}
                    </pre>
                  </div>
                )}
              </section>

              {/* Feed de Auditoría */}
              <section className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={17} color="var(--accent-emerald)" />
                      {t.audit_title}
                      {history.length > 0 && (
                        <span className="badge badge-green" style={{ fontSize: '11px' }}>
                          {history.length}
                        </span>
                      )}
                    </h2>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {t.audit_desc}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {(['all', 'local', 'cloud', 'cascade'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setHistoryFilter(f)}
                        className={historyFilter === f ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px' }}
                      >
                        {f === 'all' ? t.filter_all : f === 'local' ? t.filter_local : f === 'cloud' ? t.filter_cloud : t.filter_cascade}
                      </button>
                    ))}
                    <button
                      onClick={handleExportJSON}
                      disabled={metrics.length === 0}
                      className="btn-ghost"
                      style={{
                        color: 'var(--text-main)', padding: '6px 10px', borderRadius: '8px',
                        fontSize: '11px', cursor: metrics.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: metrics.length === 0 ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <FileCode size={12} color="var(--accent-cyan)" /> {t.btn_export_json}
                    </button>
                    <button
                      onClick={handleExportCSV}
                      disabled={metrics.length === 0}
                      className="btn-ghost"
                      style={{
                        color: 'var(--text-main)', padding: '6px 10px', borderRadius: '8px',
                        fontSize: '11px', cursor: metrics.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: metrics.length === 0 ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <FileSpreadsheet size={12} color="var(--accent-emerald)" /> {t.btn_export_csv}
                    </button>
                    {history.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearHistory}
                        className="btn-ghost"
                        style={{
                          color: 'var(--accent-rose)', padding: '6px 10px', borderRadius: '8px',
                          fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px'
                        }}
                      >
                        <Trash2 size={12} /> {t.btn_clear_history}
                      </button>
                    )}
                  </div>
                </div>

                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-dim)' }}>
                    <Compass size={32} style={{ opacity: 0.25, marginBottom: '10px' }} />
                    <p style={{ fontSize: '13px' }}>{t.audit_empty_1}</p>
                    <p style={{ fontSize: '12px', marginTop: '4px' }}>{t.audit_empty_2}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                    {history
                      .filter((item) => historyFilter === 'all' || item.source === historyFilter)
                      .map((item) => (
                      <div 
                        key={item.taskId} 
                        style={{ 
                          background: item.source === 'local' 
                            ? 'rgba(16, 185, 129, 0.03)' 
                            : item.source === 'cascade'
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(56, 189, 248, 0.04))'
                            : 'rgba(99, 102, 241, 0.03)',
                          border: `1px solid ${
                            item.source === 'local' 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : item.source === 'cascade'
                              ? 'rgba(99, 102, 241, 0.28)'
                              : 'rgba(99, 102, 241, 0.2)'
                          }`,
                          borderRadius: '10px', padding: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                              background: item.source === 'local' 
                                ? 'rgba(16, 185, 129, 0.1)' 
                                : item.source === 'cascade'
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(56, 189, 248, 0.15))'
                                : 'rgba(99, 102, 241, 0.1)',
                              color: item.source === 'local' ? 'var(--accent-emerald)' : 'var(--primary-glow)',
                              border: `1px solid ${
                                item.source === 'local' 
                                  ? 'rgba(16, 185, 129, 0.25)' 
                                  : 'rgba(99, 102, 241, 0.25)'
                              }`,
                              display: 'flex', alignItems: 'center', gap: '5px'
                            }}>
                              {item.source === 'local' ? <Cpu size={11} /> : item.source === 'cascade' ? <Zap size={11} color="var(--accent-cyan)" /> : <Cloud size={11} />}
                              {item.source === 'local'
                                ? (item.isRealHardware ? t.source_nano_native : t.source_nano_ondevice)
                                : item.source === 'cascade'
                                ? t.source_cascade
                                : t.source_cloud}
                            </span>

                            {item.breakdown.hasPII && (
                              <span style={{ 
                                fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px',
                                background: 'rgba(244, 63, 94, 0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.25)',
                                display: 'inline-flex', alignItems: 'center', gap: '4px'
                              }}>
                                <ShieldCheck size={11} /> {t.badge_pii_shield}
                              </span>
                            )}

                            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                              ID: {item.taskId}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} color="var(--accent-amber)" />
                              {t.latency_label} <strong style={{ color: 'var(--text-main)' }}>{item.latencyMs} ms</strong>
                            </span>
                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        {/* Pre-Análisis Especulativo si ocurrió en cascada */}
                        {item.speculativePreview && (
                          <div style={{ 
                            fontSize: '11px', color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.06)', 
                            border: '1px solid rgba(56, 189, 248, 0.18)', borderRadius: '6px', 
                            padding: '6px 10px', marginBottom: '8px' 
                          }}>
                            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Zap size={11} /> {t.speculative_nano_label}:</strong> {item.speculativePreview}
                          </div>
                        )}

                        <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                          {RoutingEvaluator.redactPII(item.content)}
                        </div>

                        {item.structuredTasks && item.structuredTasks.length > 0 && (
                          <div style={{ 
                            background: 'var(--bg-stripe)', border: '1px solid var(--border-subtle)', 
                            borderRadius: '8px', padding: '10px 14px', marginBottom: '10px' 
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle2 size={12} /> {t.structured_tasks_title}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {item.structuredTasks.map((st) => (
                                <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ArrowRight size={10} color="var(--primary-glow)" /> {RoutingEvaluator.redactPII(st.title)}
                                  </span>
                                  <span style={{ 
                                    fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                                    background: st.priority === 'alta' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-stripe)',
                                    color: st.priority === 'alta' ? 'var(--accent-rose)' : 'var(--text-muted)'
                                  }}>
                                    {st.priority.toUpperCase()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ 
                          fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', 
                          paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: 'var(--accent-amber)' }}>{t.router_reason_label}</strong> {RoutingEvaluator.redactPII(item.routerReason)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', color: 'var(--text-dim)' }}>
                              <span>{t.factor_confidence_score}: <strong style={{ color: 'var(--primary-glow)' }}>{item.breakdown.confidenceScore}%</strong></span>
                              <span>{t.factor_cost_saved}: <strong style={{ color: 'var(--accent-emerald)' }}>+${item.breakdown.estimatedCostUSD.toFixed(5)}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          )}
        </>
      )}

      {/* Auth modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(profile) => setUser(profile)}
        lang={lang}
      />

      {/* Footer */}
      <Footer onNavigate={(tab) => navigateTo(tab)} lang={lang} />

        </div>{/* /page-wrapper */}
      </div>{/* /main-content */}
    </div>  /* /app-shell */
  );
};
