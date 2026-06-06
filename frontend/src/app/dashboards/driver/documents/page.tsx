'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, Trash2, Download } from 'lucide-react';
import { DriverPortalShell } from '@/components/driver-portal/DriverPortalShell';
import { getMyDocuments, uploadMyDocument, deleteMyDocument, type DocumentItem } from '@/lib/api/driver-portal';
import { resolveBackendAssetUrl } from '@/lib/api';

const ENTITY_TYPES = ['NIC', 'LICENSE', 'CERTIFICATION', 'MEDICAL', 'PROFILE', 'OTHER'];
const TYPE_LABELS: Record<string, string> = {
  NIC: 'NIC Copy', LICENSE: 'License Copy', CERTIFICATION: 'Training Certificate',
  MEDICAL: 'Medical Certificate', PROFILE: 'Profile Picture', OTHER: 'Other',
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(1)} MB`;
}

export default function DriverDocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('OTHER');
  const [deleting, setDeleting] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    getMyDocuments().then(setDocs).catch((e) => toast.error(e?.response?.data?.message ?? 'Failed to load documents')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { await uploadMyDocument(file, selectedType); toast.success('Document uploaded'); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Upload failed'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    setDeleting(id);
    try { await deleteMyDocument(id); toast.success('Document deleted'); setDocs((d) => d.filter((x) => x.id !== id)); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Delete failed'); }
    finally { setDeleting(null); }
  };

  return (
    <DriverPortalShell title="My Documents" subtitle="Upload and manage your personal documents">
      <div style={{ maxWidth: '56rem' }}>
        {/* Upload bar */}
        <div style={{ borderRadius:'1rem',border:'1px solid hsl(var(--border))',background:'hsl(var(--card))',padding:'1.25rem',marginBottom:'1.25rem' }}>
          <h3 style={{ fontSize:'0.875rem',fontWeight:600,margin:'0 0 0.875rem' }}>Upload New Document</h3>
          <div style={{ display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap' }}>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem' }}>
              {ENTITY_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              style={{ display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 1rem',borderRadius:'0.5rem',border:'none',background:'hsl(42 100% 50%)',color:'#000',fontWeight:600,fontSize:'0.8125rem',cursor:'pointer' }}>
              {uploading ? <Loader2 style={{width:'0.875rem',height:'0.875rem',animation:'spin 1s linear infinite'}}/> : <Upload style={{width:'0.875rem',height:'0.875rem'}}/>}
              {uploading ? 'Uploading…' : 'Choose File'}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display:'none' }} onChange={handleUpload} />
            <span style={{ fontSize:'0.75rem',color:'hsl(var(--muted-foreground))' }}>PDF, JPG, PNG accepted</span>
          </div>
        </div>

        {/* Documents grid */}
        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'4rem',color:'hsl(var(--muted-foreground))' }}>
            <Loader2 style={{width:'1.5rem',height:'1.5rem',animation:'spin 1s linear infinite'}}/>
          </div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign:'center',padding:'4rem',color:'hsl(var(--muted-foreground))',border:'1px solid hsl(var(--border))',borderRadius:'1rem',background:'hsl(var(--card))' }}>
            <FileText style={{width:'2rem',height:'2rem',margin:'0 auto 0.75rem',opacity:0.4}}/><p style={{margin:0}}>No documents uploaded yet.</p>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(16rem,1fr))',gap:'0.875rem' }}>
            {docs.map((doc) => (
              <div key={doc.id} style={{ borderRadius:'0.875rem',border:'1px solid hsl(var(--border))',background:'hsl(var(--card))',padding:'1rem',display:'flex',flexDirection:'column',gap:'0.5rem' }}>
                <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'0.5rem' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'0.5rem' }}>
                    <span style={{ width:'2rem',height:'2rem',borderRadius:'0.5rem',background:'hsl(var(--muted))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      <FileText style={{width:'1rem',height:'1rem',color:'hsl(var(--muted-foreground))'}}/>
                    </span>
                    <div>
                      <p style={{ fontSize:'0.8rem',fontWeight:600,margin:0,wordBreak:'break-all' }}>{doc.fileName}</p>
                      <p style={{ fontSize:'0.7rem',color:'hsl(var(--muted-foreground))',margin:'0.125rem 0 0' }}>
                        {TYPE_LABELS[doc.entityType] ?? doc.entityType} · {formatBytes(doc.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex',gap:'0.375rem',marginTop:'0.25rem' }}>
                  <a href={resolveBackendAssetUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer"
                    style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.375rem',padding:'0.375rem 0.5rem',borderRadius:'0.375rem',border:'1px solid hsl(var(--border))',textDecoration:'none',color:'hsl(var(--foreground))',fontSize:'0.75rem',fontWeight:500 }}>
                    <Download style={{width:'0.75rem',height:'0.75rem'}}/> View
                  </a>
                  <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}
                    style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'0.25rem',padding:'0.375rem 0.5rem',borderRadius:'0.375rem',border:'1px solid hsl(360 79% 75%)',background:'transparent',cursor:'pointer',color:'hsl(360 79% 40%)' }}>
                    {deleting === doc.id ? <Loader2 style={{width:'0.75rem',height:'0.75rem',animation:'spin 1s linear infinite'}}/> : <Trash2 style={{width:'0.75rem',height:'0.75rem'}}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DriverPortalShell>
  );
}
