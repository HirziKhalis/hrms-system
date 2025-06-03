import React from "react";

const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
            <div className="flex flex-col items-center space-y-4">
                <div className="text-xl font-medium text-gray-800">Loading</div>
                <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
            </div>
        </div>
    );
};

export default LoadingOverlay;
