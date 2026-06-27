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
  Paper,
  Chip,
  Checkbox,
  TableContainer,
  TablePagination,
  FormControl,
  InputLabel
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
import { useCategories } from "../../context/CategoryContext";
import { HEADER_HEIGHT } from "../../constants/layout";

// Import our bulk delete components
import BulkDeleteToolbar from "../../components/BulkDeleteToolbar/BulkDeleteToolbar";
import useBulkDelete from "../../hooks/useBulkDelete";

export default function PostManagementWithBulkDelete() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0); // 0-indexed for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { categories, subcategories, loadSubcategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

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

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
      setSelectedSubcategory("");
    } else {
      setSelectedSubcategory("");
    }
    setPage(0);
    // eslint-disable-next-line
  }, [selectedCategory]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [status, search, page, rowsPerPage, selectedCategory, selectedSubcategory]);

  const fetchPosts = async () => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/post/posts?page=${page + 1}&limit=${rowsPerPage}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (selectedCategory) url += `&category=${selectedCategory}`;
    if (selectedSubcategory) url += `&subcategory=${selectedSubcategory}`;
    
    try {
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
      
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
    <Box sx={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexShrink: 0
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
        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <BulkDeleteToolbar
            selectedCount={selectedCount}
            totalCount={posts.length}
            contentType="posts"
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onBulkDelete={performBulkDelete}
            isLoading={isBulkDeleting}
          />
        </Box>
      )}

      <Paper
        sx={{ p: 2, mb: 2, background: "#fffaf5", border: "1px solid #800000", flexShrink: 0 }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search Posts"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{
              minWidth: 220,
              background: "#fff",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#800000" }
              }
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 160,
              background: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#800000" }
            }}
          >
            <InputLabel sx={{ color: "#800000" }}>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              sx={{ color: "#800000" }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 160,
              background: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#800000" }
            }}
          >
            <InputLabel sx={{ color: "#800000" }}>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
              sx={{ color: "#800000" }}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 160,
              background: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#800000" }
            }}
            disabled={!selectedCategory}
          >
            <InputLabel sx={{ color: "#800000" }}>Subcategory</InputLabel>
            <Select
              value={selectedSubcategory}
              label="Subcategory"
              onChange={(e) => {
                setSelectedSubcategory(e.target.value);
              }}
              sx={{ color: "#800000" }}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {(subcategories[selectedCategory] || []).map((sub) => (
                <MenuItem key={sub.slug} value={sub.slug}>
                  {sub.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #800000" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {/* Select All Checkbox */}
                  <TableCell sx={{ color: "#800000", fontWeight: 700, bgcolor: "#ffe0e0" }}>
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
                  <TableCell sx={{ color: "#800000", fontWeight: 700, bgcolor: "#ffe0e0" }}>
                    Title
                  </TableCell>
                  <TableCell sx={{ color: "#800000", fontWeight: 700, bgcolor: "#ffe0e0" }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ color: "#800000", fontWeight: 700, bgcolor: "#ffe0e0" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "#800000", fontWeight: 700, bgcolor: "#ffe0e0" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "#800000", fontWeight: 700, bgcolor: "#ffe0e0" }}>
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
          </TableContainer>
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid #800000",
            background: "#fffaf5",
            flexShrink: 0
          }}
        />
      </Paper>
    </Box>
  );
}
