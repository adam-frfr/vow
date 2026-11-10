import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth";
import { AdminButton } from "../ui";
import { Card, Empty, fmt, Search } from "../parts";

export const dynamic = "force-dynamic";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  const { q = "", f = "" } = await searchParams;
  const users = await db.user.findMany({
    where: {
      ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {}),
      ...(f === "blocked" ? { blocked: true } : f === "admins" ? { isAdmin: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { sites: true } } },
  });
  const failed = await db.loginEvent.groupBy({
    by: ["email"],
    where: { ok: false, createdAt: { gte: new Date(Date.now() - 86_400_000) } },
    _count: { _all: true },
  });
  const failedBy = new Map(failed.map((x) => [x.email, x._count._all]));

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Users</h1>
      <Card title={`${users.length} ${users.length === 1 ? "account" : "accounts"}`}>
        <div className="flex flex-wrap items-start gap-3">
          <Search placeholder="Search email or name" q={q} />
          <div className="flex gap-1.5 text-xs">
            {[
              ["", "All"],
              ["blocked", "Suspended"],
              ["admins", "Admins"],
            ].map(([k, l]) => (
              <a
                key={k}
                href={`?f=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`rounded-full border px-3 py-1.5 ${f === k ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
        {users.length === 0 ? (
          <Empty>No users match.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone">
                <tr>
                  <th className="py-2 pr-3 font-normal">Account</th>
                  <th className="py-2 pr-3 font-normal">Sites</th>
                  <th className="py-2 pr-3 font-normal">Joined</th>
                  <th className="py-2 pr-3 font-normal">Last sign-in</th>
                  <th className="py-2 pr-3 font-normal">Status</th>
                  <th className="py-2 font-normal" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => {
                  const envAdmin = isAdminEmail(u.email);
                  const fails = failedBy.get(u.email) ?? 0;
                  return (
                    <tr key={u.id} className={u.blocked ? "bg-red-50/40" : ""}>
                      <td className="py-3 pr-3">
                        <span className="block font-medium">{u.name || "—"}</span>
                        <span className="text-xs text-stone">{u.email}</span>
                      </td>
                      <td className="py-3 pr-3">
                        <a href={`/admin/sites?q=${encodeURIComponent(u.email)}`} className="underline">
                          {u._count.sites}
                        </a>
                      </td>
                      <td className="py-3 pr-3 text-xs">{fmt(u.createdAt)}</td>
                      <td className="py-3 pr-3 text-xs">
                        {fmt(u.lastLoginAt)}
                        {fails > 0 && <span className="block text-red-700">{fails} failed today</span>}
                      </td>
                      <td className="py-3 pr-3 text-xs">
                        {u.blocked && <span className="mr-1 rounded-full bg-red-100 px-2 py-0.5 text-red-800">Suspended</span>}
                        {(u.isAdmin || envAdmin) && <span className="rounded-full bg-ink px-2 py-0.5 text-white">Admin</span>}
                        {!u.blocked && !u.isAdmin && !envAdmin && <span className="text-stone">Active</span>}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {u.blocked ? (
                            <AdminButton url={`/api/admin/users/${u.id}`} body={{ blocked: false }}>
                              Restore
                            </AdminButton>
                          ) : (
                            <AdminButton
                              url={`/api/admin/users/${u.id}`}
                              body={{ blocked: true }}
                              tone="danger"
                              confirm={`Suspend ${u.email}? They won't be able to sign in and their sites go offline.`}
                            >
                              Suspend
                            </AdminButton>
                          )}
                          {!envAdmin &&
                            (u.isAdmin ? (
                              <AdminButton url={`/api/admin/users/${u.id}`} body={{ isAdmin: false }}>
                                Remove admin
                              </AdminButton>
                            ) : (
                              <AdminButton url={`/api/admin/users/${u.id}`} body={{ isAdmin: true }} confirm={`Give ${u.email} full admin access?`}>
                                Make admin
                              </AdminButton>
                            ))}
                          <AdminButton
                            url={`/api/admin/users/${u.id}`}
                            method="DELETE"
                            tone="danger"
                            confirm={`Permanently delete ${u.email} and all their sites, RSVPs and photos? This cannot be undone.`}
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
