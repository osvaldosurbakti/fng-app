"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Sale, PaymentMethod, PaymentStatus } from "@/types/sales";

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
      setError("");
      const response = await fetch('/api/sales');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const validatedSales = result.data.map((sale: any) => ({
          _id: sale._id || sale.id || `temp-${Date.now()}-${Math.random()}`,
          id: sale.id || sale._id,
          customer: sale.customer || sale.customer_name || "Tanpa Nama",
          customer_name: sale.customer_name || sale.customer || "Tanpa Nama",
          customer_phone: sale.customer_phone || "",
          customer_notes: sale.customer_notes || "",
          notes: sale.notes || "",
          items: Array.isArray(sale.items) ? sale.items.map((item: any) => ({
            product: item.product || item.menu || "Unknown Product",
            menu: item.menu || item.product || "Unknown Product",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            category: item.category || "",
            temperature: item.temperature || "",
            notes: item.notes || "",
            itemTotal: Number(item.itemTotal) || (Number(item.price) || 0) * (Number(item.quantity) || 1)
          })) : [],
          totalAmount: Number(sale.totalAmount) || Number(sale.total) || 0,
          total: Number(sale.total) || Number(sale.totalAmount) || 0,
          itemCount: Number(sale.itemCount) || (Array.isArray(sale.items) ? sale.items.length : 0),
          invoice_number: sale.invoice_number || `INV-${(sale._id || sale.id)?.toString().slice(-6).toUpperCase()}`,
          payment_status: (sale.payment_status || 'UNPAID').toUpperCase() as PaymentStatus,
          payment_method: (sale.payment_method || 'CASH').toUpperCase() as PaymentMethod,
          sale_date: sale.sale_date || sale.createdAt,
          cashier: sale.cashier || 'System',
          createdAt: sale.createdAt || new Date().toISOString(),
          updatedAt: sale.updatedAt || new Date().toISOString(),
          payment: {
            method: (sale.payment?.method || sale.payment_method || 'CASH').toUpperCase() as PaymentMethod,
            status: (sale.payment?.status || sale.payment_status || 'UNPAID').toUpperCase() as PaymentStatus,
            amountPaid: Number(sale.payment?.amountPaid) || 0,
            remainingAmount: Number(sale.payment?.remainingAmount) || (Number(sale.totalAmount) || 0) - (Number(sale.payment?.amountPaid) || 0),
            proofImage: sale.payment?.proofImage || null,
            receiptNumber: sale.payment?.receiptNumber || `RCP-${(sale._id || sale.id)?.toString().slice(-6)}`,
            updatedAt: sale.payment?.updatedAt || sale.updatedAt || new Date().toISOString()
          }
        }));
        
        setSales(validatedSales);
      } else {
        throw new Error(result.message || "Gagal memuat data penjualan");
      }
    } catch (error: any) {
      console.error("Error fetching sales:", error);
      setError(error.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.payment?.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      sale.payment_status === statusFilter ||
      sale.payment?.status === statusFilter;
    
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
    if (!selectedSale) return;

    try {
      const response = await fetch(`/api/sales/${selectedSale._id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
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
  };

  const handleSaveEdit = async (updatedSale: Sale) => {
    try {
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

  // Mark selected sale as paid
  const handleMarkAsPaid = async (sale: Sale | null) => {
    if (!sale) return;
    
    const currentStatus = sale.payment?.status || sale.payment_status;
    if (currentStatus === 'PAID') {
      alert('Pembayaran sudah lunas.');
      return;
    }

    if (!confirm(`Tandai invoice ${sale.invoice_number} sebagai LUNAS?`)) return;

    try {
      setUpdatingPayment(true);
      const totalAmount = sale.totalAmount || 0;
      
      const updatedPayment = {
        method: (sale.payment?.method || sale.payment_method || 'CASH') as PaymentMethod,
        status: 'PAID' as PaymentStatus,
        amountPaid: totalAmount,
        remainingAmount: 0,
        receiptNumber: sale.payment?.receiptNumber || `RCP-${sale._id.toString().slice(-6)}`,
        updatedAt: new Date().toISOString()
      };

      const payload = {
        payment: updatedPayment,
        payment_status: 'PAID' as PaymentStatus
      };

      const response = await fetch(`/api/sales/${sale._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal memperbarui pembayaran');
      }

      await fetchSales();
      setSelectedSale(prev => prev ? { 
        ...prev, 
        payment: updatedPayment, 
        payment_status: 'PAID' 
      } : null);
      
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Penjualan</h1>
            <div className="animate-pulse bg-gray-200 h-4 w-48 mt-2 rounded"></div>
          </div>
          <div className="animate-pulse bg-gray-300 h-10 w-40 rounded"></div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data penjualan...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Data Penjualan</h1>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-red-800 font-semibold mb-2">Gagal Memuat Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6">
        <div className="mb-3 sm:mb-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Data Penjualan
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Total {filteredSales.length} transaksi
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleRefresh}
            className="text-xs sm:text-sm bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            <span className="text-xs">🔄</span>
            Refresh
          </button>
          <Link
            href="/dashboard/sales/create"
            className="text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 transition-colors"
          >
            <span className="text-xs">+</span>
            Input Baru
          </Link>
        </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <div className="mb-4 lg:mb-6">
        <SalesFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
        />
      </div>

      {/* Sales Table with Mobile Overflow */}
      <div className="mb-4 lg:mb-6">
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <SalesTable
            sales={paginatedSales}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Pagination - Mobile Friendly */}
      {totalPages > 1 && (
        <div className="mb-4 lg:mb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Summary - Compact on Mobile */}
      <div className="mb-4 lg:mb-6">
        <SalesSummary sales={filteredSales} />
      </div>

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

      {/* Floating Mark-as-Paid button - Mobile Optimized */}
      {selectedSale && (selectedSale.payment?.status !== 'PAID' && selectedSale.payment_status !== 'PAID') && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <button
            onClick={() => handleMarkAsPaid(selectedSale)}
            disabled={updatingPayment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all transform hover:scale-105 text-sm sm:text-base"
            title="Tandai sebagai Lunas"
          >
            {updatingPayment ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></span>
                <span className="hidden sm:inline">Memproses...</span>
                <span className="sm:hidden">...</span>
              </span>
            ) : (
              <>
                <span className="text-sm">✅</span>
                <span className="hidden sm:inline">Tandai Lunas</span>
                <span className="sm:hidden">Lunas</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty State - Mobile Optimized */}
      {filteredSales.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Tidak ada data penjualan
          </h3>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
            {sales.length === 0 
              ? "Belum ada transaksi penjualan yang tercatat." 
              : "Tidak ada transaksi yang sesuai dengan filter yang dipilih."}
          </p>
          {sales.length === 0 && (
            <Link
              href="/dashboard/sales/create"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg inline-flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <span>+</span>
              Buat Penjualan Pertama
            </Link>
          )}
        </div>
      )}
    </div>
  );
}