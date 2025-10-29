"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Sale } from "@/types/sales";
import { Payment, PaymentStatus } from "@/types/sales";

// Import komponen
import SalesTable from "@/components/sales/SalesTable";
import SalesFilters from "@/components/sales/SalesFilters";
import SalesSummary from "@/components/sales/SalesSummary";
import Pagination from "@/components/sales/Pagination";
import SaleDetailModal from "@/components/sales/SaleDetailModal";
import DeleteConfirmationModal from "@/components/sales/DeleteConfirmationModal";
import EditSaleForm from "@/components/sales/EditSaleForm";

// Constants
const ITEMS_PER_PAGE = 10;

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State untuk filtering dan pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State untuk modals
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Fetch data dari API
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sales');
      const result = await response.json();
      
      if (result.success) {
        const validatedSales = result.data.map((sale: any) => ({
          _id: sale._id || sale.id,
          customer: sale.customer || sale.customer_name || "Tanpa Nama",
          customer_name: sale.customer_name || sale.customer || "Tanpa Nama",
          customer_phone: sale.customer_phone || "",
          customer_notes: sale.customer_notes || "",
          notes: sale.notes || "",
          items: sale.items || (sale.product ? [{
            product: sale.product,
            menu: sale.product, // Untuk kompatibilitas
            quantity: sale.quantity || 1,
            price: sale.price || 0,
            category: sale.category || "",
            temperature: sale.temperature || "",
            notes: sale.notes || "",
            itemTotal: sale.totalAmount || (sale.price || 0) * (sale.quantity || 1)
          }] : []),
          totalAmount: sale.totalAmount || sale.total || (sale.price || 0) * (sale.quantity || 0),
          total: sale.total || sale.totalAmount || (sale.price || 0) * (sale.quantity || 0),
          itemCount: sale.itemCount || (sale.items ? sale.items.length : 1),
          invoice_number: sale.invoice_number || `INV-${(sale._id || sale.id)?.slice(-6).toUpperCase()}`,
          payment_status: sale.payment_status || 'paid',
          payment_method: sale.payment_method || 'cash',
          sale_date: sale.sale_date || sale.createdAt,
          cashier: sale.cashier || 'System',
          createdAt: sale.createdAt,
          updatedAt: sale.updatedAt,
          payment: {
            method: sale.payment?.method || 'CASH',
            status: sale.payment?.status || 'UNPAID',
            amountPaid: sale.payment?.amountPaid || 0,
            remainingAmount: sale.payment?.remainingAmount || sale.totalAmount || 0,
            proofImage: sale.payment?.proofImage || null,
            receiptNumber: sale.payment?.receiptNumber || `RCP-${(sale._id || sale.id)?.slice(-6)}`,
            updatedAt: sale.payment?.updatedAt || sale.updatedAt
          }
        }));
        
        setSales(validatedSales);
      } else {
        setError(result.message || "Gagal memuat data penjualan");
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sale.payment_status === statusFilter;
    
    const matchesDate = !dateFilter || 
      (sale.sale_date && sale.sale_date.startsWith(dateFilter)) ||
      (sale.createdAt && sale.createdAt.startsWith(dateFilter));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Refresh data
  const handleRefresh = () => {
    fetchSales();
    setCurrentPage(1);
  };

  // Handlers untuk modals
  const handleViewDetail = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setShowEditModal(true);
  };

  const handleDelete = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedSale) {
      try {
        // PERBAIKAN: Gunakan route [id] bukan query parameter
        const response = await fetch(`/api/sales/${selectedSale._id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Refresh data setelah delete
          fetchSales();
          setShowDeleteModal(false);
          setSelectedSale(null);
          alert('Penjualan berhasil dihapus!');
        } else {
          throw new Error(result.message || 'Gagal menghapus penjualan');
        }
      } catch (error: any) {
        console.error('Error deleting sale:', error);
        alert(error.message || 'Terjadi kesalahan saat menghapus penjualan');
      }
    }
  };

  const handleSaveEdit = async (updatedSale: Sale) => {
    try {
      // PERBAIKAN: Implement update API call dengan PUT method
      const response = await fetch(`/api/sales/${updatedSale._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSale),
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchSales();
        setShowEditModal(false);
        setSelectedSale(null);
        alert('Penjualan berhasil diupdate!');
      } else {
        throw new Error(result.message || 'Gagal mengupdate penjualan');
      }
    } catch (error: any) {
      console.error('Error updating sale:', error);
      alert(error.message || 'Terjadi kesalahan saat mengupdate penjualan');
    }
  };

  // Mark selected sale as paid (update payment)
  const handleMarkAsPaid = async (sale: Sale | null) => {
    if (!sale) return;
    // already paid?
    const currentStatus = sale.payment?.status || sale.payment_status || '';
    if (currentStatus === 'PAID' || currentStatus === 'paid') {
      alert('Pembayaran sudah lunas.');
      return;
    }

    if (!confirm(`Tandai invoice ${sale.invoice_number} sebagai LUNAS?`)) return;

    try {
      setUpdatingPayment(true);
      const updatedPayment: Payment = {
        method: (sale.payment?.method || sale.payment_method || 'CASH') as any,
        status: 'PAID' as PaymentStatus,
        amountPaid: sale.totalAmount || 0,
        remainingAmount: 0,
        proofImage: sale.payment?.proofImage,
        receiptNumber: sale.payment?.receiptNumber || `RCP-${(sale._id || '').toString().slice(-6)}`,
        updatedAt: new Date().toISOString()
      };

      const payload: any = {
        payment: updatedPayment,
        payment_status: 'PAID'
      };

      const res = await fetch(`/api/sales/${sale._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal memperbarui pembayaran');
      }

      // refresh data & selectedSale
      await fetchSales();
      setSelectedSale(prev => prev ? ({ ...prev, payment: updatedPayment, payment_status: 'PAID' } as Sale) : prev);
      alert('Pembayaran berhasil ditandai LUNAS.');
    } catch (err: any) {
      console.error('Error marking as paid:', err);
      alert(err?.message || 'Terjadi kesalahan saat memperbarui pembayaran');
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Reset ke page 1 ketika filter berubah
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Penjualan</h1>
          <div className="animate-pulse bg-gray-300 h-10 w-40 rounded"></div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data penjualan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Penjualan</h1>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Penjualan</h1>
          <p className="text-gray-600 mt-1">
            Total {filteredSales.length} transaksi penjualan
          </p>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <button
            onClick={handleRefresh}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            🔄 Refresh
          </button>
          <Link
            href="/dashboard/sales/create"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            + Input Penjualan Baru
          </Link>
        </div>
      </div>

      {/* Filters */}
      <SalesFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
      />

      {/* Sales Table */}
      <SalesTable
        sales={paginatedSales}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Summary */}
      <SalesSummary sales={filteredSales} />

      {/* Modals */}
      <SaleDetailModal
        sale={selectedSale}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      <DeleteConfirmationModal
        sale={selectedSale}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      <EditSaleForm
        sale={selectedSale}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />

      {/* Floating Mark-as-Paid button (visible saat ada selectedSale yang belum lunas) */}
      {selectedSale && (selectedSale.payment?.status !== 'PAID' && selectedSale.payment?.status !== 'paid') && (
        <div className="fixed bottom-6 right-6 z-60">
          <button
            onClick={() => handleMarkAsPaid(selectedSale)}
            disabled={updatingPayment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-60"
            title="Tandai sebagai Lunas"
          >
            {updatingPayment ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Memproses...
              </span>
            ) : (
              <>✅ Tandai Lunas</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}