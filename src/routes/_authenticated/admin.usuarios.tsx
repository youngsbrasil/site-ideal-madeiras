import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { listAppUsers, inviteAppUser, setUserRole, deleteAppUser } from "@/lib/admin-users.functions";
import { logActivity } from "@/lib/activity-log";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  component: UsersPage,
});

const ROLES = ["admin", "catalogo", "marketing", "user"] as const;
type Role = typeof ROLES[number];

function UsersPage() {
  const list = useServerFn(listAppUsers);
  const invite = useServerFn(inviteAppUser);
  const setRole = useServerFn(setUserRole);
  const del = useServerFn(deleteAppUser);
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => list({}),
  });

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("user");

  const inviteMut = useMutation({
    mutationFn: async () => invite({ data: { email, role: inviteRole } }),
    onSuccess: async () => {
      toast.success("Convite enviado");
      setEmail("");
      await logActivity("invite", "user", email, { role: inviteRole });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const toggleMut = useMutation({
    mutationFn: async (p: { userId: string; role: Role; enabled: boolean }) => setRole({ data: p }),
    onSuccess: async (_r, p) => {
      await logActivity(p.enabled ? "role_grant" : "role_revoke", "user", p.userId, { role: p.role });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const delMut = useMutation({
    mutationFn: async (userId: string) => del({ data: { userId } }),
    onSuccess: async (_r, userId) => {
      toast.success("Usuário removido");
      await logActivity("delete", "user", userId);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Usuários & Papéis</h1>

      <div className="bg-white p-4 rounded border space-y-3">
        <div className="font-semibold">Convidar usuário</div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            type="email"
            placeholder="email@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-[240px]"
          />
          <select
            className="border rounded px-3 py-2 text-sm"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button onClick={() => inviteMut.mutate()} disabled={!email || inviteMut.isPending}>
            Enviar convite
          </Button>
        </div>
        <p className="text-xs text-slate-500">O convite chega por email; o usuário define a senha ao aceitar.</p>
      </div>

      <div className="bg-white rounded border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Criado em</th>
              <th className="p-3">Último acesso</th>
              {ROLES.map((r) => <th key={r} className="p-3 text-center capitalize">{r}</th>)}
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4 + ROLES.length} className="p-4 text-center">Carregando…</td></tr>}
            {(users ?? []).map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-xs text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                <td className="p-3 text-xs text-slate-500">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}</td>
                {ROLES.map((r) => {
                  const has = u.roles.includes(r);
                  return (
                    <td key={r} className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={has}
                        onChange={() => toggleMut.mutate({ userId: u.id, role: r, enabled: !has })}
                      />
                    </td>
                  );
                })}
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { if (confirm(`Remover ${u.email}?`)) delMut.mutate(u.id); }}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
