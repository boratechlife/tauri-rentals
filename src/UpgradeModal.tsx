import React from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative transform transition-all duration-300 scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            Unit Limit Reached!
          </h3>
          <div className="mt-2 text-gray-600">
            <p>
              You have exhausted your allocated unit creation limit of{' '}
              <span className="font-bold text-blue-600">400 units</span>.
            </p>
            <p className="mt-2">
              To create more units, please upgrade to our advanced version.
            </p>
            <p className="mt-4 text-sm">
              Contact <span className="font-medium">boratechlife</span> for
              details:
            </p>
            <p className="text-blue-600 font-semibold">0799013907</p>
            <p className="text-blue-600 font-semibold">
              boratechlife@gmail.com
            </p>
          </div>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={onClose}
            >
              Got It!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
