import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm"
      >
        ←
      </button>
      
      <span className="px-3 py-2 text-sm sm:text-base">
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm"
      >
        →
      </button>
    </div>
  );
}