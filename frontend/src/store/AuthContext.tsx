import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { User } from '@/services/auth-api';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE'; payload: { user: User; token: string } };

const STORAGE_TOKEN = 'token';
const STORAGE_USER = 'auth_user';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS': {
      const { user, token } = action.payload;
      try {
        localStorage.setItem(STORAGE_TOKEN, token);
        localStorage.setItem(STORAGE_USER, JSON.stringify(user));
      } catch {
        /* ignore */
      }
      return { user, isAuthenticated: true, isLoading: false };
    }
    case 'LOGIN_FAILURE':
      return { user: null, isAuthenticated: false, isLoading: false };
    case 'LOGOUT': {
      try {
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
      } catch {
        /* ignore */
      }
      return { user: null, isAuthenticated: false, isLoading: false };
    }
    case 'RESTORE': {
      const { user } = action.payload;
      return { user, isAuthenticated: true, isLoading: false };
    }
    default:
      return state;
  }
}

interface AuthContextValue {
  state: AuthState;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoginFailure: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((user: User, token: string) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const setLoginFailure = useCallback(() => {
    dispatch({ type: 'LOGIN_FAILURE' });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const raw = localStorage.getItem(STORAGE_USER);
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User;
        if (user?.id != null) dispatch({ type: 'RESTORE', payload: { user, token } });
        else {
          try { localStorage.removeItem(STORAGE_TOKEN); localStorage.removeItem(STORAGE_USER); } catch { /* ignore */ }
          dispatch({ type: 'LOGOUT' });
        }
      } catch {
        try { localStorage.removeItem(STORAGE_TOKEN); localStorage.removeItem(STORAGE_USER); } catch { /* ignore */ }
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  }, []);

  const value: AuthContextValue = { state, login, logout, setLoginFailure };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
