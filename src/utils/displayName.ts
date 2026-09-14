import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase";

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 40;
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;

/**
 * Single source of truth for the fallback chain used everywhere a human-readable
 * name is rendered:
 *
 *   1. profiles.display_name          (authoritative, user-chosen)
 *   2. user.user_metadata.display_name (mirror written at sign-up)
 *   3. profiles.username
 *   4. email local-part
 *   5. "User"
 *
 * The email local-part is deliberately LAST so a chosen display name is never
 * replaced by something derived from the address.
 */
export function resolveDisplayName(
  profile: Profile | null | undefined,
  user: User | null | undefined
): string {
  const fromProfile = clean(profile?.display_name);
  if (fromProfile) return fromProfile;

  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const fromMetadata = clean(
    typeof metadata?.display_name === "string" ? metadata.display_name : null
  );
  if (fromMetadata) return fromMetadata;

  const fromUsername = clean(profile?.username);
  if (fromUsername) return fromUsername;

  const localPart = clean(user?.email?.split("@")[0] ?? null);
  if (localPart) return localPart;

  return "User";
}

/** Short label for compact UI (avatar circles, tight navbars). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface ValidationResult {
  ok: boolean;
  value: string;
  error?: string;
}

/** Trims and validates a display name. Never returns an email-derived value. */
export function validateDisplayName(raw: string): ValidationResult {
  const value = raw.trim().replace(/\s+/g, " ");
  if (value.length === 0)
    return { ok: false, value, error: "Please enter a display name." };
  if (value.length < DISPLAY_NAME_MIN)
    return {
      ok: false,
      value,
      error: `Display names must be at least ${DISPLAY_NAME_MIN} characters.`,
    };
  if (value.length > DISPLAY_NAME_MAX)
    return {
      ok: false,
      value,
      error: `Display names must be ${DISPLAY_NAME_MAX} characters or fewer.`,
    };
  return { ok: true, value };
}

/** Trims and lower-cases a username. */
export function validateUsername(raw: string): ValidationResult {
  const value = raw.trim().toLowerCase();
  if (value.length === 0)
    return { ok: false, value, error: "Please enter a username." };
  if (!USERNAME_PATTERN.test(value))
    return {
      ok: false,
      value,
      error:
        "Usernames must be 3–20 characters using letters, numbers or underscores.",
    };
  return { ok: true, value };
}

function clean(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
