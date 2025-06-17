// components/Pagination.jsx
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center mt-6 space-x-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded ${currentPage === 1
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
          }`}
      >
        Previous
      </button>

      <span className="text-gray-800 font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded ${currentPage === totalPages
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
          }`}
      >
        Next
      </button>

    </div>
  );
};

export default Pagination;
