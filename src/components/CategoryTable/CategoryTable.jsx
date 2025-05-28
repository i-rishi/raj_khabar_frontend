import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  TablePagination
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useState } from "react";

export function CategoryTable({ categories, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  return (
    <Paper
      sx={{
        mt: 3,
        p: 2,
        backgroundColor: "#f4f0e4",
        borderRadius: "10px"
      }}
    >
      {/* Search Box */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search Category"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          sx={{
            backgroundColor: "#f4f0e4",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#800000" },
              "&:hover fieldset": { borderColor: "#a0522d" },
              "&.Mui-focused fieldset": { borderColor: "#800000" }
            },
            "& label": { color: "#800000" },
            "& label.Mui-focused": { color: "#800000" }
          }}
        />
      </Box>

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
                    onClick={() => onEdit(category)}
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
                    onClick={() => onDelete(category)}
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
    </Paper>
  );
}
