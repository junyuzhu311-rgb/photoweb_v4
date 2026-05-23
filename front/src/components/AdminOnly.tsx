import { type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminOnly({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  return role === 'admin' ? <>{children}</> : null;
}
