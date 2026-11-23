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
import { logoutUser, loginAnonymously, subscribeToAuthChanges } from './firebase';
import { Language, translations } from './i18n';
import { 
  Zap, Cloud, Wifi, WifiOff, Cpu, Activity, 
  Layers, Clock, ShieldCheck, CheckCircle2, ArrowRight,
  Sparkles, Terminal, RefreshCw, Compass, FileSpreadsheet,
  FileCode, Play, Lock, Home, BookOpen, Code2, LogIn, LogOut,
  Shield, Sun, Moon, Globe, Check, AlertCircle, DollarSign,
  TrendingDown, Gauge
} from 'lucide-react';

export const App: React.FC = () => {
  const [orchestrator] = useState(() => new HybridOrchestrator());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromHash());
  
  // Soporte de Idioma y Tema Claro/Oscuro
  const [lang, setLang] = useState<Language>('es');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const t = translations[lang];

  // Estado de Autenticación (Requerido para el Dashboard)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAnonLoading, setIsAnonLoading] = useState(false);

  // Estados del Dashboard de Inferencia
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
  const [streamingText, setStreamingText] = useState('');
  const [activeDecision, setActiveDecision] = useState<RoutingDecision | null>(null);

  // Aplicar tema en data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Suscripción al estado de autenticación real de Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : (lang === 'es' ? 'Invitado Firebase' : 'Firebase Guest')),
          isAnonymous: fbUser.isAnonymous
        });
      }
    });
    return () => unsubscribe();
  }, [lang]);

  // Sincronización con URL Hash
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

    if (outcome.result) {
      setHistory((prev) => [outcome.result!, ...prev]);
    }
    setMetrics(orchestrator.getMetrics());
    setQueueCount(orchestrator.getQueueLength());

    setPrompt('');
    setStreamingText('');
    setIsProcessing(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const handleQuickGuestLogin = async () => {
    setIsAnonLoading(true);
    try {
      const fbUser = await loginAnonymously();
      setUser({
        uid: fbUser.uid,
        email: null,
        displayName: lang === 'es' ? 'Invitado Anónimo' : 'Anonymous Guest',
        isAnonymous: true
      });
    } catch (e) {
      console.warn('Error en acceso anónimo:', e);
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
    a.download = `hybridagent-audit-${Date.now()}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const data = orchestrator.exportAuditLogsAsCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hybridagent-audit-${Date.now()}.csv`;
    a.click();
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

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* ─── NAVBAR ELEGANTE Y MADURO ─── */}
      <nav className="glass-panel" style={{ padding: '14px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigateTo('home')}>
          <div style={{ 
            width: '38px', height: '38px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--primary-accent), #4f46e5)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px -2px rgba(99, 102, 241, 0.35)'
          }}>
            <Compass size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              HYBRIDAGENT
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500' }}>Firebase #BuildHybridAI 2026</div>
          </div>
        </div>

        {/* Links de Navegación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'home', label: t.nav_home, icon: <Home size={15} /> },
            { id: 'dashboard', label: t.nav_dashboard, icon: <Terminal size={15} />, requiresAuth: true },
            { id: 'docs', label: t.nav_docs, icon: <BookOpen size={15} /> },
            { id: 'api', label: t.nav_api, icon: <Code2 size={15} /> },
            { id: 'security', label: t.nav_security, icon: <Shield size={15} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id as AppRoute)}
              style={{
                background: currentRoute === item.id ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                color: currentRoute === item.id ? 'var(--primary-glow)' : 'var(--text-muted)',
                border: currentRoute === item.id ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {item.icon} {item.label}
              {item.requiresAuth && !user && (
                <Lock size={11} style={{ opacity: 0.6, marginLeft: '2px' }} />
              )}
            </button>
          ))}
        </div>

        {/* Acciones: Idioma, Tema y Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Toggle de Idioma ES / EN */}
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)', padding: '7px 11px', borderRadius: '8px',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
            title="Cambiar Idioma / Switch Language"
          >
            <Globe size={13} /> {lang.toUpperCase()}
          </button>

          {/* Toggle de Tema Light / Dark */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)', padding: '7px 10px', borderRadius: '8px',
              fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Modo Claro / Modo Oscuro"
          >
            {theme === 'dark' ? <Sun size={14} color="var(--accent-amber)" /> : <Moon size={14} color="var(--primary-accent)" />}
          </button>

          {/* Auth Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '4px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{user.displayName}</div>
                <div style={{ fontSize: '10px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
                  {t.nav_auth_connected}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{ 
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', 
                  color: 'var(--text-dim)', padding: '7px', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title={t.nav_logout_title}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={13} /> {t.nav_login}
            </button>
          )}

        </div>
      </nav>

      {/* ─── VISTAS ACTIVAS ─── */}
      {currentRoute === 'home' && (
        <HomeView
          onGoToDashboard={() => navigateTo('dashboard')}
          onGoToDocs={() => navigateTo('docs')}
          onGoToAPI={() => navigateTo('api')}
          lang={lang}
        />
      )}

      {currentRoute === 'docs' && <DocsView />}

      {currentRoute === 'api' && <ApiView />}

      {currentRoute === 'security' && <SecurityView />}

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
                  {lang === 'es' ? 'Autenticación Requerida' : 'Authentication Required'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  {lang === 'es' 
                    ? 'Para acceder a la consola de inferencia, interactuar con Gemini Nano en tiempo real y auditar las decisiones del orquestador, debes iniciar sesión con Firebase.'
                    : 'To access the real-time inference console, interact with on-device Gemini Nano, and audit routing telemetry, please sign in with Firebase.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <LogIn size={15} />
                  {lang === 'es' ? 'Iniciar Sesión / Registrarse' : 'Sign In / Register'}
                </button>

                <button
                  onClick={handleQuickGuestLogin}
                  disabled={isAnonLoading}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', 
                    color: 'var(--text-main)', padding: '12px 20px', borderRadius: '10px', 
                    fontSize: '13px', fontWeight: '600', cursor: isAnonLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                  }}
                >
                  {isAnonLoading ? <RefreshCw size={14} className="pulse-badge" /> : <Sparkles size={14} color="var(--accent-cyan)" />}
                  {lang === 'es' ? 'Acceso Rápido como Invitado' : 'Quick Guest Access'}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Status Strip Maduro */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                
                {/* Red */}
                <div className="glass-panel" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                      {t.status_net_title}
                    </span>
                    {isOnline ? <Wifi size={16} color="var(--accent-emerald)" /> : <WifiOff size={16} color="var(--accent-rose)" />}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: isOnline ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                        {isOnline ? t.status_online : t.status_offline}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isOnline ? t.status_synced : t.status_queued}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOnline(!isOnline)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)', padding: '5px 10px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <RefreshCw size={11} />
                      {t.btn_simulate_net}
                    </button>
                  </div>
                </div>

                {/* Gemini Nano */}
                <div className="glass-panel" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                      {t.status_nano_title}
                    </span>
                    <Cpu size={16} color={isLocalReady ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: isLocalReady ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {isLocalReady ? (isNativeHardware ? t.status_nano_native : t.status_nano_ready) : isDownloading ? `${t.status_nano_downloading}${downloadProgress}%` : t.status_nano_inactive}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isLocalReady ? 'Latencia p95 < 280 ms' : 'Chrome Prompt API'}
                      </div>
                    </div>
                    {!isLocalReady && !isDownloading && (
                      <button
                        onClick={handleDownloadModel}
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '11px' }}
                      >
                        {t.btn_activate_nano}
                      </button>
                    )}
                  </div>
                </div>

                {/* Estrategia */}
                <div className="glass-panel" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
                      border: '1px solid var(--border-subtle)', padding: '6px 10px', borderRadius: '8px',
                      fontSize: '12px', outline: 'none'
                    }}
                  >
                    <option value="auto">{t.opt_strategy_auto}</option>
                    <option value="cascade">{t.opt_strategy_cascade}</option>
                    <option value="local_only">{t.opt_strategy_local}</option>
                    <option value="cloud_only">{t.opt_strategy_cloud}</option>
                  </select>
                </div>

                {/* Seguridad */}
                <div className="glass-panel" style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => navigateTo('security')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                      {t.status_sec_title}
                    </span>
                    <ShieldCheck size={16} color="var(--accent-emerald)" />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                    {t.status_sec_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t.status_sec_desc}
                  </div>
                </div>

              </section>

              {/* Métricas Maduras */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
                
                <div className="glass-panel" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                      {t.metric_savings_title}
                    </span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                    {localSavings}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {t.metric_savings_sub}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                      {t.metric_latency_title}
                    </span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                    {avgLatency} <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-muted)' }}>ms</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {t.metric_latency_sub}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                      {t.metric_ratio_title}
                    </span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-glow)' }}></span>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--primary-glow)', marginTop: '4px' }}>
                    {localCalls + cascadeCalls} <span style={{ fontSize: '16px', color: 'var(--text-dim)', fontWeight: '400' }}>/</span> {cloudCalls}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {totalCalls} {t.metric_ratio_sub}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                      {t.metric_queue_title}
                    </span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }}></span>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '4px' }}>
                    {queueCount}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {t.metric_queue_sub}
                  </div>
                </div>

              </section>

              {/* Consola de Envío con Orquestación Avanzada */}
              <section className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={17} color="var(--primary-glow)" />
                    {t.console_title}
                  </h2>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>{t.demo_prompts_label}</span>
                    
                    <button
                      onClick={() => handleSend(undefined, 'Reunión rápida de sync: revisar tareas del sprint y fijar fecha')}
                      style={{ 
                        fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.25)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <Cpu size={12} /> {t.btn_demo_simple}
                    </button>

                    <button
                      onClick={() => handleSend(undefined, 'Análisis profundo y arquitectura de microservicios distribuida con alta concurrencia')}
                      style={{ 
                        fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-glow)', border: '1px solid rgba(99, 102, 241, 0.25)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <Cloud size={12} /> {t.btn_demo_complex}
                    </button>

                    <button
                      onClick={() => handleSend(undefined, 'Guardar credenciales privadas: usuario juan@empresa.com con api_key: sk-proj-99482910')}
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
                        handleSend(undefined, 'Diseñar arquitectura escalable en tiempo real y extraer un plan de migración paso a paso');
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

                <form onSubmit={(e) => handleSend(e)} style={{ display: 'flex', gap: '10px' }}>
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
                  <div style={{ marginTop: '16px', padding: '16px 20px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                    
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
                          🎯 {activeDecision.breakdown.confidenceScore}% {t.factor_confidence}
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
                        <span>Complejidad Semántica (Score de Inferencia)</span>
                        <strong style={{ color: activeDecision.breakdown.complexityScore >= 50 ? 'var(--primary-glow)' : 'var(--accent-emerald)' }}>
                          {activeDecision.breakdown.complexityScore} / 100
                        </strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
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
                  <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(99, 102, 241, 0.04)', border: '1px dashed rgba(99, 102, 241, 0.3)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--primary-glow)', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={12} /> {t.streaming_label}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {streamingText}
                    </div>
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
                    </h2>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {t.audit_desc}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleExportJSON}
                      disabled={metrics.length === 0}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px',
                        fontSize: '11px', fontWeight: '600', cursor: metrics.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <FileCode size={12} color="var(--accent-cyan)" /> {t.btn_export_json}
                    </button>
                    <button
                      onClick={handleExportCSV}
                      disabled={metrics.length === 0}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px',
                        fontSize: '11px', fontWeight: '600', cursor: metrics.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <FileSpreadsheet size={12} color="var(--accent-emerald)" /> {t.btn_export_csv}
                    </button>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-dim)' }}>
                    <Compass size={36} style={{ opacity: 0.25, marginBottom: '10px' }} />
                    <p style={{ fontSize: '13px' }}>{t.audit_empty_1}</p>
                    <p style={{ fontSize: '12px', marginTop: '4px' }}>{t.audit_empty_2}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {history.map((item) => (
                      <div 
                        key={item.taskId} 
                        style={{ 
                          background: item.source === 'local' 
                            ? 'rgba(16, 185, 129, 0.02)' 
                            : item.source === 'cascade'
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.03), rgba(56, 189, 248, 0.03))'
                            : 'rgba(99, 102, 241, 0.02)',
                          border: `1px solid ${
                            item.source === 'local' 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : item.source === 'cascade'
                              ? 'rgba(99, 102, 241, 0.3)'
                              : 'rgba(99, 102, 241, 0.2)'
                          }`,
                          borderRadius: '10px', padding: '16px'
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
                                ? (item.isRealHardware ? 'Gemini Nano (Prompt API Nativa)' : 'Gemini Nano (On-Device)')
                                : item.source === 'cascade'
                                ? 'Co-Inferencia Híbrida (Nano Especulativo ➔ Cloud)'
                                : 'Gemini Cloud (Firebase AI Logic)'}
                            </span>

                            {item.breakdown.hasPII && (
                              <span style={{ 
                                fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                                background: 'rgba(244, 63, 94, 0.12)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.25)'
                              }}>
                                🛡️ PRIVACIDAD ZERO-TRUST
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
                            <strong>⚡ Pre-Extracción Especulativa Nano (&lt; 180ms):</strong> {item.speculativePreview}
                          </div>
                        )}

                        <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                          {RoutingEvaluator.redactPII(item.content)}
                        </div>

                        {item.structuredTasks && item.structuredTasks.length > 0 && (
                          <div style={{ 
                            background: 'rgba(0, 0, 0, 0.12)', border: '1px solid var(--border-subtle)', 
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
                                    fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '3px',
                                    background: st.priority === 'alta' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
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
                            <span>Certeza: <strong style={{ color: 'var(--primary-glow)' }}>{item.breakdown.confidenceScore}%</strong></span>
                            <span>Ahorro Estimado: <strong style={{ color: 'var(--accent-emerald)' }}>+${item.breakdown.estimatedCostUSD.toFixed(5)}</strong></span>
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

      {/* ─── MODAL AUTH REAL CON FIREBASE ─── */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(profile) => setUser(profile)}
        lang={lang}
      />

      {/* ─── FOOTER MODERNO COMPLETO ─── */}
      <Footer onNavigate={(tab) => navigateTo(tab)} />

    </div>
  );
};
