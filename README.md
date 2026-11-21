<div align="center">

# Cequre

**Declarative, AI-Native Backend Platform for Production Applications.**

Write your data models, access policies, and durable workflows once in `.cequre`. Compile a strictly typed, security-hardened backend on Bun with zero-migration database sync across 5 databases, a zero-dependency TypeScript Client SDK, native MCP agent tooling, and an embedded Admin Console.

[![Latest Release](https://img.shields.io/github/v/release/cequrebackends/cequre?label=release&color=f97316)](https://github.com/cequrebackends/cequre/releases/latest)
[![Website](https://img.shields.io/badge/website-cequrebackends.com-111827)](https://cequrebackends.com)
[![Documentation](https://img.shields.io/badge/docs-docs.cequrebackends.com-2563eb)](https://docs.cequrebackends.com/docs/core)
[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Cequre%20Extension-007ACC)](https://marketplace.visualstudio.com/items?itemName=cequrebackends.vscode-cequre)
[![License](https://img.shields.io/badge/license-Cequre%20Software%20License-18181b)](LICENSE)

[Documentation](https://docs.cequrebackends.com/docs/core) · [TypeScript Guide](https://docs.cequrebackends.com/docs/ts) · [Workflows](https://docs.cequrebackends.com/docs/ts/workflows) · [AI & MCP](https://docs.cequrebackends.com/mcp) · [Releases](https://github.com/cequrebackends/cequre/releases) · [LLM Context (`llm.txt`)](https://docs.cequrebackends.com/llm.txt)

</div>

---

## What's New in `v1.1.0`

- **Native Durable Workflows (`workflow <name> { ... }`)**: Compose multi-step business processes directly in `.cequre` using **3 atomic step modes** (`manual`, `decision`, `automated`) and a unified `var` state bag—or register dynamic workflows at runtime with `app.registerWorkflow(...)`. Backed by `cequre_workflow_runs`, `CequreDurableQueue`, auto-mounted REST routes, and typed `api.workflows.<slug>` Client SDK methods.
- **Full MCP & LSP Workflow Tooling**: Built-in `cequre mcp` workflow tools (`cequre_schema`, `cequre_code`), `cequre://runtime/workflows` specification, plus VS Code LSP autocompletion, hover docs, outline symbols, and transition diagnostics for `workflow` blocks.
- **Redis-Backed Shared Read Cache (`KVCacheStore`)**: Automatically wires policy-aware read caching to Redis when `kv.driver: "redis"` is configured while preserving production in-memory cache guardrails.
- **SurrealDB 4.0 ACID Transactions**: Full WebSocket RPC transaction commit and rollback support verified alongside SQLite, PostgreSQL, Turso (libSQL), and MongoDB.
- **Hardened Defaults**: Unauthenticated upload endpoints stay locked (`401`) by default, alongside purpose-bound JWTs, AES-256-GCM key-ring rotation, and tamper-evident HMAC audit logs.

---

## Quickstart

### 1. Install the `cequre` CLI

The `cequre` CLI ships as a single native binary with zero dependencies (includes the compiler, zero-migration sync engine, embedded Admin UI, LSP server, and MCP server).

**macOS & Linux**

```bash
curl -fsSL https://cequrebackends.com/install.sh | bash
```

**Windows (PowerShell)**

```powershell
irm https://cequrebackends.com/install.ps1 | iex
```

Verify your installation:

```bash
cequre --version
```

<details>
<summary>Manual binary downloads (macOS, Linux, Windows)</summary>

Download directly from [GitHub Releases](https://github.com/cequrebackends/cequre/releases/latest):

```bash
# macOS (Apple Silicon)
sudo curl -fsSL https://github.com/cequrebackends/cequre/releases/latest/download/cequre-mac-arm64 -o /usr/local/bin/cequre && sudo chmod +x /usr/local/bin/cequre

# Linux (x86_64)
sudo curl -fsSL https://github.com/cequrebackends/cequre/releases/latest/download/cequre-linux-x64 -o /usr/local/bin/cequre && sudo chmod +x /usr/local/bin/cequre

# Linux (ARM64)
sudo curl -fsSL https://github.com/cequrebackends/cequre/releases/latest/download/cequre-linux-arm64 -o /usr/local/bin/cequre && sudo chmod +x /usr/local/bin/cequre
```

Windows `.exe` binaries (`cequre-windows-x64.exe` and `cequre-windows-arm64.exe`) and the VS Code `.vsix` package are also attached to every release. See the [Installation Guide](https://docs.cequrebackends.com/docs/core/installation) for PowerShell PATH setup.

</details>

### 2. Scaffold & Boot a Backend

Install [Bun](https://bun.sh) (`>= 1.1`) for the TypeScript runtime (or Go `>= 1.22` for the Developer Alpha Go target), then create your project:

```bash
cequre init my-backend
cd my-backend
cequre dev
```

Your backend boots immediately with:

| Surface | Endpoint | Description |
| :--- | :--- | :--- |
| **REST API & OpenAPI** | `/api/*` · `/api/docs` | Typed CRUD, custom endpoints, workflows, and interactive API docs |
| **GraphQL** | `/graphql` | Native schema, relation traversal, HttpOnly session cookie parity, GraphiQL |
| **Admin Console** | `/__admin` | Zero-code data, media library, and 30-day activity dashboard |
| **Health & Readiness** | `/health` · `/api/monitor/ready` | Fast liveness probe + deep DB/cache/queue readiness probe |
| **MCP Server** | `cequre mcp` | Native stdio / SSE Model Context Protocol server for AI coding agents |

---

## Architecture

One declarative `.cequre` schema compiles into every layer of your backend and frontend contract:

```text
                      cequre/*.cequre
     (config · collections · globals · workflows · access)
                             │
                     cequre generate / dev
                             │
                             ▼
                  Universal Schema AST + SDKs
   ┌──────────────┬──────────────┬──────────────┬──────────────┐
   ▼              ▼              ▼              ▼              ▼
REST &         GraphQL       Durable        Typed Client    MCP Server
OpenAPI        Engine        Workflows      SDK (0 deps)    & LSP Tools
```

---

## Capabilities at a Glance

| Domain | Built-In Capabilities |
| :--- | :--- |
| **Databases (Zero-Migration Sync)** | SQLite, PostgreSQL, Turso (libSQL), SurrealDB 4.0 (ACID over WS RPC), and MongoDB |
| **Schema & Field Directives** | Typed nested objects & object arrays (`{ ... }[]`), `decimal(p, s)`, `@unique`, `@encrypt` (AES-256-GCM key ring), `@search` (Meilisearch / FTS5), `@counter("10s")`, `@reserve("10m")`, `@saveToJWT`, `@hidden`, `@omit`, `@index` |
| **Native Durable Workflows** | Declarative `workflow <name> { ... }` DSL + dynamic `app.registerWorkflow(...)`, 3 atomic step modes (`manual`, `decision`, `automated`), unified `var` state bag, retries via `CequreDurableQueue`, auto-mounted REST & Client SDK |
| **Security & Compliance** | Deny-by-default row & field RLS, purpose-bound JWTs with zero-downtime secret rotation, MFA, Magic Link, Social Auth, locked-by-default uploads, SSRF protection, per-route rate limiting, immutable HMAC audit trails |
| **Realtime & Background Work** | Native WebSockets, SSE, HTTP streams, Durable Streams, database-backed `CequreDurableQueue`, Redis `QueueManager`, and cron jobs |
| **Storage & Media** | Local disk, AWS S3, Cloudflare R2, MinIO, chunked streaming uploads, private media `Cache-Control`, and automatic blur-up image placeholders |
| **Developer & AI Tooling** | Zero-dependency TypeScript Client SDK, `cequre-ts/testing` (`createCequreTest` with 10 harnesses), VS Code extension + LSP, `cequre mcp`, and ephemeral deploy previews (`cequre deploy --preview`) |

---

## Schema & Workflow Preview

### 1. Collections & Declarative Access (`cequre/collections/`)

```cequre
// cequre/collections/users.cequre
collection users {
  auth: true;

  fields {
    name: text;
    email: email @unique;
    password: password;
    role: select("admin", "manager", "hr", "member") @default("member") @saveToJWT;
  }

  access {
    read: user != null;
    create: false;
    register: true;
    update: user.id == id || user.role == "admin";
    delete: user.role == "admin";
  }
}

// cequre/collections/leave_requests.cequre
collection leave_requests {
  fields {
    employee: relationship("users");
    manager: relationship("users");
    days: integer;
    reason: text;
    status: select("pending", "approved", "declined") @default("pending");
    comment: text @optional;
  }

  access {
    read: user.id == data.employee || user.id == data.manager || user.role == "hr" || user.role == "admin";
    create: user != null;
    update: user.id == data.manager || user.role == "hr" || user.role == "admin";
    delete: user.role == "admin";
  }

  realtime {
    ws: ["create", "update", "delete"];
    sse: true;
  }
}
```

### 2. Native Durable Workflows (`cequre/workflows/`)

```cequre
// cequre/workflows/leave_approval.cequre
workflow leave_approval {
  var: {
    comment: "";
  }

  trigger {
    on: "leave_requests.create";
  }

  steps {
    manager_review: {
      type: manual;
      allow: user.id == var.manager || user.role == "admin";
      actions: ["accept", "decline"];
      onAccept: "check_duration";
      onDecline: "mark_declined";
    }

    check_duration: {
      type: decision;
      condition: var.days > 3;
      onTrue: "hr_review";
      onFalse: "mark_approved";
    }

    hr_review: {
      type: manual;
      allow: user.role == "hr" || user.role == "admin";
      actions: ["approve", "reject"];
      onApprove: "mark_approved";
      onReject: "mark_declined";
    }

    mark_approved: {
      type: automated;
      updateRecord: {
        status: "approved";
        comment: "{{var.comment}}";
      }
      email: {
        to: ["{{var.employee.email}}"];
        subject: "Leave request approved";
        body: "Your {{var.days}}-day leave request has been approved.";
      }
    }

    mark_declined: {
      type: automated;
      updateRecord: {
        status: "declined";
        comment: "{{var.comment}}";
      }
    }
  }
}
```

### 3. Zero-Dependency Generated Client SDK

Every collection, TypeBox-typed custom route, and workflow compiles into a fluent TypeScript client (`cequre/_generated/client.ts`):

```ts
import { createCequreClient } from "./cequre/_generated/client";

const api = createCequreClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  credentials: "include",
});

// Typed collection CRUD
const { data: requests } = await api.leave_requests.get();

// Trigger & advance a durable workflow
const run = await api.workflows.leave_approval.trigger.post({ days: 5 });
await api.workflows.leave_approval
  .byRunId(run.data!.id)
  .manager_review.post({ action: "accept", comment: "Approved by manager" });
```

### 4. Lean Infrastructure Config (`cequre/config.cequre`)

```cequre
config {
  output: "_generated";

  core {
    api { prefix: "/api"; }
    graphql { enabled: true; playground: true; introspection: true; }
  }

  security {
    cors { origin: ["http://localhost:5173"]; credentials: true; }
    auth {
      strategies: ["jwt"];
      jwt { accessTokenExpiry: "15m"; refreshTokenExpiry: "7d"; }
    }
  }

  monitoring {
    enabled: true;
    apiKey: env("MONITORING_API_KEY");
    healthCheck { path: "/health"; }
  }

  adminUi { collection: "users"; }
}
```

---

## AI Agents & Native MCP (`cequre mcp`)

Connect Antigravity, Cursor, Claude Code, Windsurf, or any MCP-compatible assistant directly to the standalone `cequre` binary—no extra server setup required:

```json
{
  "mcpServers": {
    "cequre": {
      "command": "cequre",
      "args": ["mcp"]
    }
  }
}
```

Agents gain verified tools for schema modeling (`cequre_schema` including `WORKFLOW`), TypeScript routes/hooks/workflow handlers (`cequre_routes`, `cequre_code`), access rules (`cequre_security`), database sync (`cequre_database`), SDK artifacts (`cequre_artifacts`), testing (`cequre_test`), and ephemeral deploy previews (`cequre_deploy`).

Full AI context bundles are also published at:
- [docs.cequrebackends.com/llm.txt](https://docs.cequrebackends.com/llm.txt) (complete)
- [docs.cequrebackends.com/llm-core.txt](https://docs.cequrebackends.com/llm-core.txt) (Core DSL & CLI)
- [docs.cequrebackends.com/llm-ts.txt](https://docs.cequrebackends.com/llm-ts.txt) (Core + TypeScript on Bun)

---

## Editor Support & Examples

- **VS Code Extension**: Install [Cequre for VS Code](https://marketplace.visualstudio.com/items?itemName=cequrebackends.vscode-cequre) from the Visual Studio Marketplace for `.cequre` syntax highlighting (including `workflow` blocks, `decimal`, and `{{var.*}}` templates), autocompletion, hover documentation, outline symbols, and real-time diagnostics.
- **Example App**: Explore [`examples/simple-blog`](./examples/simple-blog) for a working reference project.

---

## Resources & Community

- **Website**: [cequrebackends.com](https://cequrebackends.com)
- **Documentation**: [docs.cequrebackends.com](https://docs.cequrebackends.com/docs/core)
- **Changelog**: [docs.cequrebackends.com/docs/core/changelog](https://docs.cequrebackends.com/docs/core/changelog)
- **Releases & Binaries**: [GitHub Releases](https://github.com/cequrebackends/cequre/releases)
- **Issues & Feature Requests**: [GitHub Issues](https://github.com/cequrebackends/cequre/issues)

---

## License

Cequre is distributed under the [Cequre Software License](LICENSE) — free for solo builders, startups, and small teams (< 10 staff), with royalty-free handover for agencies and commercial licensing for larger teams.
