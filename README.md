# Cequre

> **AI-Native, Schema-First Backend Engine for Bun.**  
> Write your schema once. Compile a typed, secure, production-ready backend in seconds on native Bun with zero-migration database sync, built-in MCP agent integration, and an instant Admin Console.

[![Website](https://img.shields.io/badge/website-cequrebackends.com-blue)](https://cequrebackends.com)
[![Documentation](https://img.shields.io/badge/docs-docs.cequrebackends.com-purple)](https://docs.cequrebackends.com)
[![License](https://img.shields.io/badge/license-Cequre%20Software%20License-black)](LICENSE)

---

## About This Repository

This repository (`cequre-public`) serves as the official public distribution and resource hub for Cequre. Here you will find:

- **Official Release Assets**: Standalone binary distributions and installation scripts for the `cequre` CLI.
<!-- - **Example Applications & Demos**: Ready-to-run reference implementations exploring authentication, streaming, file uploads, and full-stack integrations. -->
- **Community Templates**: Starters configured with best practices for rapid backend development on Bun.

---

## Quickstart

<!--
### 1. Install the `cequre` CLI

The `cequre` CLI is distributed as a single native binary with zero external dependencies.

Run the official install script:

```sh
curl -fsSL https://cequrebackends.com/install.sh | sh
```

Verify the installation:

```sh
cequre --version
```

To pin a specific version (e.g., in CI/CD pipelines):

```sh
CEQURE_VERSION=0.12.0 curl -fsSL https://cequrebackends.com/install.sh | sh
```

-->

#### Manual Download

If you prefer to download binaries manually, assets for each supported platform are available on the [Latest Releases](https://github.com/cequrebackends/cequre/releases/latest) page:

```sh
# BETA COMING SOON
```

<!--
```sh
# macOS (Apple Silicon - M1/M2/M3/M4)
curl -L -o cequre https://github.com/cequrebackends/cequre/releases/latest/download/cequre-darwin-arm64
chmod +x cequre && sudo mv cequre /usr/local/bin/cequre

# macOS (Intel)
curl -L -o cequre https://github.com/cequrebackends/cequre/releases/latest/download/cequre-darwin-x64
chmod +x cequre && sudo mv cequre /usr/local/bin/cequre

# Linux (x64)
curl -L -o cequre https://github.com/cequrebackends/cequre/releases/latest/download/cequre-linux-x64
chmod +x cequre && sudo mv cequre /usr/local/bin/cequre
```


-->

### 2. Create and Run a Project

Scaffold a new Cequre backend project in seconds:

```sh
# Initialize a new project
cequre init my-backend

# Move into the project directory
cd my-backend

# Start the live development server
cequre dev
```

Your server will boot immediately on native Bun with:

- **REST & OpenAPI**: Interactive API docs at `/api/docs`.
- **GraphQL**: Schema explorer and GraphiQL IDE at `/graphql`.
- **Admin Console**: Built-in management interface at `/__admin`.
- **MCP Server**: Live Model Context Protocol endpoint for autonomous AI agents.

---

<!--
## Explore Examples

The [`examples/`](./examples) directory contains self-contained reference implementations demonstrating how to integrate Cequre with modern tools and workflows:

| Example                                                       | Description                                                                      | Tech Stack               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| [**auth-with-better-auth**](./examples/auth-with-better-auth) | Modern authentication, session handling, and user verification with Better Auth  | Cequre, Better Auth, Bun |
| [**media-stream**](./examples/media-stream)                   | High-performance media streaming, chunked uploads, and local/S3 storage handling | Cequre, Bun, Storage     |

### Running an Example Locally

Every example is powered by [Bun](https://bun.com):

```sh
# 1. Navigate to the example folder
cd examples/auth-with-better-auth

# 2. Install dependencies
bun install

# 3. Start the application
bun run dev
```

---
-->

## Why Cequre?

Cequre eliminates backend boilerplate by establishing your declarative schema as the single source of truth for your entire application stack.

```
┌─────────────────────────────────────────────────────────────┐
│                    schema.cequre                            │
│           (Data Models, Policies, Relations)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      cequre dev / generate
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Universal AST (schema.json)                 │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌─────────────┐
│   REST API   │        │   GraphQL    │        │  MCP Server │
│   & OpenAPI  │        │   Endpoint   │        │  (AI Agents)│
└──────────────┘        └──────────────┘        └─────────────┘
```

- **Schema-First Engine**: Declare collections, relations, and security policies in clean `.cequre` files. The compiler handles validation, routing, and typing.
- **Zero-Migration Database Sync**: Cequre automatically synchronizes your database schema on boot across SQLite, PostgreSQL, Turso (libSQL), SurrealDB, and MongoDB. No manual migration files needed.
- **AI-Native & MCP-First**: Includes a native Model Context Protocol (MCP) server so coding agents (Cursor, Claude, Windsurf, Antigravity) can inspect, query, and modify your backend architecture safely.
- **Built for Bun**: Sub-millisecond route dispatch and native streaming I/O powered directly by `Bun.serve`.
- **Granular Access Control**: Declarative deny-by-default permission model with customizable TypeScript hooks (`before` / `after` CRUD).

---

## Schema Syntax Preview

Here is how simple it is to define a secure, production-grade collection in `.cequre`:

```cequre
collection posts {
  // Field definitions
  fields: {
    title: text;
    slug: text @unique;
    content: textarea @optional;
    published: boolean @default(false);
    author: relationship("users");
  }

  // Granular Access Control (deny-by-default)
  access: {
    read: true;
    create: user != null;
    update: user.id == author || user.role == "admin";
    delete: user.role == "admin";
  }

  // Real-time Event Broadcaster
  realtime: {
    ws: ["create", "update", "delete"];
    sse: true;
  }
}
```

Once defined, Cequre instantly generates:

1. Typed REST CRUD endpoints (`GET /api/posts`, `POST /api/posts`, etc.).
2. GraphQL queries and mutations with relation traversal.
3. Database table definitions and foreign key constraints.
4. Auto-enforced authorization rules.
5. OpenAPI / Swagger documentation.

---

## Lean Configuration (`config.cequre`)

Define your backend infrastructure, security perimeter, and management consoles declaratively alongside your schema with a lean `config` block:

```cequre
config {
  // Core runtime settings
  core: {
    api: { prefix: "/api"; };
    openapi: { enabled: true; path: "/api/docs"; };
    graphql: { enabled: true; path: "/graphql"; };
  }

  // Security perimeter & authentication
  security: {
    auth: {
      strategies: ["jwt"];
      jwt: {
        accessTokenExpiry: "15m";
        refreshTokenExpiry: "7d";
      };
    };

    cors: {
      origin: ["*"];
      credentials: true;
    };

    rateLimit: {
      read: { max: 100; window: "1m"; };
      write: { max: 20; window: "1m"; };
    };

    headers: { enabled: true; };
    secrets: { enabled: true; };
    audit: { enabled: true; };
  }

  // Realtime subscription transport
  realtime: {
    enabled: true;
    ws: true;
    sse: true;
    durableStream: false;
    secure: true;
  }

  // Live telemetry & health monitoring
  monitoring: {
    enabled: true;
    apiKey: env("MONITORING_API_KEY");
    healthCheck: {
      enabled: true;
      path: "/health";
      requiresAuth: false;
    };
    requestId: { enabled: true; };
  }

  // Sealed Platform Admin Console
  adminUi: {
    enabled: true;
    collection: "admins";
    title: "Cequre Admin Console";
  }
}
```

- **`core`**: Configures route prefixing, OpenAPI / Scalar interactive documentation, and native GraphQL engine settings.
- **`security`**: Hardens the global perimeter with JWT session management, CORS policies, KV-backed read/write rate limiting, security headers, secret protection, and tamper-evident audit logging.
- **`realtime`**: Powers live change feeds across native WebSockets (`/api/ws`), Server-Sent Events (`/api/sse`), and durable event streams with optional authentication enforcement (`secure: true`).
- **`monitoring`**: Telemetry and observability engine. Exposes real-time Server-Sent Events (SSE) telemetry streams (`/monitor/stream`), metrics aggregations (`/monitor/metrics`), buffered event querying (`/monitor/events`), and health probes (`/health`) with distributed `X-Request-ID` correlation.
- **`adminUi`**: Deploys a zero-code administrative portal authenticated via sealed HttpOnly session cookies.

---

## Community & Resources

- **Website**: [cequrebackends.com](https://cequrebackends.com)
- **Documentation**: [docs.cequrebackends.com](https://docs.cequrebackends.com)
- **GitHub Issues**: [Report Bugs & Feature Requests](https://github.com/cequrebackends/cequre/issues)

---

## License

Cequre is distributed under the [Cequre Software License](LICENSE). Free for solo builders and small teams (<10 staff).
