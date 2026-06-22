'use client';

import { useState, useEffect } from 'react';
import { Calendar, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardStats() {
  const supabase = createClient();

  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    appointmentsThisMonth: 0,
    appointmentsThisWeek: 0,
    occupancyRate: 0,
    avgRating: 4.8,
  });

  const fetchStats = async () => {
    try {
      // Fetch all pre-aggregated KPIs from our database view in a single fast query
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const total = Number(data.total_appointments || 0);
        const completed = Number(data.completed_appointments || 0);
        
        setStats({
          totalAppointments: total,
          pendingAppointments: Number(data.pending_appointments || 0),
          completedAppointments: completed,
          cancelledAppointments: Number(data.cancelled_appointments || 0),
          totalDoctors: Number(data.total_doctors || 0),
          totalPatients: Number(data.total_patients || 0),
          appointmentsThisMonth: Number(data.appointments_this_month || 0),
          appointmentsThisWeek: Number(data.appointments_this_week || 0),
          occupancyRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          avgRating: Number(data.avg_rating || 4.8),
        });
      }
    } catch (err) {
      console.error('[v0] Error fetching dashboard view stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen for inserts, deletes, or updates to appointments to refresh metrics instantly
    const channel = supabase
      .channel('dashboard-stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => fetchStats())
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Pending Approval',
      value: stats.pendingAppointments,
      icon: AlertCircle,
      color: 'bg-amber-100 text-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
    },
    {
      title: 'Active / Confirmed',
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: 'bg-pink-100 text-pink-600',
      bgGradient: 'from-pink-50 to-pink-100',
    },
  ];

  const quickMetrics = [
    { label: 'Unique Patients', value: stats.totalPatients, trend: 'Database View' },
    { label: 'Appointments (This Month)', value: stats.appointmentsThisMonth, trend: 'Database View' },
    { label: 'Appointments (This Week)', value: stats.appointmentsThisWeek, trend: 'Database View' },
    { label: 'Patient Avg Rating', value: `${stats.avgRating} ★`, trend: 'Reviews View' },
  ];

  const calculatePercent = (value: number) => {
    if (stats.totalAppointments === 0) return 0;
    return Math.round((value / stats.totalAppointments) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${card.bgGradient} border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Metrics & Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h3>
          <div className="space-y-4">
            {quickMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-slate-800">{metric.value}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Appointment Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Confirmed / Completed', value: stats.completedAppointments, color: 'bg-green-500', percent: calculatePercent(stats.completedAppointments) },
              { label: 'Pending Approval', value: stats.pendingAppointments, color: 'bg-amber-500', percent: calculatePercent(stats.pendingAppointments) },
              { label: 'Rejected / Cancelled', value: stats.cancelledAppointments, color: 'bg-red-500', percent: calculatePercent(stats.cancelledAppointments) },
            ].map((status, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{status.label}</span>
                  <span className="text-sm font-bold text-foreground">{status.value} ({status.percent}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${status.color} h-2 rounded-full`} style={{ width: `${status.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
