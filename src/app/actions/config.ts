"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const CONFIG_FILE = path.join(process.cwd(), "site-config.json");

const defaultConfig = {
  siteName: "UNCULTURED",
  description: "Головний голос сучасного хіп-хопу та андеграунд-культури.",
  contactEmail: "contact@uncultured.ua",
  defaultLanguage: "Українська",
  accentColor: "#FF3366",
};

export async function getSiteConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return { ...defaultConfig, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error("Failed to read site config", e);
  }
  return defaultConfig;
}

export async function updateSiteConfig(formData: FormData) {
  const newConfig = {
    siteName: formData.get("siteName") as string,
    description: formData.get("description") as string,
    contactEmail: formData.get("contactEmail") as string,
    defaultLanguage: formData.get("defaultLanguage") as string,
  };

  try {
    const currentConfig = await getSiteConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    console.error("Failed to save site config", e);
    return { success: false };
  }
}

export async function updateAccentColor(color: string) {
  try {
    const currentConfig = await getSiteConfig();
    const updatedConfig = { ...currentConfig, accentColor: color };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    console.error("Failed to save accent color", e);
    return { success: false };
  }
}
