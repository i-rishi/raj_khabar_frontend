import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Box,
  Paper,
  Button,
  Stack
} from "@mui/material";
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";

export function PostTable({ posts, onView, onEdit, onDelete, onAddPost }) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("title");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setPage(0);
  }, [filter]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(filter.toLowerCase()) ||
      post.description.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedPosts = filteredPosts.sort((a, b) => {
    const valA = a[orderBy].toLowerCase();
    const valB = b[orderBy].toLowerCase();
    return order === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const paginatedPosts = sortedPosts.slice(
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
      <Box sx={{ width: "100%" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <TextField
            label="Search Posts"
            variant="outlined"
            value={filter}
            onChange={handleFilterChange}
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
            onClick={onAddPost}
          >
            Add Post
          </Button>
        </Stack>

        <TableContainer
          component={Paper}
          sx={{ backgroundColor: "#f4f0e4", border: "1px solid #800000" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#800000" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "title"}
                    direction={orderBy === "title" ? order : "asc"}
                    onClick={() => handleRequestSort("title")}
                    sx={{ color: "#fff", "&.Mui-active": { color: "#fff" } }}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "description"}
                    direction={orderBy === "description" ? order : "asc"}
                    onClick={() => handleRequestSort("description")}
                    sx={{ color: "#fff", "&.Mui-active": { color: "#fff" } }}
                  >
                    Description
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPosts.map((post, index) => (
                <TableRow
                  hover
                  key={index}
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "#fceee4"
                    }
                  }}
                >
                  <TableCell sx={{ color: "#1a1a1a" }}>{post.title}</TableCell>
                  <TableCell sx={{ color: "#333" }}>
                    {post.description}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <MdVisibility
                        onClick={() => onView(post)}
                        style={{ cursor: "pointer" }}
                        size={24}
                        className="action-icon"
                      />
                      <MdEdit
                        onClick={() => onEdit(post)}
                        style={{ cursor: "pointer" }}
                        size={24}
                        className="action-icon"
                      />
                      <MdDelete
                        onClick={() => onDelete(post)}
                        style={{ cursor: "pointer" }}
                        size={24}
                        className="action-icon"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPosts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            backgroundColor: "#f4f0e4",
            color: "#800000",
            "& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                color: "#800000"
              }
          }}
        />
      </Box>
    </Paper>
  );
}
