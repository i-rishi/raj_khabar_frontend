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
          backgroundColor: "transparent", // subtle maroon tint, adjust as needed
          backdropFilter: "blur(0.2px)"
        }
      }}
      PaperProps={{
        sx: {
          boxShadow: "none" // subtle shadow
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
