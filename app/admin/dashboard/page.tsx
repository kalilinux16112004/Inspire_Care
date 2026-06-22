'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AppointmentsManager from '@/components/admin/AppointmentsManager';
import DoctorsManager from '@/components/admin/DoctorsManager';
import ServicesManager from '@/components/admin/ServicesManager';
import GalleryManager from '@/components/admin/GalleryManager';
import DashboardStats from '@/components/admin/DashboardStats';
import CommunicationsCenter from '@/components/admin/CommunicationsCenter';
import { LogOut } from 'lucide-react';

type TabType = 'appointments' | 'doctors' | 'services' | 'gallery' | 'communications';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin auth
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsed = JSON.parse(auth);
      if (parsed.isAdmin) {
        setIsAuthorized(true);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('[v0] Auth error:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize hospital operations
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {activeTab === 'appointments' && (
              <>
                <DashboardStats />
                <AppointmentsManager />
              </>
            )}
            {activeTab === 'doctors' && <DoctorsManager />}
            {activeTab === 'services' && <ServicesManager />}
            {activeTab === 'gallery' && <GalleryManager />}
            {activeTab === 'communications' && <CommunicationsCenter />}
          </div>
        </div>
      </div>
    </div>
  );
}
