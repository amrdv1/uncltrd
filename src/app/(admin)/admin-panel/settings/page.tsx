import { getSiteConfig } from "@/app/actions/config";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const config = await getSiteConfig();
  return <SettingsClient initialConfig={config} />;
}
