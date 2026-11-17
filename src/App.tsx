import React, { useState, useEffect } from 'react';
import { HybridOrchestrator } from './orchestrator';
import { WorkerExecutionResult, OrchestratorMetric, RoutingMode, RoutingDecision } from './orchestrator/types';
import { RoutingEvaluator } from './orchestrator/rules/evaluator';
import { HomeView } from './views/HomeView';
import { DocsView } from './views/DocsView';
import { ApiView } from './views/ApiView';
import { AuthModal, UserProfile } from './components/AuthModal';
import { Footer } from './components/Footer';
import { 
  Zap, Cloud, Wifi, WifiOff, Cpu, Activity, 
  Layers, Clock, ShieldCheck, CheckCircle2, ArrowRight,
  Sparkles, Terminal, RefreshCw, Compass, FileSpreadsheet,
  FileCode, Play, Lock, Home, BookOpen, Code2, LogIn, LogOut
} from 'lucide-react';

export const App: React.FC = () => {
  const [orchestrator] = useState(() => new HybridOrchestrator());
  const [currentTab, setCurrentTab] = useState<'home' | 'dashboard' | 'docs' | 'api'>('home');
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'dev_jamar',
    email: 'jamar.masias@hackathon.dev',
    displayName: 'Jamar Masias',
    isAnonymous: false
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Estados del Dashboard
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
  const localSavings = totalCalls > 0 ? Math.round((localCalls / totalCalls) * 100) : 0;
  const avgLatency =
    totalCalls > 0
      ? Math.round(metrics.reduce((acc, m) => acc + m.latencyMs, 0) / totalCalls)
      : 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* ─── NAVBAR REFINADA ─── */}
      <nav className="glass-panel" style={{ padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentTab('home')}>
          <div style={{ 
            width: '38px', height: '38px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--primary-accent), var(--accent-cyan))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px -2px rgba(99, 102, 241, 0.4)'
          }}>
            <Compass size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              HYBRIDAGENT
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Firebase #BuildHybridAI 2026</div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'home', label: 'Inicio', icon: <Home size={15} /> },
            { id: 'dashboard', label: 'Dashboard', icon: <Terminal size={15} /> },
            { id: 'docs', label: 'Docs', icon: <BookOpen size={15} /> },
            { id: 'api', label: 'API', icon: <Code2 size={15} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id as any)}
              style={{
                background: currentTab === item.id ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
                color: currentTab === item.id ? 'var(--primary-glow)' : 'var(--text-muted)',
                border: currentTab === item.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Auth Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{user.displayName}</div>
                <div style={{ fontSize: '10px', color: 'var(--accent-emerald)' }}>● Firebase Auth Activo</div>
              </div>
              <button
                onClick={() => setUser(null)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-dim)', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                title="Cerrar Sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={14} /> Iniciar Sesión (RF-01)
            </button>
          )}
        </div>
      </nav>

      {/* ─── VISTAS ACTIVAS ─── */}
      {currentTab === 'home' && (
        <HomeView
          onGoToDashboard={() => setCurrentTab('dashboard')}
          onGoToDocs={() => setCurrentTab('docs')}
          onGoToAPI={() => setCurrentTab('api')}
        />
      )}

      {currentTab === 'docs' && <DocsView />}

      {currentTab === 'api' && <ApiView />}

      {currentTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          
          {/* Status Strip */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Red */}
            <div className="glass-panel" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                  Conectividad de Red
                </span>
                {isOnline ? <Wifi size={18} color="var(--accent-emerald)" /> : <WifiOff size={18} color="var(--accent-rose)" />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: isOnline ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {isOnline ? 'Online 🟢' : 'Modo Avión (Offline) 🔴'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isOnline ? 'Sincronizado con Firebase' : 'Cola local en IndexedDB'}
                  </div>
                </div>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px',
                    fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <RefreshCw size={12} />
                  Simular Red
                </button>
              </div>
            </div>

            {/* Gemini Nano */}
            <div className="glass-panel" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                  Gemini Nano (Local)
                </span>
                <Cpu size={18} color={isLocalReady ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: isLocalReady ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                    {isLocalReady ? (isNativeHardware ? 'Nativo (Prompt API window.ai) ⚡' : 'Listo en Dispositivo ✅') : isDownloading ? `Descargando... ${downloadProgress}%` : 'No Activo'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isLocalReady ? 'Latencia p95 < 280 ms · 0 tokens cloud' : 'Chrome desktop >= 139'}
                  </div>
                </div>
                {!isLocalReady && !isDownloading && (
                  <button
                    onClick={handleDownloadModel}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '11px' }}
                  >
                    Activar Nano
                  </button>
                )}
              </div>
            </div>

            {/* Estrategia */}
            <div className="glass-panel" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                  Estrategia del Orquestador
                </span>
                <Layers size={18} color="var(--primary-glow)" />
              </div>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as RoutingMode)}
                style={{
                  width: '100%', background: 'rgba(8, 10, 15, 0.85)', color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)', padding: '7px 10px', borderRadius: '8px',
                  fontSize: '13px', outline: 'none'
                }}
              >
                <option value="auto">Automático (Inteligente por Complejidad)</option>
                <option value="local_only">Forzar Solo Local (Gemini Nano)</option>
                <option value="cloud_only">Forzar Solo Nube (Gemini Cloud)</option>
              </select>
            </div>

            {/* Seguridad */}
            <div className="glass-panel" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                  Seguridad & Privacidad
                </span>
                <ShieldCheck size={18} color="var(--accent-emerald)" />
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                App Check + Zero-Trust PII
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Enmascaramiento [REDACTED] y atestación activa
              </div>
            </div>

          </section>

          {/* Métricas */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ahorro de Llamadas a Nube
              </div>
              <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                {localSavings}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Meta Hackathon RNF-06: ≥ 40%
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid var(--accent-cyan)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Latencia Promedio P95
              </div>
              <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                {avgLatency} <span style={{ fontSize: '16px', fontWeight: '600' }}>ms</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Nano Local: ~260ms | Cloud: ~850ms
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid var(--primary-glow)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ratio Local vs Nube
              </div>
              <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--primary-glow)', marginTop: '2px' }}>
                {localCalls} <span style={{ fontSize: '18px', color: 'var(--text-dim)' }}>/</span> {cloudCalls}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {totalCalls} llamadas totales auditadas
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cola de Tareas Offline
              </div>
              <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '2px' }}>
                {queueCount}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Reconciliación idempotente (RF-08)
              </div>
            </div>

          </section>

          {/* Consola con Chips de Demostración */}
          <section className="glass-panel" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="var(--primary-glow)" />
                Consola de Envío con Desglose en Tiempo Real
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>PROMPTS DE DEMO:</span>
                
                <button
                  onClick={() => handleSend(undefined, 'Reunión rápida de sync: revisar tareas del sprint y fijar fecha')}
                  style={{ 
                    fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Cpu size={13} /> Tarea Simple (Local)
                </button>

                <button
                  onClick={() => handleSend(undefined, 'Análisis profundo y arquitectura de microservicios distribuida con alta concurrencia')}
                  style={{ 
                    fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.35)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Cloud size={13} /> Tarea Compleja (Nube)
                </button>

                <button
                  onClick={() => handleSend(undefined, 'Guardar credenciales privadas: usuario juan@empresa.com con api_key: sk-proj-99482910')}
                  style={{ 
                    fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.35)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Lock size={13} /> Dato Sensible (Escudo Privacidad)
                </button>
              </div>
            </div>

            <form onSubmit={(e) => handleSend(e)} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Escribe una tarea o consulta (ej: 'Revisar notas y extraer tareas prioritarias')..."
                style={{
                  flex: 1, background: 'rgba(8, 10, 15, 0.9)', color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)', padding: '14px 18px', borderRadius: '12px',
                  fontSize: '14px', outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  padding: '0 28px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {isProcessing ? <RefreshCw size={16} className="pulse-badge" /> : <Play size={16} />}
                {isProcessing ? 'Enrutando...' : 'Despachar Tarea'}
              </button>
            </form>

            {/* Score Breakdown */}
            {activeDecision && (
              <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={14} /> Factores Evaluados por el Orquestador:
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    Tiempo de Decisión: {activeDecision.evaluationMs.toFixed(2)} ms (RNF-02 &lt; 50ms)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                    Tokens Estimados: <strong>{activeDecision.breakdown.tokenCount}</strong>
                  </span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                    Intención: <strong>{activeDecision.breakdown.intent.toUpperCase()}</strong>
                  </span>
                  <span style={{ 
                    fontSize: '11px', padding: '3px 8px', borderRadius: '6px', 
                    background: activeDecision.breakdown.hasPII ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: activeDecision.breakdown.hasPII ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    fontWeight: '700'
                  }}>
                    {activeDecision.breakdown.hasPII ? `🛡️ PII Detectado: ${activeDecision.breakdown.detectedPIITypes.join(', ')}` : 'Seguridad: Sin PII'}
                  </span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
                    Complejidad Score: <strong>{activeDecision.breakdown.complexityScore}/100</strong>
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', background: activeDecision.target === 'local' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', color: activeDecision.target === 'local' ? 'var(--accent-emerald)' : 'var(--primary-glow)' }}>
                    → RUTA ELEGIDA: {activeDecision.target.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Streaming */}
            {isProcessing && streamingText && (
              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--primary-accent)', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--primary-glow)', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={12} /> Generación en Streaming (Palabra por palabra)...
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontStyle: 'italic' }}>
                  {streamingText}
                </div>
              </div>
            )}
          </section>

          {/* Feed de Auditoría */}
          <section className="glass-panel" style={{ padding: '26px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--accent-emerald)" />
                  Auditoría y Trazabilidad Zero-Trust (RF-10, RF-15)
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Registro con enmascaramiento automático de datos confidenciales
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleExportJSON}
                  disabled={metrics.length === 0}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px',
                    fontSize: '11px', fontWeight: '600', cursor: metrics.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <FileCode size={13} color="var(--accent-cyan)" /> Exportar JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={metrics.length === 0}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px',
                    fontSize: '11px', fontWeight: '600', cursor: metrics.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <FileSpreadsheet size={13} color="var(--accent-emerald)" /> Exportar CSV
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
                <Compass size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p style={{ fontSize: '14px' }}>No hay inferencias registradas en esta sesión.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Prueba con los botones de demo arriba para ver streaming, enrutamiento y auditoría.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {history.map((item) => (
                  <div 
                    key={item.taskId} 
                    style={{ 
                      background: item.source === 'local' ? 'rgba(16, 185, 129, 0.03)' : 'rgba(99, 102, 241, 0.03)',
                      border: `1px solid ${item.source === 'local' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
                      borderRadius: '12px', padding: '18px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: item.source === 'local' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                          color: item.source === 'local' ? 'var(--accent-emerald)' : 'var(--primary-glow)',
                          border: `1px solid ${item.source === 'local' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                          display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                          {item.source === 'local' ? <Cpu size={12} /> : <Cloud size={12} />}
                          {item.source === 'local' ? (item.isRealHardware ? 'Gemini Nano (Prompt API Nativa)' : 'Gemini Nano (On-Device)') : 'Gemini Cloud (Firebase AI Logic)'}
                        </span>

                        {item.breakdown.hasPII && (
                          <span style={{ 
                            fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                            background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.3)'
                          }}>
                            🛡️ ESCUDO PRIVACIDAD ZERO-TRUST
                          </span>
                        )}

                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          ID: {item.taskId}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="var(--accent-amber)" />
                          Latencia: <strong style={{ color: 'var(--text-main)' }}>{item.latencyMs} ms</strong>
                        </span>
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '12px' }}>
                      {RoutingEvaluator.redactPII(item.content)}
                    </div>

                    {item.structuredTasks && item.structuredTasks.length > 0 && (
                      <div style={{ 
                        background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', 
                        borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' 
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={13} /> Tareas Estructuradas Extraídas (JSON Esquema RF-17):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {item.structuredTasks.map((t) => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ArrowRight size={11} color="var(--primary-glow)" /> {RoutingEvaluator.redactPII(t.title)}
                              </span>
                              <span style={{ 
                                fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px',
                                background: t.priority === 'alta' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                color: t.priority === 'alta' ? 'var(--accent-rose)' : 'var(--text-muted)'
                              }}>
                                {t.priority.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ 
                      fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', 
                      paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' 
                    }}>
                      <strong style={{ color: 'var(--accent-amber)' }}>Razón del Enrutador:</strong> {RoutingEvaluator.redactPII(item.routerReason)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      {/* ─── MODAL AUTH ─── */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(profile) => setUser(profile)}
      />

      {/* ─── FOOTER MODERNO COMPLETO ─── */}
      <Footer onNavigate={(tab) => setCurrentTab(tab)} />

    </div>
  );
};
