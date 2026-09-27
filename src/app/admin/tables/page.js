"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, QrCode, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassModal from "@/components/ui/GlassModal";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTable, setNewTable] = useState("");
  const [qrModal, setQrModal] = useState(null);
  const [error, setError] = useState("");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => { fetch("/api/tables").then((r) => r.json()).then((d) => { setTables(d.tables || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const handleAdd = async () => {
    if (!newTable.trim()) return; setError("");
    try {
      const res = await fetch("/api/tables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tableNumber: newTable.trim() }) });
      const data = await res.json();
      if (res.ok) { setTables((prev) => [...prev, data.table]); setNewTable(""); setShowAdd(false); } else { setError(data.error); }
    } catch { setError("Failed to add table"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this table?")) return;
    try { const res = await fetch(`/api/tables?id=${id}`, { method: "DELETE" }); if (res.ok) setTables((prev) => prev.filter((t) => t.id !== id)); } catch {}
  };

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const printQR = (table) => {
    const printWindow = window.open("", "_blank");
    const url = `${appUrl}/table/${table.id}`;
    const safeTableNumber = escapeHtml(table.tableNumber);
    const safeUrl = escapeHtml(url);
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${safeTableNumber} QR Code</title><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;margin:0}.container{text-align:center;padding:40px}h1{font-size:24px;margin-bottom:10px}p{color:#666;margin-bottom:20px}@media print{body{-webkit-print-color-adjust:exact}}</style></head><body><div class="container"><h1>${safeTableNumber}</h1><p>Scan to order</p><div id="qr"></div><p style="margin-top:20px;font-size:12px;color:#999">${safeUrl}</p></div><script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"><\/script><script>QRCode.toCanvas(document.createElement('canvas'),${JSON.stringify(url)},{width:300},function(err,canvas){if(!err){document.getElementById('qr').appendChild(canvas);setTimeout(function(){window.print()},500)}});<\/script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tables & QR Codes</h1>
        <GlassButton color="green" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Table</GlassButton>
      </div>
      {showAdd && (
        <GlassCard color="green" className="mb-4" padding="p-4">
          <div className="flex gap-3 items-end">
            <GlassInput label="Table Name" name="newTable" value={newTable} onChange={(e) => setNewTable(e.target.value)} placeholder="e.g., Table 11" color="green" className="flex-1" />
            <GlassButton color="green" onClick={handleAdd}>Add</GlassButton>
            <GlassButton variant="secondary" onClick={() => setShowAdd(false)}>Cancel</GlassButton>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </GlassCard>
      )}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <GlassCard key={table.id} color="green" padding="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900 font-bold">{table.tableNumber}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border backdrop-blur-sm ${table.active ? "bg-green-50/80 text-green-600 border-green-200/80" : "bg-red-50/80 text-red-600 border-red-200/80"}`}>
                  {table.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 mb-3 flex items-center justify-center">
                <QRCodeSVG value={`${appUrl}/table/${table.id}`} size={120} level="M" />
              </div>
              <p className="text-gray-400 text-xs text-center mb-3 truncate">{appUrl}/table/{table.id}</p>
              <div className="flex gap-2">
                <GlassButton variant="secondary" onClick={() => setQrModal(table)} className="flex-1 text-xs px-2 py-1.5"><QrCode className="h-3 w-3" /> View</GlassButton>
                <GlassButton variant="secondary" onClick={() => printQR(table)} className="flex-1 text-xs px-2 py-1.5"><Printer className="h-3 w-3" /> Print</GlassButton>
                <button onClick={() => handleDelete(table.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
      <GlassModal isOpen={!!qrModal} onClose={() => setQrModal(null)} title={qrModal?.tableNumber} color="green" size="sm">
        {qrModal && (
          <div className="text-center py-4">
            <div className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl p-6 inline-block mb-4 shadow-sm">
              <QRCodeSVG value={`${appUrl}/table/${qrModal.id}`} size={200} level="H" />
            </div>
            <p className="text-gray-500 text-sm break-all">{appUrl}/table/{qrModal.id}</p>
            <GlassButton onClick={() => printQR(qrModal)} color="green" className="mt-4" fullWidth><Printer className="h-4 w-4" /> Print QR Code</GlassButton>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
