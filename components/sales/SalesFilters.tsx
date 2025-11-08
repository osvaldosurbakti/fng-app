import { Search, Download } from "lucide-react";

interface SalesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export default function SalesFilters({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange, 
  dateFilter, 
  onDateFilterChange 
}: SalesFiltersProps) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
      {/* Search Input */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          placeholder="Cari customer atau invoice..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
        />
      </div>
      
      {/* Filters Row */}
      <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="PAID">Lunas</option>
          <option value="PARTIAL">Partial</option>
          <option value="UNPAID">Belum Bayar</option>
        </select>
        
        {/* Date Filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}