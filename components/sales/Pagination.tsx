import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Show limited pages around current page
  const visiblePages = pages.filter(page => 
    page === 1 || 
    page === totalPages || 
    Math.abs(page - currentPage) <= 1
  );

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700">
        Menampilkan halaman {currentPage} dari {totalPages}
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {visiblePages.map((page, index) => (
          <div key={page}>
            {index > 0 && visiblePages[index - 1] !== page - 1 && (
              <span className="px-3 py-2">...</span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg border ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          </div>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}