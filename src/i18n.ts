export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Nav
    nav_home: 'Inicio',
    nav_dashboard: 'Dashboard',
    nav_docs: 'Docs',
    nav_api: 'API',
    nav_security: 'Seguridad',
    nav_login: 'Iniciar Sesión',
    nav_auth_connected: '● Conectado',
    nav_logout_title: 'Cerrar Sesión',

    // Hero Home
    hero_badge: 'CANDIDATO BEST WEB / CHROME APP · #BUILDHYBRIDAI 2026',
    hero_title_1: 'Inferencia Híbrida Inteligente.',
    hero_title_2: 'Gemini Nano On-Device ⇄ Gemini Cloud.',
    hero_desc: 'El primer orquestador que analiza tokens, intención y datos sensibles en tiempo real (< 50ms). Resuelve tareas simples y datos confidenciales en el navegador con Gemini Nano (0 tokens de red, ultra-privado) y escala tareas complejas a Firebase AI Logic.',
    hero_btn_dashboard: 'Abrir Dashboard',
    hero_btn_docs: 'Ver Documentación',
    hero_btn_api: 'Referencia de API',

    // Pillars
    pillar_local_title: 'Gemini Nano On-Device',
    pillar_local_desc: 'Aprovecha window.ai.languageModel de Chrome Desktop. Ejecuta modelos en hardware local con latencia inferior a 280ms y funcionamiento 100% offline.',
    pillar_privacy_title: 'Escudo de Privacidad Zero-Trust',
    pillar_privacy_desc: 'Detección proactiva de datos sensibles (correos, contraseñas, API keys). Bloquea la salida a internet y fuerza ejecución en memoria local para máxima confidencialidad.',
    pillar_cloud_title: 'Firebase AI Logic & App Check',
    pillar_cloud_desc: 'Escala tareas de razonamiento profundo o gran contexto a la nube con streaming de respuesta palabra por palabra, protegido por atestación de seguridad oficial.',

    // Stats
    stat_savings_label: 'Ahorro de Cargas a la Nube',
    stat_latency_label: 'Latencia Local Gemini Nano',
    stat_resilience_label: 'Resiliencia en Modo Avión',

    // Dashboard Status
    status_net_title: 'Conectividad de Red',
    status_online: 'En Línea 🟢',
    status_offline: 'Modo Avión (Offline) 🔴',
    status_synced: 'Sincronizado con Firebase',
    status_queued: 'Cola local en IndexedDB',
    btn_simulate_net: 'Alternar Red',

    status_nano_title: 'Gemini Nano (Local)',
    status_nano_ready: 'Listo en Dispositivo ✅',
    status_nano_native: 'Nativo (Prompt API window.ai) ⚡',
    status_nano_downloading: 'Descargando... ',
    status_nano_inactive: 'No Activo',
    btn_activate_nano: 'Activar Nano',

    status_strategy_title: 'Estrategia del Orquestador',
    opt_strategy_auto: 'Automático (Matriz Adaptativa)',
    opt_strategy_cascade: 'Híbrido en Cascada (Speculative Nano + Cloud)',
    opt_strategy_local: 'Forzar Solo Local (Gemini Nano)',
    opt_strategy_cloud: 'Forzar Solo Nube (Gemini Cloud)',

    status_sec_title: 'Seguridad & Privacidad',
    status_sec_name: 'App Check + Zero-Trust PII ➔',
    status_sec_desc: 'Enmascaramiento [REDACTED] y atestación activa',

    // Metrics
    metric_savings_title: 'Ahorro de Llamadas a Nube',
    metric_savings_sub: 'Objetivo de Optimización: ≥ 40%',
    metric_latency_title: 'Latencia Promedio P95',
    metric_latency_sub: 'Nano Local: ~260ms | Cloud: ~850ms',
    metric_ratio_title: 'Ratio Local vs Nube',
    metric_ratio_sub: 'llamadas totales auditadas',
    metric_queue_title: 'Cola de Tareas Offline',
    metric_queue_sub: 'Reconciliación sin conexión en espera',

    // Console
    console_title: 'Consola de Envío con Desglose en Tiempo Real',
    demo_prompts_label: 'PROMPTS DE DEMO:',
    btn_demo_simple: 'Tarea Simple (Local)',
    btn_demo_complex: 'Tarea Compleja (Nube)',
    btn_demo_privacy: 'Dato Sensible (Privacidad)',
    btn_demo_cascade: 'Cascada Co-Inferencia',
    input_placeholder: 'Escribe una tarea o consulta (ej: "Revisar notas y extraer tareas prioritarias")...',
    btn_dispatch: 'Despachar Tarea',
    btn_dispatching: 'Enrutando...',

    // Breakdown & Vector Matrix
    factors_evaluated: 'Matriz de Decisión del Orquestador (XAI Vector):',
    decision_time: 'Tiempo de Decisión:',
    factor_tokens: 'Tokens Estimados:',
    factor_intent: 'Intención:',
    factor_pii_detected: '🛡️ PII Detectado:',
    factor_no_pii: 'Sin PII Detectado',
    factor_score: 'Complejidad Score:',
    factor_route: '→ RUTA SELECCIONADA:',
    factor_confidence: 'Certeza Enrutador:',
    factor_latency_sla: 'SLA Latencia:',
    factor_cost_avoided: 'Costo Evitado Nube:',
    streaming_label: 'Generación en Streaming (Palabra por palabra)...',

    // Audit
    audit_title: 'Auditoría y Trazabilidad Zero-Trust',
    audit_desc: 'Registro en tiempo real con enmascaramiento automático de datos confidenciales',
    btn_export_json: 'Exportar JSON',
    btn_export_csv: 'Exportar CSV',
    audit_empty_1: 'No hay inferencias registradas en esta sesión.',
    audit_empty_2: 'Prueba con los botones de demo arriba para ver streaming, enrutamiento y auditoría.',
    structured_tasks_title: 'Tareas Estructuradas Extraídas (Esquema JSON):',
    router_reason_label: 'Razón del Enrutador:',
    latency_label: 'Latencia:',

    // Auth Modal
    auth_title: 'Autenticación de Usuario',
    auth_desc: 'Sesión asegurada mediante Firebase Auth',
    auth_tab_login: 'Iniciar Sesión',
    auth_tab_register: 'Crear Cuenta',
    auth_email_label: 'Correo Electrónico',
    auth_pass_label: 'Contraseña',
    auth_btn_submit_login: 'Iniciar Sesión',
    auth_btn_submit_register: 'Registrarse con Firebase',
    auth_loading: 'Validando con Firebase...',
    auth_or: '— o para acceso instantáneo —',
    auth_btn_anon: 'Acceso Rápido como Invitado',
    auth_btn_cancel: 'Cancelar y volver'
  },
  en: {
    // Nav
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_docs: 'Docs',
    nav_api: 'API',
    nav_security: 'Security',
    nav_login: 'Sign In',
    nav_auth_connected: '● Connected',
    nav_logout_title: 'Sign Out',

    // Hero Home
    hero_badge: 'OFFICIAL CANDIDATE BEST WEB / CHROME APP · #BUILDHYBRIDAI 2026',
    hero_title_1: 'Intelligent Hybrid Inference.',
    hero_title_2: 'Gemini Nano On-Device ⇄ Gemini Cloud.',
    hero_desc: 'The first reactive orchestrator analyzing tokens, intent, and sensitive data in real time (< 50ms). Resolves simple and confidential tasks inside the browser with Gemini Nano (0 network tokens, ultra-private) and escalates complex reasoning to Firebase AI Logic.',
    hero_btn_dashboard: 'Open Dashboard',
    hero_btn_docs: 'View Documentation',
    hero_btn_api: 'API Reference',

    // Pillars
    pillar_local_title: 'Gemini Nano On-Device',
    pillar_local_desc: 'Leverages Chrome Desktop window.ai.languageModel. Executes models on local hardware with sub-280ms latency and 100% offline capability.',
    pillar_privacy_title: 'Zero-Trust Privacy Shield',
    pillar_privacy_desc: 'Proactive PII detection (emails, passwords, API keys). Blocks network output and forces on-device RAM execution for maximum confidentiality.',
    pillar_cloud_title: 'Firebase AI Logic & App Check',
    pillar_cloud_desc: 'Scales deep reasoning and high-context workloads to Gemini Cloud with token streaming, protected by official App Check cryptographic attestation.',

    // Stats
    stat_savings_label: 'Cloud Call Savings',
    stat_latency_label: 'Local Gemini Nano Latency',
    stat_resilience_label: 'Airplane Mode Resilience',

    // Dashboard Status
    status_net_title: 'Network Connectivity',
    status_online: 'Online 🟢',
    status_offline: 'Airplane Mode (Offline) 🔴',
    status_synced: 'Synced with Firebase',
    status_queued: 'Local queue in IndexedDB',
    btn_simulate_net: 'Toggle Network',

    status_nano_title: 'Gemini Nano (Local)',
    status_nano_ready: 'Ready on Device ✅',
    status_nano_native: 'Native (Prompt API window.ai) ⚡',
    status_nano_downloading: 'Downloading... ',
    status_nano_inactive: 'Not Active',
    btn_activate_nano: 'Activate Nano',

    status_strategy_title: 'Orchestrator Strategy',
    opt_strategy_auto: 'Automatic (Adaptive Matrix)',
    opt_strategy_cascade: 'Cascade Speculative (Nano Speculative + Cloud)',
    opt_strategy_local: 'Force Local Only (Gemini Nano)',
    opt_strategy_cloud: 'Force Cloud Only (Gemini Cloud)',

    status_sec_title: 'Security & Privacy',
    status_sec_name: 'App Check + Zero-Trust PII ➔',
    status_sec_desc: 'Active [REDACTED] masking & attestation',

    // Metrics
    metric_savings_title: 'Cloud Call Savings',
    metric_savings_sub: 'Target Optimization: ≥ 40%',
    metric_latency_title: 'Average Latency P95',
    metric_latency_sub: 'Local Nano: ~260ms | Cloud: ~850ms',
    metric_ratio_title: 'Local vs Cloud Ratio',
    metric_ratio_sub: 'total audited calls',
    metric_queue_title: 'Offline Queue',
    metric_queue_sub: 'Offline sync pending',

    // Console
    console_title: 'Dispatch Console with Real-Time Breakdown',
    demo_prompts_label: 'DEMO PROMPTS:',
    btn_demo_simple: 'Simple Task (Local)',
    btn_demo_complex: 'Complex Task (Cloud)',
    btn_demo_privacy: 'Sensitive Data (Privacy)',
    btn_demo_cascade: 'Cascade Co-Inference',
    input_placeholder: 'Enter a task or prompt (e.g. "Review sprint notes and extract priority tasks")...',
    btn_dispatch: 'Dispatch Task',
    btn_dispatching: 'Routing...',

    // Breakdown & Vector Matrix
    factors_evaluated: 'Orchestrator Decision Matrix (XAI Vector):',
    decision_time: 'Decision Time:',
    factor_tokens: 'Estimated Tokens:',
    factor_intent: 'Intent:',
    factor_pii_detected: '🛡️ PII Detected:',
    factor_no_pii: 'No PII Detected',
    factor_score: 'Complexity Score:',
    factor_route: '→ SELECTED ROUTE:',
    factor_confidence: 'Router Confidence:',
    factor_latency_sla: 'Latency SLA:',
    factor_cost_avoided: 'Avoided Cloud Cost:',
    streaming_label: 'Token Streaming Generation (Word by word)...',

    // Audit
    audit_title: 'Zero-Trust Audit & Traceability',
    audit_desc: 'Real-time record with automatic confidential data redaction',
    btn_export_json: 'Export JSON',
    btn_export_csv: 'Export CSV',
    audit_empty_1: 'No inference events recorded in this session.',
    audit_empty_2: 'Use the demo preset buttons above to test streaming, routing, and audit logs.',
    structured_tasks_title: 'Extracted Structured Tasks (JSON Schema):',
    router_reason_label: 'Router Reason:',
    latency_label: 'Latency:',

    // Auth Modal
    auth_title: 'User Authentication',
    auth_desc: 'Session secured by official Firebase Auth tokens',
    auth_tab_login: 'Sign In',
    auth_tab_register: 'Create Account',
    auth_email_label: 'Email Address',
    auth_pass_label: 'Password',
    auth_btn_submit_login: 'Sign In',
    auth_btn_submit_register: 'Register with Firebase',
    auth_loading: 'Validating with Firebase...',
    auth_or: '— or for instant access —',
    auth_btn_anon: 'Quick Sign-In as Guest',
    auth_btn_cancel: 'Cancel and return'
  }
};
