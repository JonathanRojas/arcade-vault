"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isLibrary = pathname === "/" || pathname.startsWith("/juegos");
  const isSalon = pathname.startsWith("/salon");
  const isAuth = pathname.startsWith("/auth");

  const close = () => setOpen(false);
  const cls = (active: boolean) => (active ? "active" : undefined);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo">
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={cls(isLibrary)}>
            Biblioteca
          </Link>
          <Link href="/salon" className={cls(isSalon)}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={logout}>
            {user.name} ▾
          </button>
        ) : (
          <button className="btn auth-btn" onClick={() => router.push("/auth")}>
            Iniciar Sesión
          </button>
        )}
        <button
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
      ></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan mb-4 text-[11px]">MENÚ</div>
        <Link href="/" className={cls(isLibrary)} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/salon" className={cls(isSalon)} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/auth" className={cls(isAuth)} onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div className="flex-1"></div>
        <div className="pixel text-[9px] tracking-[0.16em]! text-[var(--ink-faint)]">
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
