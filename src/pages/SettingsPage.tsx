import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Mail, Save, User2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { DISPLAY_NAME_MAX, validateDisplayName } from "@/utils/displayName";

export default function SettingsPage() {
  const { user, profile, displayName, updateDisplayName, profileLoading, profileError } =
    useAuth();

  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Keep the field in sync once the profile finishes loading.
  useEffect(() => setName(displayName), [displayName]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const check = validateDisplayName(name);
    if (!check.ok) {
      setError(check.error ?? "Invalid display name.");
      return;
    }

    setSaving(true);
    const result = await updateDisplayName(check.value);
    setSaving(false);

    if (result.error) setError(result.error);
    else setSuccess(result.info ?? "Saved.");
  };

  const dirty = name.trim() !== displayName;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage the name other parts of SortCraft use for you.
        </p>
      </header>

      {profileError && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          {profileError}
        </p>
      )}

      <Card className="mb-6">
        <CardHeader
          title="Profile"
          icon={<User2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
        />
        <form onSubmit={handleSubmit} className="space-y-4 p-4" noValidate>
          <Input
            label="Display name"
            name="displayName"
            value={name}
            maxLength={DISPLAY_NAME_MAX}
            disabled={profileLoading || saving}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            hint="Shown in the header, on your dashboard and in your progress page."
            error={error}
          />

          {success && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={saving || profileLoading || !dirty}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {dirty && !saving && (
              <Button type="button" variant="ghost" onClick={() => setName(displayName)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Account"
          icon={<Mail className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
        />
        <dl className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <dt className="text-slate-600 dark:text-slate-400">Email</dt>
            <dd className="min-w-0 truncate font-mono text-xs text-slate-800 dark:text-slate-200">
              {user?.email ?? "—"}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <dt className="text-slate-600 dark:text-slate-400">Username</dt>
            <dd className="min-w-0 truncate font-mono text-xs text-slate-800 dark:text-slate-200">
              {profile?.username ? `@${profile.username}` : "—"}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <dt className="text-slate-600 dark:text-slate-400">Member since</dt>
            <dd className="font-mono text-xs text-slate-800 dark:text-slate-200">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
        <p className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          Your email address is managed by Supabase Auth and is never shown in the
          header. Passwords are handled entirely by Supabase — SortCraft never stores
          them.
        </p>
      </Card>
    </div>
  );
}
