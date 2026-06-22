'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Loader2, Mail, MessageSquare, Clock, AlertTriangle, 
  Eye, RefreshCw, Search, ShieldCheck, X, Database, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuditEmail {
  id: string;
  recipient: string;
  subject: string;
  html_content: string;
  status: string;
  created_at: string;
}

interface SmsLog {
  id: string;
  mobile: string;
  template_name: string;
  fast2sms_request_id: string | null;
  status: string;
  sms_credits_used: number;
  sms_rate: number;
  provider_response: any;
  created_at: string;
}

interface QueueItem {
  id: string;
  type: string;
  recipient: string;
  subject: string | null;
  payload: string;
  status: string;
  retry_count: number;
  next_retry_at: string;
  last_error: string | null;
  created_at: string;
}

type TabType = 'emails' | 'sms' | 'queue' | 'failed';

export default function CommunicationsCenter() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabType>('emails');
  
  // Data States
  const [emails, setEmails] = useState<AuditEmail[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [failed, setFailed] = useState<QueueItem[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<AuditEmail | null>(null);
  const [selectedSms, setSelectedSms] = useState<SmsLog | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<QueueItem | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Auto-refresh when tab changes
  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // Real-time subscriptions setup
  useEffect(() => {
    const emailChannel = supabase
      .channel('cc-email-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_emails' }, () => {
        if (activeTab === 'emails') fetchTabData();
      })
      .subscribe();

    const smsChannel = supabase
      .channel('cc-sms-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sms_logs' }, () => {
        if (activeTab === 'sms') fetchTabData();
      })
      .subscribe();

    const queueChannel = supabase
      .channel('cc-queue-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_queue' }, () => {
        if (activeTab === 'queue' || activeTab === 'failed') fetchTabData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(emailChannel);
      supabase.removeChannel(smsChannel);
      supabase.removeChannel(queueChannel);
    };
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'emails') {
        const { data, error } = await supabase
          .from('audit_emails')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setEmails((data as AuditEmail[]) || []);
      } else if (activeTab === 'sms') {
        const { data, error } = await supabase
          .from('sms_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setSmsLogs((data as SmsLog[]) || []);
      } else if (activeTab === 'queue') {
        const { data, error } = await supabase
          .from('notification_queue')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setQueue((data as QueueItem[]) || []);
      } else if (activeTab === 'failed') {
        const { data, error } = await supabase
          .from('notification_queue')
          .select('*')
          .eq('status', 'failed')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setFailed((data as QueueItem[]) || []);
      }
    } catch (e: any) {
      console.error(`Error loading communications tab ${activeTab}:`, e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryQueueItem = async (id: string) => {
    setActioningId(id);
    try {
      const { error } = await supabase
        .from('notification_queue')
        .update({
          status: 'pending',
          retry_count: 0,
          next_retry_at: new Date().toISOString(),
          last_error: null
        })
        .eq('id', id);

      if (error) throw error;
      
      // Trigger background processing worker path
      fetch('/api/cron/reminders').catch(err => console.warn('Background trigger ignored:', err));
      
      alert('Notification reset to pending. Background worker triggered.');
      fetchTabData();
    } catch (err: any) {
      alert(`Failed to retry notification: ${err.message || err}`);
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'sent' || s === 'success' || s === 'mock_sent') {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (s === 'pending' || s === 'processing') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse';
    }
    if (s === 'skipped') {
      return 'bg-slate-50 text-slate-600 border-slate-200';
    }
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // Search filter implementation
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      if (activeTab === 'emails') return emails;
      if (activeTab === 'sms') return smsLogs;
      if (activeTab === 'queue') return queue;
      return failed;
    }

    if (activeTab === 'emails') {
      return emails.filter(item => 
        item.recipient.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    }
    if (activeTab === 'sms') {
      return smsLogs.filter(item => 
        item.mobile.includes(query) ||
        item.template_name.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    }
    if (activeTab === 'queue') {
      return queue.filter(item => 
        item.recipient.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    }
    return failed.filter(item => 
      item.recipient.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      (item.last_error && item.last_error.toLowerCase().includes(query))
    );
  };

  const filteredItems = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Top Tabs Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'emails', label: 'Email Logs', icon: Mail },
            { id: 'sms', label: 'SMS Logs', icon: MessageSquare },
            { id: 'queue', label: 'Queue Status', icon: Clock },
            { id: 'failed', label: 'Failed Notifications', icon: AlertTriangle },
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSearchQuery('');
                  setSelectedEmail(null);
                  setSelectedSms(null);
                  setSelectedQueue(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                  isTabActive 
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 h-4 text-slate-400" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-sm"
          />
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Panel (Left 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-[550px] shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-primary" />
              Logs Audit View
            </h3>
            <Button variant="outline" size="sm" onClick={fetchTabData} className="h-8 text-xs font-semibold gap-1.5 border-slate-200 hover:bg-slate-100">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>

          <div className="flex-1 overflow-auto max-h-[600px]">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-24 text-slate-400 flex flex-col items-center justify-center gap-2">
                <Database className="w-12 h-12 text-slate-300" />
                <p className="font-medium text-sm">No records found matching query.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50/50 border-b border-slate-150 text-slate-500 uppercase tracking-wider font-semibold sticky top-0 bg-white">
                  {activeTab === 'emails' && (
                    <tr>
                      <th className="px-4 py-3 text-left">Sent At</th>
                      <th className="px-4 py-3 text-left">Recipient</th>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  )}
                  {activeTab === 'sms' && (
                    <tr>
                      <th className="px-4 py-3 text-left">Sent At</th>
                      <th className="px-4 py-3 text-left">Recipient</th>
                      <th className="px-4 py-3 text-left">Template</th>
                      <th className="px-4 py-3 text-center">Cost (INR)</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  )}
                  {(activeTab === 'queue' || activeTab === 'failed') && (
                    <tr>
                      <th className="px-4 py-3 text-left">Created At</th>
                      <th className="px-4 py-3 text-left">Channel</th>
                      <th className="px-4 py-3 text-left">Recipient</th>
                      <th className="px-4 py-3 text-center">Attempts</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {activeTab === 'emails' && (emails as AuditEmail[]).map((email) => (
                    <tr
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedEmail?.id === email.id ? 'bg-slate-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                        {new Date(email.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 max-w-[150px] truncate">{email.recipient}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate font-semibold">{email.subject}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getStatusBadgeColor(email.status)}`}>
                          {email.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'sms' && (smsLogs as SmsLog[]).map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedSms(log)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedSms?.id === log.id ? 'bg-slate-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono">{log.mobile}</td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{log.template_name}</td>
                      <td className="px-4 py-3 text-center text-slate-500 font-semibold">
                        {(log.sms_credits_used * log.sms_rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getStatusBadgeColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {(activeTab === 'queue' || activeTab === 'failed') && (filteredItems as QueueItem[]).map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedQueue(item)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedQueue?.id === item.id ? 'bg-slate-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 uppercase font-bold text-slate-700">{item.type}</td>
                      <td className="px-4 py-3 max-w-[150px] truncate font-mono">{item.recipient}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800">{item.retry_count} / 4</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Inspection Panel (Right 1 Column) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col min-h-[550px] shadow-sm">
          {activeTab === 'emails' && selectedEmail && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 truncate text-sm">{selectedEmail.subject}</h4>
                  <div className="text-[11px] text-slate-400 space-y-0.5 mt-1 font-semibold">
                    <p>To: {selectedEmail.recipient}</p>
                    <p>Sent: {new Date(selectedEmail.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEmail(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 border rounded-lg bg-slate-50 overflow-hidden flex flex-col">
                <div className="bg-slate-100 border-b px-3 py-1.5 text-slate-500 flex items-center justify-between text-[11px]">
                  <span>Rendered HTML Output Preview</span>
                  <span className="flex items-center gap-0.5 text-green-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    HTML Sandbox
                  </span>
                </div>
                <div className="flex-1 p-4 overflow-auto bg-white">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }} className="prose prose-xs max-w-none text-slate-800 text-[11px]" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sms' && selectedSms && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">DLT Template: {selectedSms.template_name}</h4>
                  <div className="text-[11px] text-slate-400 space-y-0.5 mt-1 font-semibold">
                    <p>Recipient: {selectedSms.mobile}</p>
                    <p>Sent: {new Date(selectedSms.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSms(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-slate-700 font-medium space-y-1.5">
                  <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">SMS Auditing Metadata</p>
                  <div className="grid grid-cols-2 text-xs">
                    <span>Request ID:</span>
                    <span className="font-mono text-slate-800">{selectedSms.fast2sms_request_id || 'N/A'}</span>
                    
                    <span>Credits Used:</span>
                    <span className="font-bold text-slate-800">{selectedSms.sms_credits_used}</span>
                    
                    <span>Unit SMS Rate:</span>
                    <span className="font-bold text-slate-800">{selectedSms.sms_rate.toFixed(2)} INR</span>
                    
                    <span>Total Cost:</span>
                    <span className="font-bold text-green-700">{(selectedSms.sms_credits_used * selectedSms.sms_rate).toFixed(2)} INR</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-1.5 max-h-64 overflow-auto">
                  <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Fast2SMS Gateway Response</p>
                  <pre className="text-[10px] font-mono text-slate-700 bg-white p-2 border rounded overflow-x-auto">
                    {JSON.stringify(selectedSms.provider_response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'queue' || activeTab === 'failed') && selectedQueue && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Queue Details (Channel: {selectedQueue.type.toUpperCase()})</h4>
                  <div className="text-[11px] text-slate-400 space-y-0.5 mt-1 font-semibold">
                    <p>Recipient: {selectedQueue.recipient}</p>
                    <p>Created: {new Date(selectedQueue.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedQueue(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs space-y-1">
                    <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mb-1">Queue Parameters</p>
                    <p><strong>Status:</strong> {selectedQueue.status}</p>
                    <p><strong>Attempt Count:</strong> {selectedQueue.retry_count} / 4</p>
                    {selectedQueue.next_retry_at && (
                      <p><strong>Next Scheduled Attempt:</strong> {new Date(selectedQueue.next_retry_at).toLocaleString()}</p>
                    )}
                  </div>

                  {selectedQueue.last_error && (
                    <div className="bg-red-50 p-4 border border-red-200 rounded-lg text-xs text-red-800 space-y-1 font-medium">
                      <p className="text-red-400 uppercase tracking-wider text-[9px] font-bold">Last Attempt Error Log</p>
                      <p className="font-mono mt-1 text-[11px] break-words">{selectedQueue.last_error}</p>
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs space-y-1 max-h-40 overflow-auto">
                    <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mb-1">JSON Payload</p>
                    <pre className="text-[10px] font-mono text-slate-700 bg-white p-2 border rounded overflow-x-auto whitespace-pre-wrap break-all">
                      {selectedQueue.payload}
                    </pre>
                  </div>
                </div>

                {selectedQueue.status === 'failed' && (
                  <Button
                    onClick={() => handleRetryQueueItem(selectedQueue.id)}
                    disabled={actioningId === selectedQueue.id}
                    className="w-full bg-primary flex items-center justify-center gap-2 h-10 text-xs font-semibold text-white shadow-sm mt-4 hover:bg-primary/95"
                  >
                    {actioningId === selectedQueue.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Manually Reset & Retry Notification
                  </Button>
                )}
              </div>
            </div>
          )}

          {!selectedEmail && !selectedSms && !selectedQueue && (
            <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-400 gap-3 py-20">
              <Eye className="w-12 h-12 text-slate-300 animate-bounce" />
              <div>
                <p className="font-bold text-slate-600 text-sm">Auditing Inspector</p>
                <p className="text-xs max-w-xs mt-1 text-slate-400 font-semibold leading-relaxed">
                  Select a record row in the audit logs to view transaction metadata, provider variables, cost metrics, HTML layouts, and error traces.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
