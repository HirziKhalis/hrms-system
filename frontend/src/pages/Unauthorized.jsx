import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
    <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-700 mb-6">
        You do not have permission to view this page.
      </p>
      <Link
        to="/dashboard"
        className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
      >
        Go Back to Dashboard
      </Link>
    </div>
  </div>
);

export default Unauthorized;
