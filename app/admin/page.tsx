'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /admin to /admin/login
    router.replace('/admin/login');
  }, [router]);

  return null;
}
