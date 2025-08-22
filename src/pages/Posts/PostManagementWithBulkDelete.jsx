/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Pagination,
  Paper,
  Chip,
  Checkbox
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../config";

// Import our bulk delete components
import BulkDeleteToolbar from "../../components/BulkDeleteToolbar/BulkDeleteToolbar";
import useBulkDelete from "../../hooks/useBulkDelete";

export default function PostManagementWithBulkDelete() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Initialize bulk delete hook
  const {
    selectedItems,
    isLoading: isBulkDeleting,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    performBulkDelete,
  } = useBulkDelete(
    'posts',
    // Success callback
    (result, deletedIds) => {
      showToast(
        `Successfully deleted ${result.deletedCount} post(s)!`,
        'success'
      );
      fetchPosts(); // Refresh the list
    },
    // Error callback
    (error) => {
      showToast(
        error.message || 'Failed to delete posts',
        'error'
      );
    }
  );

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [status, search, page]);

  const fetchPosts = async () => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/post/posts?page=${page}&limit=10`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    try {
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      
      // Clear selections when data changes
      clearSelection();
    } catch (error) {
      showToast('Failed to fetch posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/post/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      
      if (data.success) {
        showToast("Post deleted successfully!", "success");
        fetchPosts();
      } else {
        showToast(data.message || "Failed to delete post.", "error");
      }
    } catch (error) {
      showToast("Failed to delete post.", "error");
    }
  };

  const handleSelectAll = () => {
    const allPostIds = posts.map(post => post._id);
    selectAll(allPostIds);
  };

  const handleSelectAllCheckbox = (event) => {
    if (event.target.checked) {
      handleSelectAll();
    } else {
      clearSelection();
    }
  };

  const isAllSelected = posts.length > 0 && selectedCount === posts.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < posts.length;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3
        }}
      >
        <Typography variant="h5" sx={{ color: "#800000", fontWeight: 700 }}>
          Post Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: "#800000",
            color: "#fffaf5",
            fontWeight: 600,
            "&:hover": { background: "#4d0000" }
          }}
          onClick={() => navigate("/dashboard/create-post")}
        >
          Create Post
        </Button>
      </Box>

      {/* Bulk Delete Toolbar - show only when there is a selection */}
      {selectedCount > 0 && (
        <BulkDeleteToolbar
          selectedCount={selectedCount}
          totalCount={posts.length}
          contentType="posts"
          onSelectAll={handleSelectAll}
          onClearSelection={clearSelection}
          onBulkDelete={performBulkDelete}
          isLoading={isBulkDeleting}
        />
      )}

      <Paper
        sx={{ p: 2, mb: 2, background: "#fffaf5", border: "1px solid #800000" }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search Posts"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            size="small"
            sx={{
              minWidth: 220,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#800000" }
              }
            }}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            displayEmpty
            size="small"
            sx={{
              minWidth: 160,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#800000" }
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </Box>
      </Paper>

      <Paper sx={{ overflow: "auto", border: "1px solid #800000" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 100
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ background: "#ffe0e0" }}>
              <TableRow>
                {/* Select All Checkbox */}
                <TableCell sx={{ color: "#800000", fontWeight: 700 }}>
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAllCheckbox}
                    disabled={posts.length === 0}
                    sx={{
                      color: "#800000",
                      '&.Mui-checked': {
                        color: "#800000",
                      },
                      '&.MuiCheckbox-indeterminate': {
                        color: "#800000",
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: "#800000", fontWeight: 700 }}>
                  Title
                </TableCell>
                <TableCell sx={{ color: "#800000", fontWeight: 700 }}>
                  Category
                </TableCell>
                <TableCell sx={{ color: "#800000", fontWeight: 700 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "#800000", fontWeight: 700 }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: "#800000", fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
              {posts.map((post) => (
                <TableRow 
                  key={post._id}
                  sx={{
                    backgroundColor: isSelected(post._id) ? '#fff3e0' : 'inherit',
                    '&:hover': {
                      backgroundColor: isSelected(post._id) ? '#ffecb3' : '#f5f5f5'
                    }
                  }}
                >
                  {/* Individual Row Checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={isSelected(post._id)}
                      onChange={() => toggleSelection(post._id)}
                      sx={{
                        color: "#800000",
                        '&.Mui-checked': {
                          color: "#800000",
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.category?.name || "N/A"}
                      sx={{ background: "#ffe0e0", color: "#800000" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={post.status}
                      sx={{
                        background:
                          post.status === "published"
                            ? "#c8e6c9"
                            : post.status === "draft"
                            ? "#ffe0e0"
                            : "#e0e0e0",
                        color: "#4d0000"
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/posts/edit/${post._id}`)}
                      disabled={isBulkDeleting}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(post._id)}
                      disabled={isBulkDeleting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            disabled={isBulkDeleting}
          />
        </Box>
      </Paper>
    </Box>
  );
}
