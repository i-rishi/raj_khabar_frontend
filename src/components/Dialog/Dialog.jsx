import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";

export function ConfirmDialog({ open, title, content, onConfirm, onCancel }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(128,0,0,0.08)", // subtle maroon tint
          backdropFilter: "blur(0.5px)"
        }
      }}
      PaperProps={{
        sx: {
          boxShadow: "0 8px 32px rgba(128,0,0,0.18)", // subtle maroon shadow
          // border: "2px solid #800000", // maroon border
          borderRadius: 2,
          background: "linear-gradient(135deg, #fff 60%, #ffe0e0 100%)"
        }
      }}
    >
      <DialogTitle sx={{ color: "#800000", fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography>{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
