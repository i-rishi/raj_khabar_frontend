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
  CircularProgress
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
          minWidth: { xs: "98vw", sm: 520 },
          maxWidth: 900,
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
        {loadingFiles ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : files.length === 0 ? (
          <Typography align="center" sx={{ color: "#800000" }}>
            No files uploaded yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {files.map((file) => (
              <Grid item xs={12} sm={6} md={4} key={file.key}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: "#fff",
                    border: "1.5px solid #ffe0e0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minHeight: 220
                  }}
                >
                  {getFileTypeIcon(file.url, file.key)}
                  <Typography
                    sx={{
                      color: "#800000",
                      fontWeight: 600,
                      mt: 1,
                      mb: 0.5,
                      textAlign: "center",
                      wordBreak: "break-all",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                    variant="body2"
                    component="a"
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.key}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#888",
                      fontSize: 13,
                      mb: 1,
                      textAlign: "center"
                    }}
                  >
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
                    <Tooltip title="Copy URL">
                      <IconButton
                        onClick={() => handleCopy(file.url)}
                        color="primary"
                      >
                        <FileCopy />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        onClick={() => handleDownload(file)}
                        color="success"
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, file })}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
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
