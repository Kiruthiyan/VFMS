'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, CalendarDays, Loader2, X, Save, Trash2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getErrorMessage } from '@/lib/api';
import { getMyLeaveRequests, submitLeaveRequest, deleteLeaveRequest, type LeaveRequestItem, type LeaveRequestPayload } from '@/lib/api/driver-portal';

const LEAVE_TYPES = ['ANNUAL','MEDICAL','EMERGENCY','UNPAID'];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg:'hsl(42 97% 92%)', text:'hsl(28 88% 28%)', border:'hsl(36 95% 64%)' },
  APPROVED: { bg:'hsl(145 63% 94%)', text:'hsl(145 63% 25%)', border:'hsl(145 63% 70%)' },
  REJECTED: { bg:'hsl(360 79% 95%)', text:'hsl(360 79% 30%)', border:'hsl(360 79% 75%)' },
};

const EMPTY_FORM: LeaveRequestPayload = { leaveType:'ANNUAL', startDate:'', endDate:'', reason:'' };

export default function DriverLeaveRequestsPage() {
  const [items, setItems] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LeaveRequestPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState('');

  const load = () => { setLoading(true); getMyLeaveRequests().then(setItems).catch((e) => toast.error(getErrorMessage(e))).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setRequestError('');
    try { await submitLeaveRequest(form); toast.success('Leave request submitted'); setShowForm(false); load(); }
    catch (err: any) { 
      const msg = getErrorMessage(err);
      setRequestError(msg);
      toast.error(msg); 
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;
    try {
      await deleteLeaveRequest(id);
      toast.success('Leave request deleted');
      load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardShell title="Leave Requests" description="Request and track your leave applications">
      <div style={{ maxWidth:'56rem' }}>
        <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:'1rem' }}>
          <button onClick={() => { setForm(EMPTY_FORM); setRequestError(''); setShowForm(true); }} style={{ display:'flex',alignItems:'center',gap:'0.375rem',padding:'0.5rem 1rem',borderRadius:'0.5rem',border:'none',background:'hsl(42 100% 50%)',color:'#000',fontWeight:600,fontSize:'0.8125rem',cursor:'pointer' }}>
            <Plus style={{width:'0.875rem',height:'0.875rem'}}/> Request Leave
          </button>
        </div>

        {showForm && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div style={{ background:'#fff',color:'#000',borderRadius:'1rem',border:'1px solid #e5e7eb',padding:'1.5rem',width:'28rem',maxWidth:'90vw' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
                <h2 style={{ fontSize:'0.9375rem',fontWeight:700,margin:0 }}>Request Leave</h2>
                <button onClick={() => setShowForm(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'hsl(var(--muted-foreground))' }}><X style={{width:'1rem',height:'1rem'}}/></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom:'0.875rem' }}>
                  <label style={{ display:'block',fontSize:'0.75rem',fontWeight:600,color:'hsl(var(--muted-foreground))',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>Leave Type</label>
                  <select value={form.leaveType} onChange={(e) => setForm((f) => ({...f,leaveType:e.target.value}))}
                    style={{ width:'100%',padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem',boxSizing:'border-box' }}>
                    {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                {[{ label:'Start Date', key:'startDate' },{ label:'End Date', key:'endDate' }].map(({ label, key }) => (
                  <div key={key} style={{ marginBottom:'0.875rem' }}>
                    <label style={{ display:'block',fontSize:'0.75rem',fontWeight:600,color:'hsl(var(--muted-foreground))',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>{label}</label>
                    <input type="date" required value={(form as any)[key]} onChange={(e) => setForm((f) => ({...f,[key]:e.target.value}))}
                      style={{ width:'100%',padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem',boxSizing:'border-box' }}/>
                  </div>
                ))}
                <div style={{ marginBottom:'1rem' }}>
                  <label style={{ display:'block',fontSize:'0.75rem',fontWeight:600,color:'hsl(var(--muted-foreground))',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>Reason</label>
                  <textarea value={form.reason ?? ''} onChange={(e) => setForm((f) => ({...f,reason:e.target.value}))} rows={3}
                    style={{ width:'100%',padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem',boxSizing:'border-box',resize:'vertical' }}/>
                </div>
                {requestError && (
                  <div style={{ marginBottom:'1rem', padding:'0.75rem', borderRadius:'0.5rem', background:'hsl(360 79% 95%)', color:'hsl(360 79% 30%)', border:'1px solid hsl(360 79% 75%)', fontSize:'0.875rem', fontWeight:500 }}>
                    {requestError}
                  </div>
                )}
                <div style={{ display:'flex',gap:'0.5rem',justifyContent:'flex-end' }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding:'0.5rem 1rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'transparent',color:'hsl(var(--foreground))',cursor:'pointer' }}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ display:'flex',alignItems:'center',gap:'0.375rem',padding:'0.5rem 1rem',borderRadius:'0.5rem',border:'none',background:'hsl(42 100% 50%)',color:'#000',fontWeight:600,cursor:'pointer' }}>
                    {saving ? <Loader2 style={{width:'0.875rem',height:'0.875rem',animation:'spin 1s linear infinite'}}/> : <Save style={{width:'0.875rem',height:'0.875rem'}}/>} Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ borderRadius:'1rem',border:'1px solid hsl(var(--border))',background:'hsl(var(--card))',overflow:'hidden' }}>
          {loading ? (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'4rem',color:'hsl(var(--muted-foreground))' }}>
              <Loader2 style={{width:'1.5rem',height:'1.5rem',animation:'spin 1s linear infinite'}}/>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign:'center',padding:'4rem',color:'hsl(var(--muted-foreground))' }}>
              <CalendarDays style={{width:'2rem',height:'2rem',margin:'0 auto 0.75rem',opacity:0.4}}/><p style={{margin:0}}>No leave requests yet.</p>
            </div>
          ) : (
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'hsl(var(--muted)/0.4)' }}>
                {['Type','Start Date','End Date','Status','Reason','Notes','Actions'].map((h) => (
                  <th key={h} style={{ padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.7rem',fontWeight:600,color:'hsl(var(--muted-foreground))',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {items.map((item) => {
                  const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.PENDING;
                  return (
                    <tr key={item.id} style={{ borderTop:'1px solid hsl(var(--border))' }}>
                      <td style={{ padding:'0.875rem 1rem',fontSize:'0.8rem',fontWeight:500 }}>{(item.leaveType||'').replace(/_/g,' ')}</td>
                      <td style={{ padding:'0.875rem 1rem',fontSize:'0.8rem',color:'hsl(var(--muted-foreground))' }}>{item.startDate}</td>
                      <td style={{ padding:'0.875rem 1rem',fontSize:'0.8rem',color:'hsl(var(--muted-foreground))' }}>{item.endDate}</td>
                      <td style={{ padding:'0.875rem 1rem' }}>
                        <span style={{ padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.7rem',fontWeight:600,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}` }}>{item.status}</span>
                      </td>
                      <td style={{ padding:'0.875rem 1rem',fontSize:'0.8rem',color:'hsl(var(--muted-foreground))' }}>{item.reason || '—'}</td>
                      <td style={{ padding:'0.875rem 1rem',fontSize:'0.8rem',color:'hsl(var(--muted-foreground))' }}>{item.approvalNotes || '—'}</td>
                      <td style={{ padding:'0.875rem 1rem' }}>
                        {item.status === 'PENDING' && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem',
                              borderRadius: '0.375rem', border: 'none', background: 'hsl(360 79% 95%)',
                              color: 'hsl(360 79% 30%)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            <Trash2 style={{ width: '0.8rem', height: '0.8rem' }} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardShell>
  );
}
