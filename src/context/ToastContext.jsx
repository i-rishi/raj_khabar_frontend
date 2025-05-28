import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect
} from "react";
import { Snackbar, Alert, LinearProgress, Box } from "@mui/material";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const AUTO_HIDE_DURATION = 5000; // ms
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info" // "success", "error", "warning", "info"
  });
  const [progress, setProgress] = useState(100);
  const timerRef = useRef();

  const showToast = useCallback((message, severity = "info") => {
    setToast({ open: true, message, severity });
    setProgress(100);
  }, []);

  const handleClose = () => setToast((t) => ({ ...t, open: false }));

  // Progress bar effect
  useEffect(() => {
    if (toast.open) {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const percent = Math.max(100 - (elapsed / AUTO_HIDE_DURATION) * 100, 0);
        setProgress(percent);
      }, 50);
      return () => clearInterval(timerRef.current);
    } else {
      setProgress(100);
      clearInterval(timerRef.current);
    }
  }, [toast.open]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={AUTO_HIDE_DURATION}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box sx={{ width: "100%" }}>
          <Alert
            onClose={handleClose}
            severity={toast.severity}
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 3,
              borderRadius: 1,
              background: "#ffe0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor:
                  toast.severity === "success"
                    ? "#4caf50"
                    : toast.severity === "error"
                    ? "#d32f2f"
                    : toast.severity === "warning"
                    ? "#ed6c02"
                    : "#1976d2"
              }
            }}
          />
        </Box>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
