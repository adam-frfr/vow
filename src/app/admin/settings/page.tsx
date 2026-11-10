import { settingsForAdmin } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Settings &amp; AI</h1>
      <SettingsForm initial={await settingsForAdmin()} />
    </div>
  );
}
