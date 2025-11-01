# Bun + Mise Monorepo

This repository is a Bun workspace managed via `mise` that hosts both a React front-end (Vite) and a Hono back-end API.

## Prerequisites

- Install [mise](https://mise.jdx.dev/getting-started.html)
- Ensure Bun can be installed through mise (e.g. `mise use -g bun@latest`)

## Initial Setup

```bash
# install the toolchain declared in .mise.toml
mise install

# install workspace dependencies via Bun
mise run install
```

## Development

- Front-end dev server: `mise run dev-frontend`
- Back-end dev server: `mise run dev-backend`

Run them in separate terminals for full-stack development.

## Build

```bash
mise run build
```

This sequentially builds the Vite app and compiles the Hono server to the `dist` directory.

## Project Structure

```
apps/
  frontend/   # React + Vite application
  backend/    # Hono server running on Bun
.mise.toml     # Toolchain and task definitions for mise
bunfig.toml    # Bun workspace definition
package.json   # Monorepo scripts delegating to mise tasks
```
