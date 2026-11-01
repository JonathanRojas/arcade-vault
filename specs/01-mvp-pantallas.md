# SPEC 01 — MVP visual de Arcade Vault (5 pantallas)

> **Estado:** Aprobado
> **Depende de:** ninguna
> **Fecha:** 2026-10-27
> **Objetivo:** Portar las 5 pantallas de `references/templates/` (biblioteca, detalle, reproductor, auth, salón de la fama) a rutas del App Router de Next, solo parte visual y sin implementar ningún juego.

---

## Por qué existe esta spec

`references/templates/` es un prototipo SPA en React UMD + Babel con router por hash. El proyecto es Next 16 con App Router, `cacheComponents` y Tailwind v4. Hay que traducir el prototipo a esa arquitectura sin perder fidelidad visual. `app/globals.css` ya contiene los estilos del prototipo migrados (tokens en `@theme inline`, clases `av-*`, `.card`, `.btn`, `.crt`, etc.); esta spec los reutiliza y los revisa solo si algo no coincide con la plantilla.

---

## Alcance

**Dentro:**

- Rutas App Router:
  - `/` — Biblioteca (hero, búsqueda, chips de categoría, grilla de `GameCard`).
  - `/juegos/[id]` — Detalle del juego (portada, tags, stats, leaderboard top 10).
  - `/juegos/[id]/jugar` — Reproductor (HUD, arena CRT decorativa, pausa, FIN, modal de game over, guardar puntuación).
  - `/auth` — Iniciar sesión / Crear cuenta / Jugar como invitado.
  - `/salon` — Salón de la Fama (tabs por juego, podio, tabla top 12, "tu mejor marca" si hay sesión).
- Layout global: `Nav` (links activos por ruta, contador "CRÉDITOS · 03", botón de sesión, menú móvil hamburguesa) y footer.
- Datos mock estáticos: `GAMES`, `CATS`, `seededScores` portados a TypeScript tipado.
- Sesión falsa en cliente: `av_user` en `localStorage` vía un provider de React. Sin backend.
- Puntuaciones guardadas desde el reproductor en `localStorage` (`av_scores`), solo escritura (réplica de la plantilla).
- Reproductor réplica de la plantilla: puntaje simulado con `setInterval`, nivel, vidas, pausa, FIN, modal, "JUGAR DE NUEVO".
- Estilos nuevos o ajustes con Tailwind; reutilizar clases existentes de `globals.css`. Reemplazar los `style={{}}` inline de la plantilla por utilidades Tailwind.
- Responsive según los breakpoints de la plantilla (840px nav, 900px detalle).
- Textos en español, formato numérico `es-ES`.

**Fuera de alcance (para otras specs):**

- Lógica de cualquier juego (Bloque Buster, Caída, etc.). La arena es decorativa.
- Backend, base de datos, autenticación real, OAuth real (los botones Google/GitHub son decorativos).
- Validación real de credenciales o de correo; el formulario acepta cualquier valor.
- Leer `av_scores` para alimentar leaderboards o salón (siguen siendo datos sembrados).
- Sistema real de créditos (el "03" es texto fijo).
- Tests automatizados (el repo no tiene framework de tests).
- Internacionalización, SEO avanzado, analítica.

---

## Modelo de datos

Tipos nuevos en `lib/types.ts`:

```ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type AccentColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string; // slug: "bloque-buster", "caida", ...
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string; // clase CSS existente: "cover-bricks", ...
  color: AccentColor; // color del botón JUGAR
  best: number;
  plays: string; // "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/2026"
}

export interface User {
  name: string; // mayúsculas, máx. 10 caracteres
}

export interface SavedScore {
  game: string; // Game.id
  score: number;
  name: string;
  at: number; // Date.now()
}
```

Datos y utilidades:

- `lib/games.ts` — `GAMES: Game[]` (8 juegos idénticos a `data.jsx`), `CATS`, `getGame(id)`.
- `lib/scores.ts` — `seededScores(seed, count)`, portada tal cual (determinista, sin `Math.random`).

Persistencia (`localStorage`, solo cliente):

| Clave       | Contenido                    | Quién escribe         |
| ----------- | ---------------------------- | --------------------- |
| `av_user`   | `User` serializado o ausente | `AuthProvider`        |
| `av_scores` | `SavedScore[]`               | Reproductor (guardar) |

Convenciones:

- Seeds de `seededScores`: detalle `id.length * 17 + 3` (10 filas); salón `id.length * 23 + 7` (12 filas), igual que la plantilla.
- Todos los accesos a `localStorage` van en `try/catch`; si falla, la app funciona sin persistir.

---

## Plan de implementación

1. Leer en `node_modules/next/dist/docs/` las guías de rutas dinámicas, `cacheComponents`, `Link`/navegación y Client Components. Sin cambios de código.
2. Crear `lib/types.ts`, `lib/games.ts`, `lib/scores.ts` con el port tipado de los datos. Verificar: `npm run lint` y `npx tsc --noEmit` sin errores.
3. Crear `components/auth-provider.tsx` (Client Component, contexto `{ user, login, logout }`, lectura/escritura de `av_user` sin mismatch de hidratación). Montarlo en `app/layout.tsx`.
4. Crear `components/nav.tsx` (Client Component: `usePathname` para el link activo, panel móvil, botón de sesión) y footer. Montarlos en `app/layout.tsx` dentro de `<main className="av-main">`. Verificar: nav visible en `/`.
5. Biblioteca en `app/page.tsx`: hero (Server Component) + `components/library.tsx` (Client: búsqueda, chips, estado vacío) + `components/game-card.tsx` (tilt 3D, `Link` a `/juegos/[id]`). Verificar: filtrar por texto y categoría.
6. Detalle en `app/juegos/[id]/page.tsx` con `generateStaticParams`, `notFound()` si el id no existe, `components/leaderboard.tsx`. Verificar: los 8 ids renderizan; `/juegos/xyz` da 404.
7. Auth en `app/auth/page.tsx` + `components/auth-form.tsx` (Client: tabs, campo correo en "Crear cuenta", submit → `login` + redirect a `/`, invitado → `logout` + redirect a `/`). Verificar: tras login el nav muestra el nombre; "nombre ▾" cierra sesión.
8. Salón en `app/salon/page.tsx` + `components/hall-of-fame.tsx` (Client: tabs, podio, tabla, fila "tu mejor marca" solo con sesión). Verificar: cambiar de tab cambia datos.
9. Reproductor en `app/juegos/[id]/jugar/page.tsx` + `components/game-player.tsx` (Client: HUD, pausa, FIN, modal, guardar en `av_scores`, jugar de nuevo, salir a `/juegos/[id]`). Verificar: flujo completo jugar → FIN → guardar → volver al vault.
10. Pasada de revisión visual contra `references/templates/Arcade Vault.html` abierto en el navegador; ajustar `globals.css` o utilidades Tailwind donde difiera. Verificar: `npm run build` y `npm run lint` pasan.

---

## Criterios de aceptación

- [ ] `npm run lint` y `npm run build` terminan sin errores.
- [ ] Existen las rutas `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth` y `/salon`, y cada una renderiza sin errores en consola.
- [ ] La biblioteca muestra 8 tarjetas; el chip "TODOS" las muestra todas y cada otro chip filtra por `cat`.
- [ ] Escribir texto en el buscador filtra por título sin distinguir mayúsculas; sin coincidencias aparece "NO HAY RESULTADOS".
- [ ] Clic en una tarjeta o en su botón JUGAR navega a `/juegos/[id]`.
- [ ] `/juegos/[id]` muestra portada, tags, descripción larga, stats y 10 filas de leaderboard con las 3 primeras destacadas.
- [ ] `/juegos/id-inexistente` devuelve 404.
- [ ] "JUGAR AHORA" lleva a `/juegos/[id]/jugar`; "VOLVER AL VAULT" lleva a `/`.
- [ ] En el reproductor el puntaje aumenta mientras no hay pausa ni game over; PAUSA lo detiene y muestra "EN PAUSA"; REANUDAR lo retoma.
- [ ] FIN abre el modal con la puntuación final; "GUARDAR PUNTUACIÓN" muestra "PUNTUACIÓN GUARDADA\_" y añade una entrada a `av_scores`.
- [ ] "JUGAR DE NUEVO" reinicia puntaje, vidas y nivel; SALIR vuelve a `/juegos/[id]`.
- [ ] En `/auth`, "CREAR CUENTA" muestra el campo de correo e "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario guarda `av_user` (nombre en mayúsculas, máx. 10 caracteres, "PLAYER1" si está vacío), redirige a `/` y el nav muestra el nombre.
- [ ] "JUGAR COMO INVITADO" redirige a `/` y el nav muestra "Iniciar Sesión".
- [ ] Recargar la página con sesión iniciada la conserva sin warning de hidratación.
- [ ] `/salon` muestra podio (1°, 2°, 3°), tabla de 12 filas y tabs para los 8 juegos; cambiar de tab cambia los datos.
- [ ] En `/salon` la fila "TU MEJOR MARCA" aparece solo con sesión iniciada.
- [ ] El link activo del nav coincide con la ruta (Biblioteca también activa en `/juegos/*`).
- [ ] A ≤840px aparece la hamburguesa y el panel móvil abre y cierra con su backdrop.
- [ ] Con `localStorage` bloqueado la app sigue navegable sin excepciones.

---

## Decisiones

- **Sí:** rutas App Router reales. URLs compartibles, aprovecha Next; el hash router de la plantilla era un artificio del prototipo.
- **No:** SPA con un único `page.tsx` y estado. Va contra el modelo de Next.
- **Sí:** reutilizar `app/globals.css` ya migrado y revisarlo solo si hay diferencias con la plantilla. Evita re-trabajo de 900+ líneas.
- **Sí:** Tailwind para todo lo nuevo (sustituye los `style` inline de la plantilla). Es el estándar del proyecto.
- **No:** reescribir las clases `av-*` en utilidades Tailwind. Mucho trabajo y riesgo visual sin beneficio.
- **Sí:** sesión fake en `localStorage` (`av_user`), como la plantilla. Permite ver los estados con y sin sesión.
- **No:** backend o auth real. Merece su propia spec.
- **Sí:** reproductor como réplica de la plantilla con puntaje simulado. Valida el flujo completo de UI antes de tener juegos.
- **Sí:** `generateStaticParams` en `/juegos/[id]` y en `/juegos/[id]/jugar`, ya que `cacheComponents` exige resolver `params` de forma estática o bajo `Suspense`.
- **Sí:** server components por defecto; `"use client"` solo donde hay estado, efectos o `localStorage`.
- **Sí:** `av_scores` se escribe pero no se lee. Mantiene el alcance visual; consumirlo es otra spec.

---

## Riesgos

| Riesgo                                                   | Mitigación                                                                                |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Hydration mismatch al leer `av_user` en el primer render | Estado inicial `null` en servidor y cliente; hidratar `localStorage` después del montaje. |
| `cacheComponents` rompe páginas con `params` dinámicos   | `generateStaticParams` + leer la guía de Next en el paso 1 antes de escribir código.      |
| Diferencias visuales entre plantilla y `globals.css`     | Paso 10 compara lado a lado y corrige.                                                    |
| `localStorage` bloqueado (modo privado)                  | `try/catch` en todo acceso; la app funciona sin persistir.                                |
| `setInterval` del reproductor sigue activo al salir      | Limpiar en el cleanup del `useEffect`.                                                    |

---

## Lo que **no** está en esta spec

- Ningún juego jugable.
- Backend, base de datos o autenticación real.
- Leaderboards alimentados por puntuaciones reales.
- Sistema de créditos.
- Tests automatizados.

Cada uno, si llega, va en su propia spec.
