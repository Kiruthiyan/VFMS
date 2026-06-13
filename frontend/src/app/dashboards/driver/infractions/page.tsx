'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, AlertTriangle, Loader2, X, Save } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getMyInfractions, submitMyInfraction, type InfractionItem, type InfractionPayload } from '@/lib/api/driver-portal';

const INFRACTION_TYPES = ['TRAFFIC_VIOLATION','MINOR_ACCIDENT','MAJOR_ACCIDENT','NEAR_MISS','RECKLESS_DRIVING','OTHER'];
const SEVERITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg:'hsl(145 63% 94%)', text:'hsl(145 63% 25%)', border:'hsl(145 63% 70%)' },
  MEDIUM: { bg:'hsl(42 97% 92%)', text:'hsl(28 88% 28%)', border:'hsl(36 95% 64%)' },
  HIGH: { bg:'hsl(20 90% 94%)', text:'hsl(20 90% 28%)', border:'hsl(20 90% 70%)' },
  CRITICAL: { bg:'hsl(360 79% 95%)', text:'hsl(360 79% 30%)', border:'hsl(360 79% 75%)' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg:'hsl(42 97% 92%)', text:'hsl(28 88% 28%)' },
  UNDER_REVIEW: { bg:'hsl(220 90% 95%)', text:'hsl(220 90% 35%)' },
  RESOLVED: { bg:'hsl(145 63% 94%)', text:'hsl(145 63% 25%)' },
};

const EMPTY_FORM: InfractionPayload = { infractionType: 'OTHER', severity: 'LOW', incidentDate: '', description: '' };

export default function DriverInfractionsPage() {
  const [items, setItems] = useState<InfractionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InfractionPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); getMyInfractions().then(setItems).catch((e) => toast.error(e?.response?.data?.message ?? 'Failed to load')).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await submitMyInfraction(form); toast.success('Infraction reported'); setShowForm(false); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Failed to submit'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardShell title="My Infractions" description="View your infraction history and submit reports">
      <div style={{ maxWidth: '56rem' }}>
        <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:'1rem' }}>
          <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }} style={{ display:'flex',alignItems:'center',gap:'0.375rem',padding:'0.5rem 1rem',borderRadius:'0.5rem',border:'none',background:'hsl(42 100% 50%)',color:'#000',fontWeight:600,fontSize:'0.8125rem',cursor:'pointer' }}>
            <Plus style={{width:'0.875rem',height:'0.875rem'}}/> Report Infraction
          </button>
        </div>

        {showForm && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div style={{ background:'#fff',color:'#000',borderRadius:'1rem',border:'1px solid #e5e7eb',padding:'1.5rem',width:'28rem',maxWidth:'90vw',maxHeight:'90vh',overflowY:'auto' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
                <h2 style={{ fontSize:'0.9375rem',fontWeight:700,margin:0 }}>Report Infraction</h2>
                <button onClick={() => setShowForm(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'hsl(var(--muted-foreground))' }}><X style={{width:'1rem',height:'1rem'}}/></button>
              </div>
              <form onSubmit={handleSubmit}>
                {[{ label:'Type', key:'infractionType', options:INFRACTION_TYPES },{ label:'Severity', key:'severity', options:SEVERITIES }].map(({ label, key, options }) => (
                  <div key={key} style={{ marginBottom:'0.875rem' }}>
                    <label style={{ display:'block',fontSize:'0.75rem',fontWeight:600,color:'hsl(var(--muted-foreground))',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>{label}</label>
                    <select value={(form as any)[key]} onChange={(e) => setForm((f) => ({...f,[key]:e.target.value}))}
                      style={{ width:'100%',padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem',boxSizing:'border-box' }}>
                      {options.map((o) => <option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ marginBottom:'0.875rem' }}>
                  <label style={{ display:'block',fontSize:'0.75rem',fontWeight:600,color:'hsl(var(--muted-foreground))',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>Incident Date</label>
                  <input type="date" required value={form.incidentDate} onChange={(e) => setForm((f) => ({...f,incidentDate:e.target.value}))}
                    style={{ width:'100%',padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem',boxSizing:'border-box' }}/>
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={{ display:'block',fontSize:'0.75rem',fontWeight:600,color:'hsl(var(--muted-foreground))',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>Description</label>
                  <textarea value={form.description ?? ''} onChange={(e) => setForm((f) => ({...f,description:e.target.value}))} rows={3}
                    style={{ width:'100%',padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem',boxSizing:'border-box',resize:'vertical' }}/>
                </div>
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
              <AlertTriangle style={{width:'2rem',height:'2rem',margin:'0 auto 0.75rem',opacity:0.4}}/><p style={{margin:0}}>No infractions recorded.</p>
            </div>
          ) : (
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'hsl(var(--muted)/0.4)' }}>
                {['Type','Severity','Incident Date','Status','Description'].map((h) => (
                  <th key={h} style={{ padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.7rem',fontWeight:600,color:'hsl(var(--muted-foreground))',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {items.map((item) => {
                  const sc = SEVERITY_COLORS[item.severity] ?? SEVERITY_COLORS.LOW;
                  const stc = STATUS_COLORS[item.resolutionStatus] ?? STATUS_COLORS.OPEN;
                  return (
                    <tr key={item.id} style={{ borderTop:'1px solid hsl(var(--border))' }}>
                      <td style={{ padding:'0.875rem 1rem',fontSize:'0.8rem',fontWeight:500 }}>{(item.infractionType||'').replace(/_/g,' ')}</td>
                      <td style={{ padding:'0.875rem 1rem' }}>
                        <span style={{ padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.7rem',fontWeight:600,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}` }}>{item.severity}</span>
                      </td>
                      <td style={{ padding:'0.875rem 1rem',fontSize:'0.8rem',color:'hsl(var(--muted-foreground))' }}>{item.incidentDate}</td>
                      <td style={{ padding:'0.875rem 1rem' }}>
                        <span style={{ padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.7rem',fontWeight:600,background:stc.bg,color:stc.text }}>{(item.resolutionStatus||'').replace(/_/g,' ')}</span>
                      </td>
                      <td style={{ padding:'0.875rem 1rem',fontSize:'0.8rem',color:'hsl(var(--muted-foreground))',maxWidth:'16rem' }}>{item.description || '—'}</td>
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
