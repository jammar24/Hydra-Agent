# 🐉 HYDRA (Agent AI) — Hybrid AI Orchestration Engine

> **HYDRA Agent AI: Intelligent Hybrid Local & Cloud Inference Orchestrator**  
> **Author:** Jamar Masias | **Production App:** [hydra-agent.vercel.app](https://hydra-agent.vercel.app/)  
> **License:** Apache-2.0 (Open Source)  
> **Tagline:** *"Many heads. One decision: where to think." / "Varias cabezas, una decisión: dónde pensar."*

---

## 💡 1. Overview & Problem Statement

Modern AI agents often rely exclusively on remote cloud APIs:
- ❌ **Unnecessary Token Costs:** Everyday queries and repetitive parsing incur full cloud billing.
- ❌ **Network Latency:** Each simple request experiences 1–3 seconds of latency over the wire.
- ❌ **Complete Offline Failure:** When connectivity is lost, the agent stops working entirely.
- ❌ **Privacy Risks:** Sensitive data (passwords, tokens, credentials) travels to remote servers.

### 🌟 The HYDRA Solution
Inspired by the mythical creature of coordinated heads, **HYDRA** delegates computational workloads across **4 specialized heads**:

1. **Head 1 — Local On-Device Inference (Gemini Nano):**  
   Leverages device hardware via modern browser APIs (Chrome Desktop) for rapid summarization and structured JSON extraction with 0 network tokens.
2. **Head 2 — Scalable Cloud Inference (Gemini Cloud via Firebase AI Logic):**  
   Escalates complex, high-context reasoning tasks to the cloud with real-time token streaming verified by cryptographic attestation.
3. **Head 3 — Zero-Trust Privacy Shield:**  
   Scans prompts in memory for confidential patterns (emails, passwords, API keys `sk-`, credit cards). Automatically isolates tasks locally to prevent remote data leaks.
4. **Head 4 — Offline Synchronization & Resilience:**  
   Offline tasks execute immediately on-device; complex cloud queries queue safely in IndexedDB for idempotent reconciliation upon reconnection.

---

## 🏗️ 2. Architectural Decision Flow

```mermaid
flowchart TD
    User([User Prompt / Structured Note]) --> UI[HYDRA Dashboard]
    UI --> Evaluator[RoutingEvaluator: Token, Intent & PII Analysis]
    
    Evaluator -->|Sensitive PII Detected?| PII{Head 3: Privacy Shield}
    PII -->|YES: Force Local| Head1[Head 1: Gemini Nano On-Device]
    
    PII -->|NO| Complexity{Complexity Score Threshold}
    Complexity -->|Score < 50: Simple| Head1
    Complexity -->|Score >= 50: Complex| NetCheck{Active Network?}
    
    NetCheck -->|YES: Online| Head2[Head 2: Cloud Inference Engine]
    NetCheck -->|NO: Airplane Mode| OfflineQueue[(Head 4: Offline Storage Queue)]
    
    Head2 -->|Timeout > 8s / Network Error| FallbackLocal[Resilient Degrade to Local Nano]
    
    Head1 --> Audit[Audit Log & Redacted Telemetry]
    Head2 --> Audit
    OfflineQueue -->|Network Restored| Drain[Idempotent Queue Drain] --> Audit
```

---

## 🧪 3. Automated Test Suite (23/23 Passing)

The project includes a comprehensive test suite covering all routing, privacy, and fallback behaviors:

```bash
# Run test suite
npm test
```

### Coverage:
- **PT-01 / PT-01b:** Simple on-device task routing and latency SLA verification.
- **PT-02 / PT-02b:** Complex task escalation to Gemini Cloud with complexity threshold ≥ 50.
- **PT-03:** Offline resilience mode and queue storage.
- **PT-04 / PT-04b:** Reconnection and idempotent queue draining.
- **PT-05:** Telemetry tracking, latency recording, and cost calculation.
- **PT-06 (a-d):** Zero-Trust privacy shield (emails, API keys, credentials).
- **PT-07 (a-c):** In-memory PII masking (`[EMAIL_PROTEGIDO]`, `[API_KEY_CONFIDENCIAL]`).
- **PT-08 (a-c):** Cascade speculative mode (Nano draft + Cloud synthesis).
- **PT-09 (a-c):** XAI multidimensional decision vector (< 50ms evaluation).
- **PT-10 (a-b):** Audit log export integrity in standard JSON and CSV formats.

---

## 🚀 4. Local Quick Start

### Prerequisites
- Node.js 18 or higher
- Modern Chromium browser (Chrome 139+ recommended for Prompt API)

### Setup & Run
```bash
# 1. Clone the repository
git clone https://github.com/your-username/hydra-agent.git
cd hydra-agent

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env.local

# 4. Run test suite
npm test

# 5. Start development server
npm run dev
```

Application will be available at `http://localhost:5173`.

---

## 🌐 5. Production Deployment

Pre-configured for static hosting platforms like Vercel:

```bash
# Production build
npm run build

# Deploy to Vercel
vercel --prod
```

Live Production Application: [https://hydra-agent.vercel.app/](https://hydra-agent.vercel.app/)

---

## 🛡️ 6. Security & Data Protection
- Production secrets are strictly protected from git tracking via `.gitignore`.
- PII detection runs locally in browser memory before any network request is initiated.
- Cryptographic attestation verifies that client requests originate from genuine app instances.

---

## 📜 7. License
Distributed under the **Apache-2.0** Open Source License. See [`LICENSE`](file:///C:/Users/jamma/.gemini/antigravity/scratch/hybridagent/LICENSE) for details.  
Copyright © 2026 Jamar Masias - HYDRA.
