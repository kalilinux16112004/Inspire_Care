'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Stethoscope, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalAppointments: 234,
    pendingAppointments: 12,
    completedAppointments: 182,
    cancelledAppointments: 40,
    totalDoctors: 45,
    totalPatients: 1250,
    appointmentsThisMonth: 45,
    appointmentsThisWeek: 18,
    occupancyRate: 78,
    avgRating: 4.7,
  });

  useEffect(() => {
    // In production, fetch from Supabase
    console.log('[v0] Dashboard stats loaded');
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

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Appointments Booked Today', value: 8, icon: '📅' },
            { title: 'New Patient Registrations', value: 5, icon: '👥' },
            { title: 'Average Rating', value: stats.avgRating.toFixed(1), icon: '⭐' },
          ].map((activity, idx) => (
            <div key={idx} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <div className="text-3xl mb-2">{activity.icon}</div>
              <p className="text-sm text-muted-foreground mb-1">{activity.title}</p>
              <p className="text-2xl font-bold text-foreground">{activity.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
