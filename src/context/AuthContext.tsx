import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, type Profile } from "@/lib/supabase";
import { resolveDisplayName, validateDisplayName } from "@/utils/displayName";

export interface AuthResult {
  error: string | null;
  info?: string | null;
  /** Whether sign-up produced a usable session (false when email confirmation is pending). */
  authenticated?: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** Resolved name for the header — never an email when a display name exists. */
  displayName: string;
  loading: boolean;
  /** True while the profile row for the current user is being fetched. */
  profileLoading: boolean;
  /** Non-fatal profile load/save problem, safe to show to the user. */
  profileError: string | null;
  configured: boolean;
  signUp: (args: {
    email: string;
    password: string;
    displayName: string;
    username: string;
  }) => Promise<AuthResult>;
  signIn: (args: { email: string; password: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const NOT_CONFIGURED =
  "Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file and restart the dev server.";

/** Turns raw Supabase errors into friendly, student-readable messages. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email and password combination doesn't match an account.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email address first — check your inbox for the verification link.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try logging in instead.";
  if (m.includes("password should be at least"))
    return "Your password is too short — use at least 6 characters.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "That email address doesn't look valid.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("failed to fetch") || m.includes("networkerror"))
    return "Could not reach Supabase. Check your internet connection and project URL.";
  if (m.includes("duplicate key") && m.includes("username"))
    return "That username is already taken. Please choose another.";
  if (m.includes("row-level security") || m.includes("permission denied"))
    return "You don't have permission to do that. Try logging in again.";
  return message;
}

/**
 * Logs a problem without ever touching tokens, passwords or the session object.
 * Only the message string is emitted.
 */
function logSafely(scope: string, error: unknown): void {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";
  console.warn(`[SortCraft/${scope}] ${message}`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  /** Identity currently rendered — used to discard out-of-order responses. */
  const activeUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string, authUser?: User | null) => {
    if (!supabase) return;
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // A newer identity took over while this request was in flight — drop it.
      if (activeUserId.current !== userId) return;

      if (error) {
        logSafely("loadProfile", error);
        setProfileError(
          "We couldn't load your profile just now. Your name may show a fallback until this recovers."
        );
        return;
      }

      let row = (data as Profile | null) ?? null;

      // Self-heal: if the profile row is missing or its display_name is blank
      // (for example the account was created before this flow existed, or the
      // sign-up trigger had no metadata), restore it from auth metadata.
      const metadata = authUser?.user_metadata as Record<string, unknown> | undefined;
      const metadataName =
        typeof metadata?.display_name === "string" ? metadata.display_name.trim() : "";
      const metadataUsername =
        typeof metadata?.username === "string" ? metadata.username.trim() : "";

      const needsName = !row?.display_name || row.display_name.trim().length === 0;
      if (metadataName && needsName) {
        const { data: patched, error: patchError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              display_name: metadataName,
              ...(row?.username ? {} : metadataUsername ? { username: metadataUsername } : {}),
            },
            { onConflict: "id" }
          )
          .select()
          .maybeSingle();
        if (patchError) logSafely("healProfile", patchError);
        else if (patched) row = patched as Profile;
      }

      if (activeUserId.current !== userId) return;
      setProfile(row);
      setProfileError(null);
    } catch (err) {
      logSafely("loadProfile", err);
      if (activeUserId.current === userId) {
        setProfileError(
          "We couldn't reach Supabase to load your profile. Showing a fallback name."
        );
      }
    } finally {
      if (activeUserId.current === userId) setProfileLoading(false);
    }
  }, []);

  /** Applies a new session, clearing stale profile state the moment the user changes. */
  const applySession = useCallback(
    (nextSession: Session | null) => {
      const nextUser = nextSession?.user ?? null;
      const nextId = nextUser?.id ?? null;

      if (activeUserId.current !== nextId) {
        // Different (or no) user: wipe the previous user's profile immediately so
        // their name can never flash in the header.
        setProfile(null);
        setProfileError(null);
        activeUserId.current = nextId;
      }

      setSession(nextSession);
      setUser(nextUser);

      if (nextId && nextUser) void loadProfile(nextId, nextUser);
      else setProfileLoading(false);
    },
    [loadProfile]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) logSafely("getSession", error);
        applySession(data.session);
      })
      .catch((err) => logSafely("getSession", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async ({ email, password, displayName, username }) => {
      if (!supabase) return { error: NOT_CONFIGURED };

      // Values arrive pre-validated from the form, but never trust the caller.
      const nameCheck = validateDisplayName(displayName);
      if (!nameCheck.ok) return { error: nameCheck.error ?? "Invalid display name." };
      const cleanName = nameCheck.value;
      const cleanUsername = username.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        // Stored on auth.users.raw_user_meta_data. The existing
        // handle_new_user() trigger reads these to seed public.profiles, which
        // is what makes the display name survive email confirmation (no client
        // session exists at that point).
        options: { data: { display_name: cleanName, username: cleanUsername } },
      });
      if (error) return { error: friendlyAuthError(error.message) };

      if (data.user && data.session) {
        // Session available immediately (email confirmation disabled): make sure
        // the row matches exactly what the user typed. The trigger already
        // inserted a row, so this is an update, not a duplicate system.
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            { id: data.user.id, display_name: cleanName, username: cleanUsername },
            { onConflict: "id" }
          );
        if (profileError) {
          logSafely("signUp/profile", profileError);
          return { error: friendlyAuthError(profileError.message) };
        }
        activeUserId.current = data.user.id;
        await loadProfile(data.user.id, data.user);
        return {
          error: null,
          info: `Account created. Welcome to SortCraft, ${cleanName}!`,
          authenticated: true,
        };
      }

      // Email confirmation is on: the trigger persisted display_name from the
      // metadata above, and loadProfile() reconciles it on first login.
      return {
        error: null,
        info: "Account created. Check your inbox to confirm your email, then log in.",
        authenticated: false,
      };
    },
    [loadProfile]
  );

  const signIn = useCallback<AuthContextValue["signIn"]>(async ({ email, password }) => {
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { error: friendlyAuthError(error.message) };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    // Clear local identity first so no personalised data can render during the
    // network round-trip.
    activeUserId.current = null;
    setProfile(null);
    setProfileError(null);
    setUser(null);
    setSession(null);
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) logSafely("signOut", error);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id, user);
  }, [loadProfile, user]);

  const updateDisplayName = useCallback<AuthContextValue["updateDisplayName"]>(
    async (name) => {
      if (!supabase) return { error: NOT_CONFIGURED };
      if (!user) return { error: "You need to be logged in to change your name." };

      const check = validateDisplayName(name);
      if (!check.ok) return { error: check.error ?? "Invalid display name." };

      const { data, error } = await supabase
        .from("profiles")
        .update({ display_name: check.value })
        .eq("id", user.id)
        .select()
        .maybeSingle();

      if (error) {
        logSafely("updateDisplayName", error);
        return { error: friendlyAuthError(error.message) };
      }

      // Keep auth metadata in sync so the fallback chain stays consistent.
      const { error: metaError } = await supabase.auth.updateUser({
        data: { display_name: check.value },
      });
      if (metaError) logSafely("updateDisplayName/metadata", metaError);

      if (data) setProfile(data as Profile);
      return { error: null, info: "Display name updated." };
    },
    [user]
  );

  const displayName = useMemo(() => resolveDisplayName(profile, user), [profile, user]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      displayName,
      loading,
      profileLoading,
      profileError,
      configured: isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updateDisplayName,
    }),
    [
      user,
      session,
      profile,
      displayName,
      loading,
      profileLoading,
      profileError,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updateDisplayName,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
