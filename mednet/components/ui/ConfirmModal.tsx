"use client";

import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export type ModalType = "confirm" | "alert" | "success" | "error" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type?: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type = "confirm",
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={24} className="text-green-600" />;
      case "error":
        return <AlertTriangle size={24} className="text-red-600" />;
      case "info":
        return <Info size={24} className="text-blue-600" />;
      case "confirm":
      default:
        return <AlertTriangle size={24} className="text-yellow-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "error":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "confirm":
      default:
        return "bg-red-600 hover:bg-red-700 text-white";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">{getIcon()}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
