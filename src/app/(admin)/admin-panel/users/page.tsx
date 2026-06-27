import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { FadeIn } from "@/components/ui/FadeIn";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { ChangeRoleSelect } from "@/components/admin/ChangeRoleSelect";

export default async function AdminUsersPage() {
  const session = await auth();
  const allowedEmails = ["gokrai@uncultured.media", "leanoplav@uncultured.media", "skyti@uncultured.media"];
  if (session?.user?.role !== "ADMIN" && !allowedEmails.includes(session?.user?.email?.toLowerCase() || "")) {
    // Only admins or specific users can see users
    redirect("/admin-panel");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  const isTrueAdmin = session?.user?.role === "ADMIN";
  const currentUserEmail = session?.user?.email?.toLowerCase() || "";

  async function createEditor(formData: FormData) {
    "use server"
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // Check auth again
    const s = await auth();
    if (s?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "EDITOR"
      }
    });

    revalidatePath("/admin-panel/users");
  }

  return (
    <FadeIn className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white mb-12" style={{ fontFamily: "var(--font-space-grotesk)"}}>
        Керування користувачами<span className="text-accent">.</span>
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-zinc-50 dark:bg-[#151515] border-b border-zinc-200 dark:border-zinc-800/50 text-zinc-500">
                <tr>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Name</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Email</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Role</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Joined</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-6 font-bold text-black dark:text-white">{u.name || "N/A"}</td>
                    <td className="p-6 text-zinc-500 dark:text-zinc-400 font-medium">{u.email}</td>
                    <td className="p-6">
                      {session?.user?.id === u.id || (allowedEmails.includes(session?.user?.email?.toLowerCase() || "") && allowedEmails.includes(u.email?.toLowerCase() || "")) || (!isTrueAdmin && u.role === "ADMIN") ? (
                        <span className={`px-3 py-1 text-[9px] rounded-full font-black uppercase tracking-widest border ${
                          u.role === "ADMIN" ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-500 dark:border-purple-500/20" :
                          u.role === "EDITOR" ? "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-500/10 dark:text-lime-500 dark:border-lime-500/20" :
                          "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                        }`}>
                          {u.role}
                        </span>
                      ) : (
                        <ChangeRoleSelect userId={u.id} currentRole={u.role} />
                      )}
                    </td>
                    <td className="p-6 text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{u.createdAt.toLocaleDateString("uk-UA")}</td>
                    <td className="p-6 text-right">
                      {isTrueAdmin && <ChangePasswordForm userId={u.id} userName={u.name || "Користувач"} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full" />
            <h3 className="font-black uppercase text-xl text-black dark:text-white mb-6 relative z-10" style={{ fontFamily: "var(--font-space-grotesk)"}}>Створити Редактора</h3>
            <form action={createEditor} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Ім'я</label>
                <input name="name" type="text" required className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                <input name="email" type="email" required className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Пароль</label>
                <input name="password" type="password" required className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors" />
              </div>
              <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white hover:scale-[1.02] transition-all mt-4 shadow-sm">
                Створити
              </button>
            </form>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
