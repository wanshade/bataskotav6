import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Returns the session if the current user is an admin or superadmin, else null.
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'superadmin'].includes(session.user?.role ?? '')) {
    return null;
  }
  return session;
}
