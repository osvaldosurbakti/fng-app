'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Printer,
  Mail,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Package
} from 'lucide-react'

interface Order {
  _id: string
  orderNumber: string
  customerName: string
  orderType: string
  items: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
    notes?: string
  }>
  totalAmount: number
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  paymentStatus: 'paid' | 'unpaid' | 'partial'
  paymentMethod: string
  createdAt: string
  estimatedReadyTime: string
  notes?: string
  preparationTime?: number
  customerPhone?: string
  customerAddress?: string
}

interface OrderStats {
  total: number
  pending: number
  preparing: number
  ready: number
  completed: number
  cancelled: number
  totalRevenue: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('Gagal memuat data orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update order status')

      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ))

      alert('Status order berhasil diupdate')
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Gagal mengupdate status order')
    }
  }

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update payment status')

      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
      ))

      alert('Status pembayaran berhasil diupdate')
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Gagal mengupdate status pembayaran')
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus order ini?')) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete order')

      // Remove from local state
      setOrders(prev => prev.filter(order => order._id !== orderId))
      alert('Order berhasil dihapus')
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Gagal menghapus order')
    }
  }

  const exportOrders = async () => {
    try {
      const response = await fetch('/api/orders/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting orders:', error)
      alert('Gagal mengekspor data')
    }
  }

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order ${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .items { width: 100%; border-collapse: collapse; }
              .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .total { font-weight: bold; font-size: 1.2em; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Froze and Grill</h1>
              <h2>Order: ${order.orderNumber}</h2>
            </div>
            <div class="section">
              <strong>Customer:</strong> ${order.customerName}<br>
              <strong>Type:</strong> ${order.orderType}<br>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('id-ID')}
            </div>
            <table class="items">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                    <td>Rp ${item.subtotal.toLocaleString('id-ID')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="section total">
              Total: Rp ${order.totalAmount.toLocaleString('id-ID')}
            </div>
            <div class="section">
              <strong>Status:</strong> ${order.status}<br>
              <strong>Payment:</strong> ${order.paymentStatus} (${order.paymentMethod})
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  // Calculate stats
  const stats: OrderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.totalAmount, 0)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'preparing': return <Truck className="w-4 h-4 text-blue-500" />
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'unpaid': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Modal Components
  const OrderDetailModal = () => {
    if (!selectedOrder) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </h3>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Order Type:</strong> {selectedOrder.orderType}</p>
                {selectedOrder.customerPhone && (
                  <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                )}
                {selectedOrder.customerAddress && (
                  <p><strong>Address:</strong> {selectedOrder.customerAddress}</p>
                )}
              </div>

              {/* Order Info */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Order Information
                </h3>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </p>
                <p><strong>Payment:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})
                  </span>
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Order Items
              </h3>
              <div className="border rounded-lg">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.notes && (
                        <p className="text-sm text-gray-600">Notes: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p>{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                      <p className="font-semibold">Rp {item.subtotal.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 flex justify-between items-center font-bold text-lg">
              <span>Total Amount:</span>
              <span>Rp {selectedOrder.totalAmount.toLocaleString('id-ID')}</span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => printOrder(selectedOrder)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setIsEditModalOpen(true)
                  setEditingOrder(selectedOrder)
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600">Kelola dan pantau semua order customer</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchOrders}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>

          <button 
            onClick={exportOrders}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.preparing}</div>
          <div className="text-gray-600">Preparing</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{stats.ready}</div>
          <div className="text-gray-600">Ready</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-gray-600">Cancelled</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="text-gray-600">Revenue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari order number atau nama customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Pembayaran</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500 capitalize">{order.orderType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.length} items
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {order.items.map(item => item.name).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value as Order['status'])}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updatePaymentStatus(order._id, e.target.value as Order['paymentStatus'])}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getPaymentStatusColor(order.paymentStatus)}`}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order)
                          setIsDetailModalOpen(true)
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => printOrder(order)}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        title="Print Order"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteOrder(order._id)}
                        className="flex items-center text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">📦</div>
            <p className="text-gray-500">Tidak ada order yang ditemukan</p>
            {orders.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Klik "Create Sample Data" untuk membuat contoh order
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isDetailModalOpen && <OrderDetailModal />}
    </div>
  )
}