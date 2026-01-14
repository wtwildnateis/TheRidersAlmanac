import { create } from 'zustand';

function normalizeRoles(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr
    .filter(Boolean)
    .map(r => String(r).trim())
    .map(r => r.startsWith('ROLE_') ? r.slice(5) : r) 
    .map(r => r.toUpperCase());
}

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('authToken') || null,
  user: (() => {
    try { return JSON.parse(localStorage.getItem('authUser') || 'null'); }
    catch { return null; }
  })(),

  login: (token, userRaw) => {
    const user = userRaw ? { ...userRaw, roles: normalizeRoles(userRaw.roles) } : null;
    if (token) localStorage.setItem('authToken', token); else localStorage.removeItem('authToken');
    if (user)  localStorage.setItem('authUser', JSON.stringify(user)); else localStorage.removeItem('authUser');
    set({ token, user });
  },

  setToken: (token) => {
    if (token) localStorage.setItem('authToken', token); else localStorage.removeItem('authToken');
    set({ token });
  },

  setUser: (userRaw) => {
    const user = userRaw ? { ...userRaw, roles: normalizeRoles(userRaw.roles) } : null;
    if (user) localStorage.setItem('authUser', JSON.stringify(user)); else localStorage.removeItem('authUser');
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    set({ token: null, user: null });
  },

  hasRole: (role) => {
    const u = get().user;
    if (!u?.roles) return false;
    const want = (role || '').toUpperCase().replace(/^ROLE_/, '');
    return u.roles.includes(want);
  },

  hasAnyRole: (...roles) => {
    const u = get().user;
    if (!u?.roles) return false;
    const wants = roles.map(r => String(r).toUpperCase().replace(/^ROLE_/, ''));
    return u.roles.some(r => wants.includes(r));
  },
  
}));

export function useAuthStoreRoles() {
  const state = useAuthStore();
  const hasAnyRole = (...roles) => {
    const list = state.user?.roles || [];
    return roles.some(r => list.includes(r));
  };
  return { hasAnyRole };
}