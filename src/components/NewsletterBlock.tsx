import { useState } from "react";
import { toast } from "sonner";
import { useNewsletter } from "@/lib/cms-extras";

export function NewsletterBlock() {
  const [list, setList] = useNewsletter();
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error("Informe um e-mail válido");
      return;
    }
    if (list.some((x) => x.email === v)) {
      toast.message("Você já está na lista");
      return;
    }
    setList([{ email: v, date: new Date().toISOString().slice(0, 10) }, ...list]);
    setEmail("");
    toast.success("Inscrição confirmada");
  };

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Seu e-mail"
        className="h-11 flex-1 border border-ivory/20 bg-wine-deep/40 px-3 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-champagne"
      />
      <button type="submit" className="h-11 bg-champagne px-4 text-sm font-medium text-wine-deep hover:brightness-105">
        Quero novidades
      </button>
    </form>
  );
}
