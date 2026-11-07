import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Crown, Sparkles, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useCart, useSettings } from "@/lib/store";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex flex-col items-center leading-none text-champagne ${className}`}>
      <Crown className="h-5 w-5" strokeWidth={1.2} />
      <span className="whitespace-nowrap font-display text-xl tracking-wide sm:text-3xl">REIS NOIR</span>
    </Link>
  );
}

export function StoreLayout({ children, overlay = false }: { children: ReactNode; overlay?: boolean }) {
  const [s] = useSettings();
  const [cart] = useCart();
  const [open, setOpen] = useState(false);
  const count = cart.reduce((a, c) => a + c.qty, 0);
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {s.promoActive && (
        <div className="flex items-center justify-center gap-2 bg-wine-deep px-3 py-2 text-center text-[10px] text-ivory sm:text-xs">
          <Sparkles className="h-3 w-3" /> {s.promoText} <Sparkles className="h-3 w-3" />
        </div>
      )}
      <header className={`${overlay ? "absolute left-0 right-0 z-20 bg-wine-deep/60" : "bg-wine-deep"} grid grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6 text-ivory md:px-16`}>
        <nav className="hidden gap-8 whitespace-nowrap text-sm lg:flex">
          <Link to="/">Início</Link>
          <a href="/#colecoes">Coleções</a>
          <a href="/#novidades">Novidades</a>
          <a href="/#sobre">Sobre nós</a>
        </nav>
        <button aria-label="Menu" onClick={() => setOpen(!open)} className="lg:hidden">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        <Logo />
        <div className="flex justify-end gap-3 sm:gap-6">
          <Search className="h-5 w-5" strokeWidth={1.4} />
          <Link to="/admin" aria-label="Minha conta"><User className="h-5 w-5" strokeWidth={1.4} /></Link>
          <Link to="/sacola" className="relative" aria-label="Sacola">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.4} />
            {count > 0 && <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-champagne text-[10px] text-wine-deep">{count}</span>}
          </Link>
        </div>
        {open && (
          <nav className="col-span-3 mt-4 flex flex-col gap-4 border-t border-ivory/10 pt-4 text-sm lg:hidden" onClick={() => setOpen(false)}>
            <Link to="/">Início</Link>
            <a href="/#colecoes">Coleções</a>
            <a href="/#novidades">Novidades</a>
            <a href="/#sobre">Sobre nós</a>
          </nav>
        )}
      </header>
      {children}
      <footer id="sobre" className="bg-wine-deep px-6 py-14 text-ivory/80 md:px-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div><Logo className="!items-start" /><p className="mt-4 text-sm">Moda feminina sofisticada, elegante e contemporânea.</p></div>
          <div className="text-sm space-y-2"><h4 className="font-display text-lg text-champagne">Atendimento</h4><p>WhatsApp (11) 99999-0000</p><p>Instagram @reisnoir</p></div>
          <div className="text-sm space-y-2"><h4 className="font-display text-lg text-champagne">Políticas</h4><p>Privacidade</p><p>Trocas e devoluções</p><p>Entrega</p></div>
          <div className="text-sm space-y-2"><h4 className="font-display text-lg text-champagne">Pagamento</h4><p>PIX · Cartão em até 12x · Boleto</p></div>
        </div>
        <p className="mt-10 border-t border-ivory/10 pt-6 text-center text-xs">© 2026 REIS NOIR. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
