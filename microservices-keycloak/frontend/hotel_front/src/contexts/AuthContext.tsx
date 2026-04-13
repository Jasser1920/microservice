import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Role, User } from '@/types';
import keycloak from '@/lib/keycloak';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasPermission: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePriority: Role[] = ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'];

const resolveRole = (roles: string[]): Role => {
  const normalized = roles.map(r => r.toUpperCase());
  return rolePriority.find(r => normalized.includes(r)) || 'CLIENT';
};

const extractRoles = (tokenParsed?: Record<string, unknown>): string[] => {
  if (!tokenParsed) return [];
  const roleClientId = import.meta.env.VITE_KEYCLOAK_ROLE_CLIENT_ID || 'backend-client';
  const resourceAccess = tokenParsed.resource_access as Record<string, { roles?: string[] }> | undefined;
  const clientRoles = resourceAccess?.[roleClientId]?.roles || [];
  const realmAccess = tokenParsed.realm_access as { roles?: string[] } | undefined;
  return [...(clientRoles || []), ...(realmAccess?.roles || [])];
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      })
      .then(authenticated => {
        if (authenticated && keycloak.tokenParsed) {
          const roles = extractRoles(keycloak.tokenParsed as Record<string, unknown>);
          const role = resolveRole(roles);
          setUser({
            id: String(keycloak.subject || ''),
            email: String(keycloak.tokenParsed?.email || ''),
            firstName: String(keycloak.tokenParsed?.given_name || ''),
            lastName: String(keycloak.tokenParsed?.family_name || ''),
            phone: '',
            role,
            active: true,
            createdAt: '',
          });
        } else {
          setUser(null);
        }
      })
      .finally(() => setIsInitialized(true));
  }, []);

  const login = () => {
    keycloak.login({ redirectUri: `${window.location.origin}/dashboard` });
  };

  const logout = () => {
    keycloak.logout({ redirectUri: `${window.location.origin}/login` });
  };

  const hasPermission = (allowedRoles: Role[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isInitialized,
      hasPermission,
    }),
    [user, isInitialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
