import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, selectUserRole, logout } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/endpoints';
import { useNavigate } from 'react-router-dom';

// ─── useAuth ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const signOut = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // continue even if API call fails
    }
    dispatch(logout());
    navigate('/auth/login');
  }, [logoutMutation, dispatch, navigate]);

  const can = useCallback((roles: string[]) => {
    return role ? roles.includes(role) : false;
  }, [role]);

  const isAdmin = role === 'superAdmin' || role === 'schoolAdmin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  const isParent = role === 'parent';
  const isSuperAdmin = role === 'superAdmin';

  return {
    user, isAuthenticated, role,
    isAdmin, isTeacher, isStudent, isParent, isSuperAdmin,
    signOut, isLoggingOut, can
  };
}

// ─── useDebounce ──────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ─── usePagination ────────────────────────────────────────────────────────────
interface PaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination({ initialPage = 1, initialLimit = 25 }: PaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goToPage = useCallback((p: number) => setPage(p), []);
  const nextPage = useCallback(() => setPage(p => p + 1), []);
  const prevPage = useCallback(() => setPage(p => Math.max(1, p - 1)), []);
  const resetPage = useCallback(() => setPage(1), []);

  return { page, limit, setPage: goToPage, nextPage, prevPage, resetPage, setLimit };
}

// ─── useLocalStorage ──────────────────────────────────────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error('useLocalStorage error:', err);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// ─── useMediaQuery ────────────────────────────────────────────────────────────
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');

// ─── useClickOutside ──────────────────────────────────────────────────────────
export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

// ─── useToast ────────────────────────────────────────────────────────────────
import toast from 'react-hot-toast';

export function useToast() {
  return {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    loading: (msg: string) => toast.loading(msg),
    promise: <T,>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
      toast.promise(promise, msgs),
    dismiss: () => toast.dismiss(),
  };
}

// ─── useSearch ────────────────────────────────────────────────────────────────
export function useSearch(delay = 400) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, delay);

  return { search, setSearch, debouncedSearch };
}

// ─── useConfirm ───────────────────────────────────────────────────────────────
export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title?: string;
    description?: string;
    resolve?: (confirmed: boolean) => void;
  }>({ isOpen: false });

  const confirm = useCallback((options: { title?: string; description?: string } = {}) => {
    return new Promise<boolean>(resolve => {
      setState({ isOpen: true, ...options, resolve });
    });
  }, []);

  const handleClose = useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false });
  }, [state]);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false });
  }, [state]);

  return {
    confirm,
    dialogProps: {
      isOpen: state.isOpen,
      onClose: handleClose,
      onConfirm: handleConfirm,
      title: state.title,
      description: state.description,
    }
  };
}

// ─── useWindowTitle ───────────────────────────────────────────────────────────
export function useWindowTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | SchoolMS` : 'SchoolMS';
    return () => { document.title = prev; };
  }, [title]);
}

// ─── useCountUp ───────────────────────────────────────────────────────────────
export function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}
