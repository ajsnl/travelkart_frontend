import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import "./CustomDialog.css";

const CustomDialogContext = createContext(null);

export const useCustomDialog = () => {
  const context = useContext(CustomDialogContext);
  if (!context) {
    throw new Error("useCustomDialog must be used within a CustomDialogProvider");
  }
  return context;
};

export const CustomDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert", // 'alert' | 'confirm'
    alertType: "info", // 'info' | 'success' | 'warning' | 'error'
    confirmText: "Confirm",
    cancelText: "Cancel"
  });

  const promiseRef = useRef({ resolve: null });

  const showAlert = (message, title = "Alert", alertType = "info", options = {}) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type: "alert",
      alertType,
      confirmText: options.confirmText || "OK",
      cancelText: "Cancel"
    });
    return new Promise((resolve) => {
      promiseRef.current = { resolve };
    });
  };

  const showConfirm = (message, title = "Confirm", alertType = "warning", options = {}) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type: "confirm",
      alertType,
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel"
    });
    return new Promise((resolve) => {
      promiseRef.current = { resolve };
    });
  };

  const handleConfirm = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (promiseRef.current.resolve) {
      promiseRef.current.resolve(true);
    }
  };

  const handleCancel = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (promiseRef.current.resolve) {
      promiseRef.current.resolve(false);
    }
  };

  // Close dialog on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && dialogState.isOpen) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogState.isOpen]);

  return (
    <CustomDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {dialogState.isOpen && (
        <DialogPortal
          state={dialogState}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </CustomDialogContext.Provider>
  );
};

const DialogPortal = ({ state, onConfirm, onCancel }) => {
  const { title, message, type, alertType, confirmText, cancelText } = state;

  const renderIcon = () => {
    const iconSize = 28;
    switch (alertType) {
      case "success":
        return <CheckCircle2 size={iconSize} />;
      case "error":
        return <AlertCircle size={iconSize} />;
      case "warning":
        return <AlertTriangle size={iconSize} />;
      case "info":
      default:
        return <Info size={iconSize} />;
    }
  };

  // Autofocus confirm button on mount for keyboard navigation
  const confirmBtnRef = useRef(null);
  useEffect(() => {
    if (confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, []);

  return ReactDOM.createPortal(
    <div className="custom-dialog-overlay" onClick={onCancel}>
      <div className="custom-dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="custom-dialog-content">
          <div className={`custom-dialog-icon-wrapper ${alertType}`}>
            {renderIcon()}
          </div>
          <h3 className="custom-dialog-title">{title}</h3>
          <p className="custom-dialog-message">{message}</p>
        </div>
        <div className="custom-dialog-actions">
          {type === "confirm" && (
            <button
              className="custom-dialog-btn custom-dialog-btn-cancel"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            ref={confirmBtnRef}
            className={`custom-dialog-btn custom-dialog-btn-confirm ${alertType}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
