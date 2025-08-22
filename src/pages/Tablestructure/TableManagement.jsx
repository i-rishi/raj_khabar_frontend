/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../context/CategoryContext";
import { ConfirmDialog } from "../../components/Dialog/Dialog";
import Checkbox from "@mui/material/Checkbox";
import BulkDeleteToolbar from "../../components/BulkDeleteToolbar/BulkDeleteToolbar";
import useBulkDelete from "../../hooks/useBulkDelete";

export function TableManagement() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { categories, subcategories, loadSubcategories } = useCategories();

  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [tablePosts, setTablePosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // New: category and subcategory filter state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  // Dialog state for delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Bulk selection hook for table posts
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
    'table-posts',
    () => {
      showToast('Selected table posts deleted', 'success');
      fetchTablePosts();
    },
    (err) => showToast(err?.message || 'Failed to delete selected table posts', 'error')
  );

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
      setSelectedSubcategory(""); // reset subcategory on category change
    }
    // eslint-disable-next-line
  }, [selectedCategory]);

  // Fetch table posts
  useEffect(() => {
    fetchTablePosts();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search, selectedCategory, selectedSubcategory]);

  const fetchTablePosts = async () => {
    setLoading(true);
    try {
      let url = "";
      if (selectedCategory && selectedSubcategory) {
        url = `${API_BASE_URL}/api/table/get-table-posts/category/${selectedCategory}/subcategory/${selectedSubcategory}?page=${
          page + 1
        }&limit=${rowsPerPage}&search=${encodeURIComponent(search)}`;
      } else {
        url = `${API_BASE_URL}/api/table/get-table-posts?page=${
          page + 1
        }&limit=${rowsPerPage}&search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        if (data.table && data.table.columns && data.table_post) {
          setDynamicColumns(data.table.columns);
          setTablePosts(data.table_post);
        } else {
          setDynamicColumns([]);
          setTablePosts(data.rowData || []);
        }
        setTotal(data.total || 0);
      } else {
        showToast(data.message || "Failed to fetch table posts", "error");
      }
    } catch (error) {
      showToast("Error fetching table posts", error);
    }
    setLoading(false);
  };

  // Open dialog for delete
  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/table/delete-table-post/${deleteId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Table post deleted!", "success");
        fetchTablePosts();
      } else {
        showToast(data.message || "Failed to delete", "error");
      }
    } catch (error) {
      showToast("Error deleting table post", error);
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
        py: 5,
        px: { xs: 1, sm: 4 }
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 1200,
          mx: "auto",
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#800000" }}>
            Table Post Management
          </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
            <FormControl
              size="small"
              sx={{ minWidth: 150, background: "#fff" }}
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
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
              sx={{ minWidth: 170, background: "#fff" }}
            >
              <InputLabel>Subcategory</InputLabel>
              <Select
                value={selectedSubcategory}
                label="Subcategory"
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value);
                  setPage(0);
                }}
                disabled={!selectedCategory}
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
            <TextField
              label="Search Table Posts"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ minWidth: 220, background: "#fff" }}
            />
            <Button
              variant="contained"
              sx={{
                background: "#800000",
                color: "#fffaf5",
                fontWeight: 600,
                "&:hover": { background: "#4d0000" }
              }}
              onClick={() => navigate("/TablePostCreate")}
            >
              + Create Table Post
            </Button>
          </Stack>
        </Stack>

        {selectedCount > 0 && (
          <BulkDeleteToolbar
            selectedCount={selectedCount}
            totalCount={tablePosts.length}
            contentType="table-posts"
            onSelectAll={() => selectAll(tablePosts.map((p) => p._id))}
            onClearSelection={clearSelection}
            onBulkDelete={performBulkDelete}
            isLoading={isBulkDeleting}
          />
        )}
        <TableContainer sx={{ borderRadius: 3, background: "#fff" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedCount > 0 && selectedCount < tablePosts.length}
                    checked={tablePosts.length > 0 && selectedCount === tablePosts.length}
                    onChange={(e) => {
                      if (e.target.checked) selectAll(tablePosts.map((p) => p._id));
                      else clearSelection();
                    }}
                    disabled={tablePosts.length === 0}
                  />
                </TableCell>
                {dynamicColumns.length > 0 ? (
                  dynamicColumns.map((col) => (
                    <TableCell key={col._id || col.name}>{col.name}
                    </TableCell>
                  ))
                ) : (
                  <>
                    <TableCell>Name</TableCell>
                    <TableCell>Slug</TableCell>
                  </>
                )}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress color="secondary" />
                  </TableCell>
                </TableRow>
              ) : tablePosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No table posts found.
                  </TableCell>
                </TableRow>
              ) : (
                tablePosts.map((post) => (
                  <TableRow key={post._id} hover selected={isSelected(post._id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(post._id)}
                        onChange={() => toggleSelection(post._id)}
                      />
                    </TableCell>
                    {dynamicColumns.length > 0 ? (
                      post.rowData.map((row, idx) => (
                        <TableCell key={row._id || idx}>
                          {row.isLink ? (
                            <a
                              href={row.row}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {row.row}
                            </a>
                          ) : (
                            row.row
                          )}
                        </TableCell>
                      ))
                    ) : (
                      <>
                        <TableCell>{post.name}</TableCell>
                        <TableCell>{post.slug}</TableCell>
                        {/* ...other static cells */}
                      </>
                    )}
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            navigate(`/table-post/edit/${post.slug}`)
                          }
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(post._id)}
                          disabled={isBulkDeleting}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
        />
      </Paper>
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Table Post"
        content="Are you sure you want to delete this table post? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
}
