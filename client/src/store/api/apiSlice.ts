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

// FIX: Auto-refresh on 401
// - Changed /auth/refresh to explicit POST (was implicitly GET via string shorthand)
// - Changed raw action string dispatch to type-safe setToken() action creator
// - Guaranteed token is stored BEFORE retrying the original request
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // FIX: Must be POST — backend route is router.post('/refresh', ...)
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken } = (refreshResult.data as any).data;
      // FIX: Use the imported setToken action creator (not raw string dispatch)
      api.dispatch(setToken(accessToken));
      // Retry the original request with the new token now in state
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Refetch when component mounts after navigating back — fixes stale data on browser back
  refetchOnMountOrArgChange: 30,
  refetchOnFocus: false,
  tagTypes: [
    'User', 'Students', 'Teachers', 'Classes', 'Subjects',
    'Attendance', 'Exams', 'Marks', 'Fees', 'Invoices',
    'Notices', 'Notifications', 'Dashboard', 'Schools',
    'Assignments', 'Messages'
  ],
  endpoints: () => ({})
});
