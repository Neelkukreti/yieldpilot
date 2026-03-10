# YieldPilot - Development Plan & Handover Document

> **Keep this file updated!** Every dev (human or AI) working on this project MUST update this doc when they complete a task, change architecture, or discover something important. This is our single source of truth.

---

## Project Overview

**YieldPilot** is an AI treasury copilot for stablecoin allocation on Solana with enforceable policy controls. Built for the **StableHacks Solana Hackathon** ($220K prize pool).

**One-liner pitch:** "An AI treasury copilot for stablecoin allocation on Solana with enforceable policy controls."

**Demo promise:** "Given a treasury mandate, YieldPilot recommends the safest compliant stablecoin allocation, explains why, and can execute it on Solana."

### Key Dates
| Milestone | Date | Status |
|-----------|------|--------|
| Pre-registration deadline | March 12, 2026 | URGENT |
| Submission deadline | TBD (2-4 weeks after pre-reg) | -- |
| Demo Day | April 8, 2026 (Zurich, top 10 teams) | -- |

### Links
| Resource | URL |
|----------|-----|
| Hackathon page | https://dorahacks.io/hackathon/stablehacks/detail |
| GitHub repo | https://github.com/Neelkukreti/yieldpilot |
| Vercel preview | TBD |
| API deployment | TBD |

---

## Architecture

### Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Monorepo | Turborepo + pnpm | Shared types, fast builds |
| Frontend | Next.js 15 + Tailwind 4 + shadcn/ui | Fast, polished, App Router |
| Backend | Express + tRPC | End-to-end type safety, lightweight |
| AI | Claude via @anthropic-ai/sdk | Best at structured reasoning explanations |
| Database | PostgreSQL + Prisma | Audit trail needs real DB |
| Blockchain | Solana devnet, @solana/web3.js + wallet-adapter | Required by hackathon |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Dashboard │ │ Policy   │ │Recommend │ │ Audit  │ │
│  │Overview  │ │ Setup    │ │ Review   │ │  Log   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │            Wallet Adapter (Phantom)              ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────┬───────────────────────────────┘
                      │ tRPC
┌─────────────────────▼───────────────────────────────┐
│                   BACKEND (Express)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │  Strategy    │ │   Policy     │ │     AI       │ │
│  │  Fetcher     │ │   Engine     │ │  Explainer   │ │
│  │  + Adapters  │ │  (rules)     │ │  (Claude)    │ │
│  └──────┬───────┘ └──────────────┘ └──────────────┘ │
│  ┌──────▼───────┐ ┌──────────────┐ ┌──────────────┐ │
│  │  Scoring     │ │  Allocation  │ │  Execution   │ │
│  │  Engine      │ │   Planner    │ │   Service    │ │
│  └──────────────┘ └──────────────┘ └──────┬───────┘ │
└───────────────────────────────────────────┼─────────┘
                                            │
┌───────────────────────────────────────────▼─────────┐
│                   SOLANA (devnet)                     │
│   USDC/USDT balances → Kamino vaults → TX execution  │
└─────────────────────────────────────────────────────┘
```

### Critical Design Rule
> **The LLM (Claude) NEVER decides capital allocation.** The deterministic policy engine and scoring engine decide. Claude only explains the reasoning in natural language. This is a core trust property of the product.

---

## Repo Structure

```
yieldpilot/
  package.json                    # pnpm workspace root
  pnpm-workspace.yaml
  turbo.json
  docker-compose.yml              # PostgreSQL
  PLAN.md                         # THIS FILE - keep updated!

  apps/
    web/                          # Next.js 15 frontend
      src/
        app/
          layout.tsx              # WalletProvider + QueryProvider + tRPC
          page.tsx                # Landing page
          (dashboard)/
            layout.tsx            # Sidebar shell
            page.tsx              # Portfolio overview
            policy/page.tsx       # Policy configuration
            strategies/page.tsx   # Yield opportunities
            recommend/page.tsx    # AI recommendation + approval
            audit/page.tsx        # Audit log
            copilot/page.tsx      # AI chat (Phase 2)
          api/trpc/[trpc]/route.ts
        components/
          ui/                     # shadcn/ui (auto-generated)
          wallet/                 # connect-button, balance-display
          dashboard/              # portfolio-chart, kpi-strip
          policy/                 # policy-form, preset-selector
          strategies/             # strategy-table, venue-badge
          recommend/              # recommendation-card, approval-modal
          audit/                  # audit-table
        lib/
          trpc/client.ts          # tRPC React Query hooks
          solana/config.ts        # Cluster, connection, token mints
        hooks/
          use-balances.ts
          use-strategies.ts
          use-policy.ts
          use-recommendation.ts

    api/                          # Express + tRPC backend
      src/
        index.ts                  # Server entry
        trpc/
          router.ts               # Root router (merges all routers)
          context.ts              # DB client, wallet context
          trpc.ts                 # tRPC init + middleware
        routers/
          policy.router.ts        # CRUD for treasury policies
          strategy.router.ts      # Fetch + list strategies
          recommendation.router.ts # Generate + approve recommendations
          execution.router.ts     # Execute approved allocations
          audit.router.ts         # Query audit log
        services/
          strategy-fetcher.ts     # Aggregates all venue adapters
          scoring-engine.ts       # Deterministic weighted scoring
          recommendation.ts       # Orchestrator pipeline
          ai-explainer.ts         # Claude SDK integration
          execution.service.ts    # Solana TX builder + sender
        adapters/
          base-adapter.ts         # Abstract interface
          mock-kamino-adapter.ts  # Mock data (always available)
          kamino-adapter.ts       # Real Kamino SDK (week 2)
          mock-marinade-adapter.ts # Mock second venue
        solana/
          connection.ts           # RPC connection
          transaction-builder.ts  # TX assembly
          token-accounts.ts       # SPL token helpers

  packages/
    shared/                       # Types + policy engine + scoring
      src/
        index.ts                  # Re-exports
        types/
          policy.ts               # PolicyConfig, PolicyRule, PolicyResult
          strategy.ts             # YieldStrategy, Venue, StrategyScore
          recommendation.ts       # Allocation, RecommendationResult
          execution.ts            # TransactionPlan, ExecutionResult
          audit.ts                # AuditEntry, AuditAction
        policy/
          engine.ts               # Main evaluator
          rules/
            max-exposure.ts       # No single venue > X%
            min-liquidity.ts      # Only venues with TVL > $Y
            min-apy.ts            # Only strategies yielding > Z%
            reserve-ratio.ts      # Keep N% idle in wallet
            whitelist.ts          # Only approved venues
          defaults.ts             # Conservative/Balanced/Aggressive presets
        scoring/
          scorer.ts               # Weighted composite scoring
          factors.ts              # Individual factor calculators

    database/                     # Prisma + PostgreSQL
      prisma/schema.prisma
      src/
        index.ts                  # Re-export PrismaClient
        seed.ts                   # Seed default data
```

---

## Data Models

### Policy
```
id, name, walletAddress, maxExposurePct, minLiquidityUsd, minApyPct,
reserveRatioPct, whitelistedVenues[], allowedAssets[], isActive, createdAt, updatedAt
```

### Strategy (cached from venues)
```
id, venue, vaultName, vaultAddress, tokenMint, apyPct, tvlUsd,
riskTier (low|medium|high), metadata (JSON), fetchedAt
```

### Recommendation
```
id, policyId, walletAddress, totalAmountUsd, allocations (JSON array),
aiExplanation (text), scoringDetails (JSON), policySnapshot (JSON),
status (pending|approved|executed|rejected), txSignatures[], createdAt, executedAt
```

### AuditEntry
```
id, walletAddress, action (enum), policyId?, recommendationId?,
details (JSON), createdAt
```

---

## Policy Engine Rules

All rules are **pure functions**: `(strategy, policy) => { pass: boolean, reason?: string }`

| Rule | Description | Default |
|------|-------------|---------|
| Max Exposure | No single venue gets > X% of total portfolio | 40% |
| Min Liquidity | Only venues with TVL above threshold | $1M |
| Min APY | Only strategies above minimum yield | 3% |
| Reserve Ratio | Always keep N% of portfolio idle in wallet | 10% |
| Whitelist | Only approved venues (empty = allow all) | [] |

### Pipeline
```
Fetch strategies → Filter by rules → Score remaining → Generate allocations
→ Validate aggregate constraints → Select best → AI explains → Present to user
```

---

## Scoring Engine

Transparent weighted formula — all weights visible in UI:

| Factor | Weight | Calculation |
|--------|--------|-------------|
| Net APY | 0.35 | Normalize to 0-1 range across all strategies |
| TVL/Liquidity | 0.25 | log(tvl) normalized |
| Risk tier | 0.25 | low=1.0, medium=0.6, high=0.3 |
| Historical stability | 0.15 | APY variance (mock initially, real later) |

`final_score = Σ(factor × weight) - concentration_penalty`

---

## Environment Variables

```
# Database
DATABASE_URL="postgresql://neel@localhost:5432/yieldpilot"  # Adjust user for your system

# AI
ANTHROPIC_API_KEY="sk-ant-..."

# Solana
SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"

# API
NEXT_PUBLIC_API_URL="http://localhost:4000"
PORT=4000

# Feature flags
USE_MOCK_ADAPTERS="true"    # Set to "false" when real Kamino is ready
```

---

## Build Phases

### Phase 1: Must-Have (Days 1-7) — THE WINNING CORE
Everything in this phase MUST work for the demo.

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1.1 | Monorepo scaffold | Claude | DONE | turbo + pnpm + dirs |
| 1.2 | packages/shared — types | Claude | DONE | All TypeScript interfaces |
| 1.3 | packages/shared — policy engine | Claude | DONE | 5 rules as pure functions |
| 1.4 | packages/shared — scoring engine | Claude | DONE | Weighted composite |
| 1.5 | packages/database — Prisma schema | Claude | DONE | 4 models, seed data |
| 1.6 | apps/api — Express + tRPC setup | Claude | DONE | Server + 4 routers |
| 1.7 | apps/api — mock adapters | Claude | DONE | Kamino (4) + Marinade (2) mocks |
| 1.8 | apps/api — strategy fetcher | Claude | DONE | Aggregate adapters |
| 1.9 | apps/api — recommendation service | Claude | DONE | Full pipeline |
| 1.10 | apps/api — AI explainer | Claude | DONE | Claude SDK with fallback |
| 1.11 | apps/api — execution service | -- | TODO | Solana TX builder |
| 1.12 | apps/api — all tRPC routers | Claude | DONE | policy, strategy, rec, audit |
| 1.13 | apps/web — Next.js + Tailwind setup | Claude | DONE | Next.js 16, Tailwind 4, App Router |
| 1.14 | apps/web — wallet connect | Claude | DONE | Phantom adapter + connect button |
| 1.15 | apps/web — dashboard shell | Claude | DONE | Sidebar layout + nav |
| 1.16 | apps/web — portfolio overview | Claude | DONE | KPIs + getting started |
| 1.17 | apps/web — policy form | Claude | DONE | All 5 rules + 3 presets + sliders |
| 1.18 | apps/web — strategies page | Claude | DONE | Table with venue/risk badges + score bar |
| 1.19 | apps/web — recommendation page | Claude | DONE | Allocation preview + AI explanation |
| 1.20 | apps/web — approval modal + execute | -- | TODO | TX preview + sign |
| 1.21 | apps/web — audit log page | Claude | DONE | Table with action labels + timestamps |
| 1.22 | Unit tests — policy engine | -- | TODO | 8-10 test cases |
| 1.23 | Unit tests — scoring engine | -- | TODO | Edge cases |

### Phase 2: Should-Have (Days 8-12)
| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 2.1 | AI copilot chat | -- | TODO | Conversational interface |
| 2.2 | Monitoring + alerts | -- | TODO | APY breach detection |
| 2.3 | Rebalance suggestion flow | -- | TODO | Alert → propose → approve |
| 2.4 | History chart | -- | TODO | Portfolio value over time |
| 2.5 | Real Kamino adapter | -- | TODO | Replace mock with SDK |
| 2.6 | Mobile responsive | -- | TODO | Key screens only |

### Phase 3: Nice-to-Have (Days 13+)
| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 3.1 | On-chain policy hash | -- | TODO | Tamper evidence |
| 3.2 | Auto-rebalance scheduling | -- | TODO | Cron-based |
| 3.3 | Compliance report export | -- | TODO | CSV/JSON |
| 3.4 | Multi-wallet support | -- | TODO | |

---

## Handover Protocol

### When picking up this project:

1. **Read this entire PLAN.md first**
2. Check the task table above — find the next TODO item
3. Setup:
   ```bash
   pnpm install
   # Copy .env to packages/database/.env and apps/api/.env
   # Ensure PostgreSQL is running (brew services start postgresql@16)
   pnpm db:push    # Push schema
   pnpm db:seed    # Seed mock strategies
   pnpm dev        # Start both web (3000) and api (4000)
   ```
4. Work on your task
5. **Update this file** when done:
   - Mark your task as DONE in the table
   - Add your name/agent-id to the Owner column
   - If you changed architecture, update the relevant section
   - If you discovered something important, add it to Known Issues

### When handing off:

1. Make sure `pnpm dev` still works
2. Update all task statuses in this file
3. Document any blockers in Known Issues
4. Commit with a clear message describing what you did

### Coding conventions:

- TypeScript strict mode everywhere
- Use zod for all input validation
- tRPC for all frontend-backend communication
- shadcn/ui for all UI components (don't write custom components for things shadcn has)
- All policy logic in `packages/shared` — never in frontend or API directly
- Mock adapters must always work — real adapters are bonus
- Every state change creates an audit entry

---

## Known Issues & Decisions Log

| Date | Issue/Decision | Resolution |
|------|---------------|------------|
| Mar 10 | No Solana projects on machine | Starting from scratch with @solana/web3.js |
| Mar 10 | Kamino SDK may be hard to integrate | Mock adapter first, real SDK in week 2 |
| Mar 10 | tRPC vs REST | Chose tRPC for end-to-end type safety |
| Mar 10 | Prisma deep type instantiation with tRPC | Serialized router outputs to plain objects to avoid TS infinite recursion |
| Mar 10 | Policy presets use decimals (0.4) not % (40) | Frontend converts to/from percentages in UI |
| Mar 10 | Docker not installed | Using Homebrew PostgreSQL (brew services start postgresql@16) |
| Mar 10 | .env needs to be in packages/database/ and apps/api/ | Prisma reads from CWD; copy root .env to both dirs |
| | | |

---

## Demo Script (3 minutes)

### Setup
- Wallet: $1M USDC + $300K USDT (devnet)
- Policy: max 40% per venue, min $1M TVL, min 3% APY, 10% reserve

### Flow
1. **Connect wallet** → balances appear instantly
2. **Set treasury policy** → form with presets + custom rules
3. **Browse opportunities** → Kamino + Marinade vaults with APY/TVL/risk
4. **"Optimize Treasury"** → AI recommendation appears:
   - Donut chart of proposed allocation
   - Per-vault breakdown with scores
   - Plain-English explanation from Claude
   - Policy compliance checkmarks
5. **Approve & Execute** → TX preview → wallet signs → confirmed on devnet
6. **Audit log** → full decision chain visible
7. **(Bonus) AI copilot**: "What if I lower reserve to 5%?" → instant re-recommendation

### What judges should take away:
- Stablecoins need institutional-grade tooling
- AI helps explain, but rules enforce safety
- Everything is auditable
- Real Solana execution, not a mock

---

## Submission Checklist

- [ ] 1-line pitch
- [ ] 30-second value prop video
- [ ] Architecture diagram
- [ ] Product screenshots (6+ screens)
- [ ] Demo video (3 min)
- [ ] Technical README
- [ ] Known limitations section
- [ ] Roadmap after hackathon
- [ ] GitHub repo public
- [ ] Live Vercel URL
- [ ] DoraHacks submission form
