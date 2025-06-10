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
        // Optionally, you can use data.table and data.header_component if needed
      } else {
        showToast(data.message || "Failed to fetch table posts", "error");
      }
    } catch (error) {
      showToast("Error fetching table posts", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table post?"))
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/table-post/${id}`, {
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
        <TableContainer sx={{ borderRadius: 3, background: "#fff" }}>
          <Table>
            <TableHead>
              <TableRow>
                {dynamicColumns.length > 0 ? (
                  dynamicColumns.map((col) => (
                    <TableCell key={col._id || col.name}>{col.name}</TableCell>
                  ))
                ) : (
                  <>
                    <TableCell>Name</TableCell>
                    <TableCell>Slug</TableCell>
                    {/* ...other static columns */}
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
                  <TableRow key={post._id} hover>
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
    </Box>
  );
}
