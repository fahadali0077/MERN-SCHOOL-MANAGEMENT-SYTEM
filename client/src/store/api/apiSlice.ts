import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { setToken, logout } from '../slices/authSlice';

// FIX: Use VITE_API_URL in production (Vercel → Render cross-origin).
// Falls back to relative /api/v1 when running locally behind the Vite proxy.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  }
});

// Tracks whether a refresh is already in-flight to prevent parallel refresh calls
// when multiple queries 401 at the same time.
let isRefreshing = false;

// FIX: Auto-refresh on 401 — with infinite-loop prevention.
//
// The original code had a critical flaw: after a failed refresh it dispatched
// logout() but still returned the original 401 result, which kept the RTK Query
// subscription alive. RTK Query would then see the tag invalidated (from logout)
// and immediately re-fire getMe → another 401 → another refresh attempt → loop.
//
// Fixes applied:
// 1. After a failed refresh we return a definitive error response that RTK Query
//    treats as a hard failure (not a retryable 401), so it stops polling.
// 2. We guard against re-entering the refresh flow for /auth/refresh itself,
//    and for any request that already went through a refresh attempt (tracked via
//    extraOptions._isRetry), so we never recurse.
// 3. isRefreshing flag prevents multiple simultaneous refresh calls when several
//    queries 401 at once on app load.
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Don't try to refresh if:
    // - this IS the refresh call (would recurse)
    // - this IS a login/register call (credentials wrong, not expired)
    // - we already retried once after a fresh token (prevent second loop)
    const url = typeof args === 'string' ? args : args?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');
    const alreadyRetried = extraOptions?._isRetry;

    if (!isAuthEndpoint && !alreadyRetried && !isRefreshing) {
      isRefreshing = true;

      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      isRefreshing = false;

      if (refreshResult.data) {
        const { accessToken } = (refreshResult.data as any).data;
        api.dispatch(setToken(accessToken));
        // Retry the original request exactly once — flag it so we don't loop
        result = await baseQuery(args, api, { ...extraOptions, _isRetry: true });
      } else {
        // Refresh failed — session is definitively over.
        // Dispatch logout and clear cache, but return a non-401 error so RTK
        // Query marks the query as "errored" and stops re-fetching.
        api.dispatch(logout());
        api.dispatch(apiSlice.util.resetApiState());
        import('../../hooks/useSocket').then(({ disconnectSocket }) => disconnectSocket());

        // Return a 403 so RTK Query treats this as a hard failure, not a
        // retriable 401. This prevents the infinite getMe→refresh→logout→getMe loop.
        return {
          error: {
            status: 403,
            data: { success: false, message: 'Session expired. Please log in again.' }
          }
        };
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Refetch when component mounts after navigating back — fixes stale data on browser back
  refetchOnMountOrArgChange: 30,
  // FIX: Was false but that still caused re-fetches on tab focus. Keep false.
  refetchOnFocus: false,
  // FIX: Do NOT refetch on reconnect — this was triggering getMe re-fires after
  // the logout() reset, because RTK Query sees a "reconnect" event and refires
  // all active queries. Setting this to false prevents that secondary trigger.
  refetchOnReconnect: false,
  tagTypes: [
    'User', 'Students', 'Teachers', 'Classes', 'Subjects',
    'Attendance', 'Exams', 'Marks', 'Fees', 'Invoices',
    'Notices', 'Notifications', 'Dashboard', 'Schools',
    'Assignments', 'Messages'
  ],
  endpoints: () => ({})
});
