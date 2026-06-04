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
    avgRating: 0,
  });

  const fetchStats = async () => {
    try {
      const { data: totalA } = await supabase.from('appointments').select('*');
      const { data: pending } = await supabase.from('appointments').select('*').eq('status', 'pending');
      const { data: completed } = await supabase.from('appointments').select('*').eq('status', 'confirmed');
      const { data: cancelled } = await supabase.from('appointments').select('*').eq('status', 'rejected');
      const { data: doctors } = await supabase.from('doctors').select('id');

      setStats((s) => ({
        ...s,
        totalAppointments: Array.isArray(totalA) ? totalA.length : 0,
        pendingAppointments: Array.isArray(pending) ? pending.length : 0,
        completedAppointments: Array.isArray(completed) ? completed.length : 0,
        cancelledAppointments: Array.isArray(cancelled) ? cancelled.length : 0,
        totalDoctors: Array.isArray(doctors) ? doctors.length : 0,
      }));
    } catch (err) {
      console.error('[v0] Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('dashboard-stats')
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
      title: 'Completed',
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
    { label: 'Total Patients', value: stats.totalPatients, trend: '+12%' },
    { label: 'This Month', value: stats.appointmentsThisMonth, trend: '+5%' },
    { label: 'This Week', value: stats.appointmentsThisWeek, trend: '+2%' },
    { label: 'Occupancy Rate', value: `${stats.occupancyRate}%`, trend: '+3%' },
  ];

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
                  <span className="text-xl font-bold text-foreground">{metric.value}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{metric.trend}</span>
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
              { label: 'Completed', value: stats.completedAppointments, color: 'bg-green-500', percent: (stats.completedAppointments / stats.totalAppointments) * 100 },
              { label: 'Pending', value: stats.pendingAppointments, color: 'bg-amber-500', percent: (stats.pendingAppointments / stats.totalAppointments) * 100 },
              { label: 'Cancelled', value: stats.cancelledAppointments, color: 'bg-red-500', percent: (stats.cancelledAppointments / stats.totalAppointments) * 100 },
            ].map((status, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{status.label}</span>
                  <span className="text-sm font-bold text-foreground">{status.value} ({status.percent.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${status.color} h-2 rounded-full`} style={{ width: `${status.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Summary removed per request */}
    </div>
  );
}
