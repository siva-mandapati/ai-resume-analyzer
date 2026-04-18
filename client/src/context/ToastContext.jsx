import { createContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  return (
    <ToastContext.Provider value={toast}>
      <Toaster position="top-right" />
      {children}
    </ToastContext.Provider>
  );
};
