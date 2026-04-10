"use client";

import { useState, useEffect } from "react";
import { vendorApi, Vendor, VendorFormData } from "@/lib/api/rental";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, Loader2, RefreshCw, Edit2, X, Save, Search, Power } from "lucide-react";
import { toast } from "sonner";

type FieldErrors = { [key: string]: string };

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<VendorFormData>({
    name: "", contactPerson: "", phone: "", email: "", address: "",
  });

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getAllIncludingInactive();
      setVendors(res.data);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const resetForm = () => {
    setForm({ name: "", contactPerson: "", phone: "", email: "", address: "" });
    setShowForm(false);
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (v: Vendor) => {
    setForm({ name: v.name, contactPerson: v.contactPerson, phone: v.phone, email: v.email, address: v.address });
    setEditingId(v.id);
    setShowForm(true);
    setErrors({});
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await vendorApi.toggleStatus(id);
      toast.success(res.message);
      fetchVendors();
    } catch {
      toast.error("Failed to update vendor status");
    }
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.name.trim()) errs.name = "Vendor name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      errs.email = "Enter a valid email (e.g. vendor@email.com)";
    if (form.phone && !/^\d{10,15}$/.test(form.phone.replace(/[\s-]/g, "")))
      errs.phone = "Phone must be 10–15 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await vendorApi.update(editingId, form);
        toast.success("Vendor updated");
      } else {
        await vendorApi.create(form);
        toast.success("Vendor added");
      }
      resetForm();
      fetchVendors();
    } catch {
      toast.error("Failed to save vendor");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return v.name.toLowerCase().includes(q) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q));
  });

  const fieldClass = (field: string) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Management</h1>
            <p className="text-slate-500 mt-1">Manage external rental vendors</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchVendors} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
              onClick={() => { resetForm(); setShowForm(!showForm); }}
            >
              {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> Add Vendor</>}
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <CardHeader className="bg-blue-950 py-4 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-white text-base">
                <div className="h-8 w-8 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                  <Building2 className="h-4 w-4" />
                </div>
                {editingId ? "Edit Vendor" : "Add New Vendor"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Vendor Name *</label>
                    <Input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                      placeholder="City Rentals" className={fieldClass("name")} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Contact Person</label>
                    <Input value={form.contactPerson || ""} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                      placeholder="John Doe" className="text-slate-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone</label>
                    <Input value={form.phone || ""} onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }}
                      placeholder="0771234567" className={fieldClass("phone")} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                    <Input value={form.email || ""} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                      placeholder="vendor@email.com" className={fieldClass("email")} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Address</label>
                  <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Main St, Colombo" className="text-slate-900" />
                </div>
                <div className="flex gap-3 pt-3 border-t border-slate-200">
                  <Button type="submit" className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200" disabled={submitting}>
                    <Save className="mr-2 h-4 w-4" /> {submitting ? "Saving..." : (editingId ? "Update Vendor" : "Add Vendor")}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0 text-slate-900" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading && vendors.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading vendors...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No vendors found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Vendor</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Contact Person</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Phone</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => (
                  <tr key={v.id} className={`hover:bg-slate-50 transition-colors ${!v.active ? "opacity-50" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{v.name}</div>
                          {v.address && <div className="text-slate-400 text-xs">{v.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{v.contactPerson || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{v.phone || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{v.email || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        v.active ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                          : "bg-red-100 text-red-700 ring-1 ring-red-300"
                      }`}>{v.active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEdit(v)}>
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm"
                          className={v.active ? "text-red-500 hover:text-red-700" : "text-emerald-500 hover:text-emerald-700"}
                          onClick={() => handleToggleStatus(v.id)}>
                          <Power className="h-3.5 w-3.5 mr-1" /> {v.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
