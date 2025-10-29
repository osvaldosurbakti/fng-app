"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sale } from "@/types/sales";

export default function DashboardPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      setLoading(true);
      const res = await fetch("/api/sales");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memuat penjualan");
      }
      // Pastikan data adalah array
      setSales(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error("Error fetching sales:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }

  // Statistik sederhana
  const todayKey = new Date().toISOString().slice(0, 10);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const pendingPayments = sales.filter(s => {
    const status = s.payment?.status || s.payment_status || (s.payment_status as any);
    return status !== "PAID" && status !== "paid";
  }).length;
  const totalSalesToday = sales.filter(s => {
    const date = (s.sale_date || s.createdAt || "").toString();
    return date.startsWith(todayKey);
  }).length;

  const recentSales = [...sales]
    .sort((a, b) => (new Date(b.createdAt || 0).valueOf()) - (new Date(a.createdAt || 0).valueOf()))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3 max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchSales}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Ringkasan aktivitas penjualan</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/sales/create")}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            + Input Penjualan Baru
          </button>
          <Link href="/dashboard/sales" className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
            Lihat Semua Penjualan
          </Link>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Transaksi Hari Ini</div>
          <div className="mt-2 text-2xl font-semibold">{totalSalesToday}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="mt-2 text-2xl font-semibold">Rp {totalRevenue.toLocaleString('id-ID')}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Pembayaran Pending</div>
          <div className="mt-2 text-2xl font-semibold text-yellow-600">{pendingPayments}</div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Transaksi Terbaru</h2>
          <Link href="/dashboard/sales" className="text-sm text-blue-600">Lihat Semua</Link>
        </div>

        {recentSales.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Belum ada transaksi</div>
        ) : (
          <div className="divide-y">
            {recentSales.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{s.invoice_number || `INV-${(s._id || '').slice(-6)}`}</div>
                  <div className="text-sm text-gray-500">
                    {s.customer || "Tanpa Nama"} · {s.items?.length || 0} item
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">Rp {(s.totalAmount || 0).toLocaleString('id-ID')}</div>
                  <div className="text-xs text-gray-500">{new Date(s.createdAt || s.sale_date || 0).toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick tips / actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Aksi Cepat</h3>
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push("/dashboard/sales/create")} className="text-left px-3 py-2 border rounded hover:bg-gray-50">+ Input Penjualan</button>
            <button onClick={() => router.push("/dashboard/sales")} className="text-left px-3 py-2 border rounded hover:bg-gray-50">Daftar Penjualan</button>
            <button onClick={() => fetchSales()} className="text-left px-3 py-2 border rounded hover:bg-gray-50">Refresh Data</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm col-span-2">
          <h3 className="font-semibold mb-2">Catatan</h3>
          <p className="text-sm text-gray-600">Gunakan tombol "Input Penjualan" untuk membuat transaksi cepat. Anda dapat menandai transaksi sebagai lunas pada daftar penjualan.</p>
        </div>
      </div>
    </div>
  );
}