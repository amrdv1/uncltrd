import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSiteConfig } from "@/app/actions/config";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  const allowedEmails = ["gokrai@uncultured.media", "leanoplav@uncultured.media", "skyti@uncultured.media"];
  const isAdmin = session?.user?.role === "ADMIN" || allowedEmails.includes(session?.user?.email?.toLowerCase() || "");
  
  if (!isAdmin) {
    redirect("/admin-panel");
  }

  const config = await getSiteConfig();
  return <SettingsClient initialConfig={config} />;
}
