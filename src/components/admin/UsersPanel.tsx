import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminUsers, type AdminUser } from "@/lib/cms-extras";
import { Field, PageHeader, Panel, field } from "./shared";

export function UsersPanel() {
  const [users, setUsers] = useAdminUsers();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("atendente");

  const add = () => {
    if (!name.trim() || !password.trim()) {
      toast.error("Nome e senha obrigatórios");
      return;
    }
    if (users.some((u) => u.password === password)) {
      toast.error("Já existe usuário com essa senha");
      return;
    }
    setUsers([...users, { id: `u-${Date.now()}`, name: name.trim(), password, role }]);
    setName("");
    setPassword("");
    toast.success("Usuário criado");
  };

  return (
    <div>
      <PageHeader title="Usuários" subtitle="Dono e atendentes — cada um com senha própria no login" />
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Panel className="space-y-3 p-5">
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="Senha" value={password} onChange={setPassword} type="password" />
          <label className="block text-sm font-medium text-zinc-700">
            Papel
            <select className={`${field} mt-1.5`} value={role} onChange={(e) => setRole(e.target.value as AdminUser["role"])}>
              <option value="dono">Dono</option>
              <option value="atendente">Atendente</option>
            </select>
          </label>
          <button type="button" onClick={add} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-wine text-xs font-medium text-ivory">
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </button>
        </Panel>
        <Panel className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-3 py-3">Papel</th>
                <th className="px-3 py-3">Senha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-3 py-3 capitalize text-zinc-600">{u.role}</td>
                  <td className="px-3 py-3 font-mono text-xs text-zinc-500">{"•".repeat(Math.min(8, u.password.length))}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={users.length <= 1}
                      onClick={() => {
                        setUsers(users.filter((x) => x.id !== u.id));
                        toast.success("Removido");
                      }}
                      className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
