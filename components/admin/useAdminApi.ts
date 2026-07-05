"use client";

import { useCallback } from "react";
import { useAdmin } from "./AdminContext";

/**
 * Authenticated fetch for admin pages — adds the Supabase access token as
 * x-admin-token and normalizes errors into thrown Error objects with the
 * server's message.
 */
export function useAdminApi() {
  const { token } = useAdmin();

  return useCallback(
    async <T = unknown>(
      path: string,
      init?: Omit<RequestInit, "body"> & { body?: unknown },
    ): Promise<T> => {
      const { body, ...rest } = init ?? {};
      const res = await fetch(path, {
        ...rest,
        headers: {
          ...(body !== undefined && !(body instanceof FormData)
            ? { "Content-Type": "application/json" }
            : {}),
          "x-admin-token": token,
          ...rest.headers,
        },
        body:
          body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as T & { error?: string };
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      return json;
    },
    [token],
  );
}
