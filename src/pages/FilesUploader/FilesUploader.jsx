import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  LinearProgress,
  IconButton,
  Input,
  Link as MuiLink,
  Grid,
  Tooltip,
  Avatar,
  CircularProgress,
  Checkbox
} from "@mui/material";
import {
  CloudUpload,
  FileCopy,
  Download,
  Delete,
  InsertDriveFile
} from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { ConfirmDialog } from "../../components/Dialog/Dialog";
import BulkDeleteToolbar from "../../components/BulkDeleteToolbar/BulkDeleteToolbar";
import useBulkDelete from "../../hooks/useBulkDelete";

function getFileTypeIcon(url, key) {
  const ext = key.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
    return (
      <Avatar
        src={url}
        alt={key}
        variant="rounded"
        sx={{
          width: 56,
          height: 56,
          bgcolor: "#ffe0e0",
          border: "1px solid #800000"
        }}
      />
    );
  }
  return (
    <Avatar
      sx={{ width: 56, height: 56, bgcolor: "#ffe0e0", color: "#800000" }}
    >
      <InsertDriveFile fontSize="large" />
    </Avatar>
  );
}

export function FilesUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, file: null });
  const fileInputRef = useRef();
  const { showToast } = useToast();

  const {
    selectedItems,
    selectedCount,
    isLoading: isBulkDeleting,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    performBulkDelete,
  } = useBulkDelete(
    'files',
    () => {
      showToast('Selected files deleted successfully', 'success');
      fetchFiles();
    },
    (err) => showToast(err?.message || 'Failed to delete selected files', 'error')
  );

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/s3/list`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setFiles(data.files || []);
      } else {
        showToast(data.message || "Failed to fetch files", "error");
      }
    } catch (error) {
      showToast("Error fetching files", error);
    }
    setLoadingFiles(false);
    clearSelection();
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileUrl("");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Please select a file to upload.", "warning");
      return;
    }
    setUploading(true);
    setProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${API_BASE_URL}/api/s3/upload`, {
        method: "POST",
        credentials: "include",
        body: formData
      });

      setProgress(70);

      const data = await res.json();
      if (res.ok && data.url) {
        setFileUrl(data.url);
        showToast("File uploaded successfully!", "success");
        setSelectedFile(null);
        fetchFiles();
      } else {
        showToast(data.error || "Failed to upload file", "error");
      }
    } catch (error) {
      showToast("Error uploading file", error);
    }
    setUploading(false);
    setProgress(100);
  };

  const handleCopy = (url) => {
    if (url) {
      navigator.clipboard.writeText(url);
      showToast("URL copied to clipboard!", "info");
    }
  };

  const handleDelete = async (key) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/s3/delete/${encodeURIComponent(key)}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast("File deleted!", "success");
        fetchFiles();
      } else {
        showToast(data.message || "Failed to delete file", "error");
      }
    } catch (error) {
      showToast("Error deleting file", error);
    }
    setDeleteDialog({ open: false, file: null });
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(file.url, { credentials: "include" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.key;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast("Download failed", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        py: 6
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          width: "100%",
          maxWidth: 1200,
          background: "linear-gradient(135deg, #fff 60%, #ffe0e0 100%)",
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "#800000",
            letterSpacing: 1,
            mb: 2,
            textAlign: "center"
          }}
        >
          File Uploader
        </Typography>
        <Stack spacing={3} alignItems="center" mb={4}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            sx={{
              borderColor: "#800000",
              color: "#800000",
              fontWeight: 600,
              borderRadius: 3,
              px: 3,
              "&:hover": { borderColor: "#4d0000", color: "#4d0000" }
            }}
          >
            {selectedFile ? selectedFile.name : "Choose File"}
            <Input
              type="file"
              inputRef={fileInputRef}
              onChange={handleFileChange}
              sx={{ display: "none" }}
            />
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
            sx={{
              background: "linear-gradient(90deg, #800000 60%, #ffb6b6 100%)",
              color: "#fffaf5",
              fontWeight: 700,
              borderRadius: 3,
              px: 3,
              "&:hover": { background: "#4d0000" }
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          {uploading && (
            <LinearProgress sx={{ width: "100%" }} value={progress} />
          )}
          {fileUrl && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                border: "1.5px solid #800000",
                borderRadius: 2,
                background: "#fff6f6",
                width: "100%"
              }}
            >
              <Typography
                sx={{
                  color: "#800000",
                  fontWeight: 600,
                  mb: 1,
                  wordBreak: "break-all"
                }}
              >
                Uploaded File URL:
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MuiLink
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    color: "#800000",
                    fontWeight: 600,
                    wordBreak: "break-all",
                    flex: 1
                  }}
                >
                  {fileUrl}
                </MuiLink>
                <IconButton onClick={() => handleCopy(fileUrl)} color="primary">
                  <FileCopy />
                </IconButton>
                <IconButton
                  onClick={() =>
                    handleDownload({
                      url: fileUrl,
                      key: selectedFile?.name || "file"
                    })
                  }
                  color="success"
                >
                  <Download />
                </IconButton>
              </Stack>
            </Box>
          )}
        </Stack>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#800000",
            mb: 2
          }}
        >
          Uploaded Files
        </Typography>

        {/* Bulk Delete Toolbar for Files */}
        {selectedCount > 0 && (
          <Box sx={{ mb: 3 }}>
            <BulkDeleteToolbar
              selectedCount={selectedCount}
              totalCount={files.length}
              contentType="files"
              onSelectAll={() => selectAll(files.map((f) => f.key))}
              onClearSelection={clearSelection}
              onBulkDelete={performBulkDelete}
              isLoading={isBulkDeleting}
            />
          </Box>
        )}

        {loadingFiles ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : files.length === 0 ? (
          <Typography align="center" sx={{ color: "#800000" }}>
            No files uploaded yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 2
            }}
          >
            {files.map((file) => {
              const ext = file.key.split(".").pop().toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);

              return (
                <Tooltip key={file.key} title={`${file.key} (${(file.size / 1024).toFixed(1)} KB)`} arrow>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid rgba(128, 0, 0, 0.12)",
                      background: "#fff",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.04)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 15px rgba(128, 0, 0, 0.12)",
                        "& .overlay": {
                          opacity: 1
                        },
                        "& .checkbox-select": {
                          opacity: 1
                        }
                      }
                    }}
                  >
                    {/* Bulk Selection Checkbox */}
                    <Checkbox
                      checked={isSelected(file.key)}
                      onChange={() => toggleSelection(file.key)}
                      sx={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        zIndex: 10,
                        p: 0.5,
                        bgcolor: "rgba(255, 255, 255, 0.85)",
                        color: "rgba(128, 0, 0, 0.4)",
                        '&.Mui-checked': {
                          color: "#800000",
                          bgcolor: "#fff"
                        },
                        opacity: isSelected(file.key) ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        "&.MuiCheckbox-root:hover": {
                          bgcolor: "#fff"
                        }
                      }}
                      className="checkbox-select"
                    />

                    {isImage ? (
                      <Box
                        component="img"
                        src={file.url}
                        alt={file.key}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                          bgcolor: "#fffaf5",
                          color: "#800000",
                          p: 1
                        }}
                      >
                        <InsertDriveFile sx={{ fontSize: 36 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#800000",
                            mt: 0.5,
                            textTransform: "uppercase"
                          }}
                        >
                          {ext}
                        </Typography>
                      </Box>
                    )}

                    {/* File Name Footer */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        px: 0.5,
                        py: 0.25,
                        borderTop: "1px solid rgba(128, 0, 0, 0.08)",
                        textAlign: "center"
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#800000",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {file.key}
                      </Typography>
                    </Box>

                    {/* Hover Overlay with Actions */}
                    <Box
                      className="overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                        opacity: 0,
                        transition: "opacity 0.2s ease"
                      }}
                    >
                      <Tooltip title="Copy URL">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(file.url)}
                          sx={{ color: "#fff", "&:hover": { color: "#ffb6b6" } }}
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(file)}
                          sx={{ color: "#fff", "&:hover": { color: "#c8e6c9" } }}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDialog({ open: true, file })}
                          sx={{ color: "#ff8a80", "&:hover": { color: "#ff3d00" } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete File"
          content={
            deleteDialog.file
              ? `Are you sure you want to delete "${deleteDialog.file.key}"?`
              : ""
          }
          onConfirm={() => handleDelete(deleteDialog.file.key)}
          onCancel={() => setDeleteDialog({ open: false, file: null })}
        />
      </Paper>
    </Box>
  );
}
