'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, Clock, Trash2 } from 'lucide-react';
import { updateAppointmentStatus, softDeleteAppointment } from '@/lib/booking';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  symptoms_description: string;
  created_at: string;
  doctor_id: string;
  doctors?: {
    name: string;
    specialization: string;
  };
}

export default function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  useEffect(() => {
    const channel = supabase
      .channel('appointments-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('[v0] realtime appointment event:', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        channel.unsubscribe();
      }
    };
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('appointments')
        .select('*, doctors(name, specialization)')
        .is('deleted_at', null)
        .order('appointment_date', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments((data as Appointment[]) || []);
    } catch (error) {
      console.error('[v0] Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const result = await updateAppointmentStatus(id, newStatus, 'admin');

      if (!result.success) {
        alert(result.error || 'Failed to update status.');
        return;
      }

      // Update local state
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('[v0] Error updating appointment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action will soft-delete the record.')) {
      return;
    }
    try {
      const result = await softDeleteAppointment(id, 'admin');

      if (!result.success) {
        alert(result.error || 'Failed to delete appointment.');
        return;
      }

      // Remove from local state
      setAppointments((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'rejected', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-foreground hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Patient</th>
                  <th className="px-6 py-3 text-left">Doctor</th>
                  <th className="px-6 py-3 text-left">Date & Time</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-slate-600">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{appointment.patient_name}</p>
                        <p className="text-xs text-muted-foreground">{appointment.patient_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {appointment.doctors ? (
                        <div>
                          <p className="font-semibold text-slate-800">{appointment.doctors.name}</p>
                          <p className="text-xs text-muted-foreground">{appointment.doctors.specialization}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Unassigned</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-800 font-medium">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{appointment.appointment_time}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs text-slate-700 font-mono">{appointment.patient_phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(appointment.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm h-8"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(appointment.id, 'rejected')}
                              className="text-red-600 border-red-200 hover:bg-red-50 font-medium h-8"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(appointment.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 font-medium h-8 px-2"
                          title="Soft Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
