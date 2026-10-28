# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Arcade Vault: plataforma para jugar online y competir por puntos. Estado actual: scaffold de `create-next-app` (solo `app/layout.tsx`, `app/page.tsx`, `app/globals.css`). Se desarrolla con Spec Driven Design (`/spec` y `/spec-impl`), siguiendo las prácticas de https://github.com/Klerith/fernando-skills (skills instaladas con `npx skills@latest add Klerith/fernando-skills`).

## Comandos

- `npm run dev` — servidor de desarrollo (http://localhost:3000)
- `npm run build` / `npm run start` — build y servidor de producción
- `npm run lint` — ESLint (flat config en `eslint.config.mjs`)
- No hay framework de tests configurado.

## Next.js — versión con breaking changes

Next 16.4.3 + React 19.3. Antes de escribir código, leer la guía relevante en `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`; índice en `index.md`). Respetar avisos de deprecación. `AGENTS.md` lo exige (bloque regenerado por `next dev`; dejarlo).

## Skills
Usa siempre /frontend-design para diseñar la interfaz de usuario.

## Arquitectura / configuración

- App Router en `app/`. Alias de imports `@/*` → raíz del repo.
- `next.config.ts` activa flags experimentales/no estándar: `cacheComponents: true`, `partialPrefetching: true`, `experimental.agentFeedback`. `cacheComponents` cambia el modelo de caché/render (datos dinámicos requieren Suspense / `use cache`); consultar docs antes de hacer fetching.
- Tailwind v4 vía Turbopack: regla en `next.config.ts` (`@tailwindcss/turbopack` para `*.css`), `@import "tailwindcss"` en `app/globals.css`, tokens de tema con `@theme inline` (light/dark por `prefers-color-scheme`).
- Layout usa el tipo global `LayoutProps<"/">` (types generados por Next en `.next/types`); fuentes Geist vía `next/font/google`.
- TypeScript `strict`.
