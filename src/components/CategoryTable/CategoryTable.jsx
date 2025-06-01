import {
  Box,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  TablePagination,
  Stack
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { ConfirmDialog } from "../Dialog/Dialog";

export function CategoryTable({
  categories: categoriesProp,
  onCreateCategory
}) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(categoriesProp || []);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState(null);
  const navigate = useNavigate();

  // Sync local state with prop if prop changes
  useEffect(() => {
    setCategories(categoriesProp || []);
  }, [categoriesProp]);

  const handleSearchChange = (e) => setSearch(e.target.value.toLowerCase());
  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search) ||
      cat.slug.toLowerCase().includes(search)
  );

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteCategory = (categorySlug) => {
    setPendingDeleteSlug(categorySlug);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    fetch(`${API_BASE_URL}/api/category/delete-category/${pendingDeleteSlug}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories((prev) =>
            prev.filter((cat) => cat.slug !== pendingDeleteSlug)
          );
          setConfirmOpen(false);
          showToast("Category deleted successfully", "success");
        } else {
          showToast(data.message || "Failed to delete category", "error");
        }
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        showToast("Error deleting category", "error");
      });
  };

  return (
    <Paper
      sx={{
        mt: 3,
        p: 2,
        backgroundColor: "#f4f0e4",
        borderRadius: "10px"
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <TextField
          label="Search Category"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          sx={{
            backgroundColor: "#f4f0e4",
            width: "80%",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#800000" },
              "&:hover fieldset": { borderColor: "#a0522d" },
              "&.Mui-focused fieldset": { borderColor: "#800000" }
            },
            "& label": { color: "#800000" },
            "& label.Mui-focused": { color: "#800000" }
          }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#800000",
            "&:hover": { backgroundColor: "#a00000" },
            textTransform: "none"
          }}
          onClick={onCreateCategory}
        >
          Add Category
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer>
        <Table sx={{ border: "2px solid #800000" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#800000" }}>
              <TableCell sx={{ color: "#fff" }}>Name</TableCell>
              <TableCell sx={{ color: "#fff" }}>Description</TableCell>
              <TableCell sx={{ color: "#fff" }}>Parent Category</TableCell>
              <TableCell align="right" sx={{ color: "#fff" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCategories.map((category) => (
              <TableRow
                key={category._id}
                hover
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f1d7d7"
                  }
                }}
              >
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.parentSlug || "—"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() =>
                      navigate(`/category/edit-category/${category.slug}`)
                    }
                    sx={{
                      color: "#800000",
                      "&:hover": {
                        transform: "scale(1.1)",
                        color: "#a0522d"
                      }
                    }}
                  >
                    <Edit fontSize="medium" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteCategory(category.slug)}
                    sx={{
                      color: "#800000",
                      "&:hover": {
                        transform: "scale(1.1)",
                        color: "#a0522d"
                      }
                    }}
                  >
                    <Delete fontSize="medium" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography align="center" color="text.secondary">
                    No categories found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredCategories.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 20]}
        sx={{
          "& .MuiTablePagination-toolbar": {
            backgroundColor: "#f4f0e4",
            color: "#800000"
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              color: "#800000"
            },
          "& .MuiSelect-icon": {
            color: "#800000"
          }
        }}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Subcategory"
        content="Are you sure you want to delete this subcategory?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Paper>
  );
}
