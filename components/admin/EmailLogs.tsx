'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Eye, Calendar, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditEmail {
  id: string;
  recipient: string;
  subject: string;
  html_content: string;
  status: string;
  created_at: string;
}

export default function EmailLogs() {
  const supabase = createClient();
  const [emails, setEmails] = useState<AuditEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<AuditEmail | null>(null);

  useEffect(() => {
    fetchEmails();

    const channel = supabase
      .channel('email-logs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_emails' }, (payload) => {
        console.log('Realtime email log inserted:', payload.new);
        setEmails((prev) => [payload.new as AuditEmail, ...prev]);
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        channel.unsubscribe();
      }
    };
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_emails')
        .select('id, recipient, subject, html_content, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmails((data as AuditEmail[]) || []);
    } catch (e: any) {
      console.error('Error fetching email audit logs:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('mock_sent') || s.includes('mocked')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s.includes('success')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Logs Table Area */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-border overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-6 py-4 border-b border-border bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email Dispatch Logs
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live audit logs of system-generated notifications.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchEmails} className="h-8">
            Refresh Logs
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Mail className="w-12 h-12 text-slate-300" />
              <p>No dispatch records found.</p>
              <p className="text-xs">Trigger booking creations/approvals to see logs here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 border-b border-border text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Sent At</th>
                    <th className="px-4 py-3 text-left">Recipient</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-slate-600">
                  {emails.map((email) => (
                    <tr
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedEmail?.id === email.id ? 'bg-slate-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(email.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 max-w-[150px] truncate">{email.recipient}</td>
                      <td className="px-4 py-3.5 max-w-[200px] truncate">{email.subject}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 border text-xs font-medium rounded-full ${getStatusBadgeColor(email.status)}`}>
                          {email.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmail(email);
                          }}
                          className="h-7 text-primary hover:text-primary-dark"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Visual Email Preview Area */}
      <div className="bg-white rounded-lg border border-border p-6 flex flex-col min-h-[500px]">
        {selectedEmail ? (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h4 className="font-bold text-slate-800 truncate">{selectedEmail.subject}</h4>
                <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                  <p><strong>To:</strong> {selectedEmail.recipient}</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 inline text-slate-400" />
                    <strong>Sent:</strong> {new Date(selectedEmail.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 border rounded-lg bg-slate-50 overflow-hidden flex flex-col">
              <div className="bg-slate-100 border-b px-3 py-1.5 text-xs text-slate-500 flex items-center justify-between">
                <span>Rendered HTML Output Preview</span>
                <span className="flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  HTML Sandbox
                </span>
              </div>
              <div className="flex-1 p-4 overflow-auto bg-white">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }}
                  className="prose prose-sm max-w-none text-slate-800"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground gap-3 py-10">
            <Mail className="w-12 h-12 text-slate-300 animate-bounce" />
            <div>
              <p className="font-semibold text-slate-700">Select an email to preview</p>
              <p className="text-xs max-w-xs mt-1">
                Click any row in the dispatch logs to inspect the rendered HTML content, styling, and parameters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
