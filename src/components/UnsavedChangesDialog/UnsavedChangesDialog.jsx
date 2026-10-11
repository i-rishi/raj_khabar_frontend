import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

export function UnsavedChangesDialog({
  open,
  title = "Unsaved Changes",
  message = "You have unsaved changes in this post. Would you like to save it as a draft before leaving?",
  onSaveDraft,
  onDiscard,
  onCancel,
  isSaving = false
}) {
  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onCancel}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(30, 10, 10, 0.4)",
          backdropFilter: "blur(2px)"
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: "14px",
          boxShadow: "0 12px 40px rgba(128, 0, 0, 0.2)",
          maxWidth: "480px",
          width: "100%",
          p: 1,
          border: "1px solid rgba(128, 0, 0, 0.12)",
          background: "#fff"
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            backgroundColor: "#fff3cd",
            color: "#856404",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 26 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#222" }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Button
          onClick={onCancel}
          disabled={isSaving}
          variant="text"
          sx={{
            color: "#666",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#f5f5f5" }
          }}
        >
          Keep Editing
        </Button>

        <Button
          onClick={onDiscard}
          disabled={isSaving}
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlineRoundedIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px"
          }}
        >
          Discard & Leave
        </Button>

        {onSaveDraft && (
          <Button
            onClick={onSaveDraft}
            disabled={isSaving}
            variant="contained"
            startIcon={
              isSaving ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                <BookmarkBorderRoundedIcon />
              )
            }
            sx={{
              backgroundColor: "#800000",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(128, 0, 0, 0.25)",
              "&:hover": {
                backgroundColor: "#600000"
              }
            }}
          >
            {isSaving ? "Saving Draft..." : "Save as Draft"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default UnsavedChangesDialog;
