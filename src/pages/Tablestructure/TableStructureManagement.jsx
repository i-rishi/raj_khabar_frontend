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
  Button
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import BulkDeleteToolbar from "../../components/BulkDeleteToolbar/BulkDeleteToolbar";
import useBulkDelete from "../../hooks/useBulkDelete";
import { ConfirmDialog } from "../../components/Dialog/Dialog";
import { HEADER_HEIGHT } from "../../constants/layout";

// App theme colors
const PRIMARY = "#800000"; // Rich Crimson/Burgundy
const BG_GRADIENT = "linear-gradient(135deg, #fcfbf9 0%, #f7f1e5 50%, #fbebeb 100%)";

export function TableStructureManagement() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tableStructures, setTableStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Dialog state for delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Bulk selection hook for table structures
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
    'table-structures',
    () => {
      showToast('Selected table structures deleted', 'success');
      fetchTableStructures();
    },
    (err) => showToast(err?.message || 'Failed to delete selected table structures', 'error')
  );

  // Fetch table structures
  useEffect(() => {
    fetchTableStructures();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search]);

  const fetchTableStructures = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/structure/get-table?page=${
        page + 1
      }&limit=${rowsPerPage}&search=${encodeURIComponent(search)}`;
      
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setTableStructures(data.rowData || []);
        setTotal(data.total || 0);
      } else {
        showToast(data.message || "Failed to fetch table structures", "error");
      }
    } catch (error) {
      showToast("Error fetching table structures", "error");
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
      // Pass the single ID wrapped in an array to the bulk delete endpoint
      const res = await fetch(`${API_BASE_URL}/api/bulk-delete/table-structures`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ids: [deleteId] }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Table structure deleted!", "success");
        fetchTableStructures();
      } else {
        showToast(data.message || "Failed to delete", "error");
      }
    } catch (error) {
      showToast("Error deleting table structure", "error");
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        background: BG_GRADIENT,
        py: 2,
        px: { xs: 2, sm: 6 }
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          p: { xs: 3, sm: 4 },
          borderRadius: "24px",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(128, 0, 0, 0.08)",
          boxShadow: "0 20px 40px rgba(128, 0, 0, 0.03)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          mb={4}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              background: `linear-gradient(45deg, ${PRIMARY} 30%, #cc3333 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.5px",
              minWidth: "fit-content"
            }}
          >
            Table Structure Management
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            <TextField
              label="Search Table Structures"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ minWidth: 260, background: "#fff", borderRadius: "8px" }}
            />

            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                background: PRIMARY,
                color: "#fff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                py: 1.25,
                whiteSpace: "nowrap",
                boxShadow: `0 4px 14px rgba(128, 0, 0, 0.25)`,
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: "#600000",
                  boxShadow: `0 6px 20px rgba(128, 0, 0, 0.35)`,
                  transform: "translateY(-2px)"
                }
              }}
              onClick={() => navigate("/table-structure/create")}
            >
              Create Table Structure
            </Button>
          </Stack>
        </Stack>

        {selectedCount > 0 && (
          <Box mb={3}>
            <BulkDeleteToolbar
              selectedCount={selectedCount}
              totalCount={tableStructures.length}
              contentType="table-structures"
              onSelectAll={() => selectAll(tableStructures.map((s) => s._id))}
              onClearSelection={clearSelection}
              onBulkDelete={performBulkDelete}
              isLoading={isBulkDeleting}
            />
          </Box>
        )}

        <TableContainer
          sx={{
            borderRadius: "16px",
            background: "#fff",
            border: "1px solid rgba(128, 0, 0, 0.08)",
            flex: 1,
            overflowY: "auto"
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ bgcolor: "#fff" }}>
                  <Checkbox
                    indeterminate={selectedCount > 0 && selectedCount < tableStructures.length}
                    checked={tableStructures.length > 0 && selectedCount === tableStructures.length}
                    onChange={(e) => {
                      if (e.target.checked) selectAll(tableStructures.map((s) => s._id));
                      else clearSelection();
                    }}
                    disabled={tableStructures.length === 0}
                    sx={{
                      color: "rgba(128, 0, 0, 0.4)",
                      '&.Mui-checked': { color: PRIMARY },
                      '&.MuiCheckbox-indeterminate': { color: PRIMARY }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: PRIMARY, bgcolor: "#fff" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800, color: PRIMARY, bgcolor: "#fff" }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 800, color: PRIMARY, bgcolor: "#fff" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 800, color: PRIMARY, bgcolor: "#fff" }}>Columns</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: PRIMARY, bgcolor: "#fff" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: PRIMARY }} />
                  </TableCell>
                </TableRow>
              ) : tableStructures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>
                    No table structures found.
                  </TableCell>
                </TableRow>
              ) : (
                tableStructures.map((structure) => (
                  <TableRow
                    key={structure._id}
                    hover
                    selected={isSelected(structure._id)}
                    sx={{
                      transition: "background-color 0.2s ease",
                      "&.Mui-selected": {
                        bgcolor: "rgba(128, 0, 0, 0.02) !important"
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(structure._id)}
                        onChange={() => toggleSelection(structure._id)}
                        sx={{
                          color: "rgba(128, 0, 0, 0.4)",
                          '&.Mui-checked': { color: PRIMARY }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#333" }}>{structure.name}</TableCell>
                    <TableCell sx={{ color: "#666", fontWeight: 600 }}>/{structure.slug}</TableCell>
                    <TableCell sx={{ color: "#555", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {structure.description || "—"}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 350 }}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {structure.columns && structure.columns.map((col, idx) => (
                          <Chip
                            key={col._id || idx}
                            label={`${col.name} (${col.type})`}
                            size="small"
                            sx={{
                              bgcolor: "rgba(128, 0, 0, 0.05)",
                              color: PRIMARY,
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              borderRadius: "6px",
                              border: "1px solid rgba(128, 0, 0, 0.08)"
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete">
                        <IconButton
                          sx={{
                            color: "#d32f2f",
                            bgcolor: "rgba(211, 47, 47, 0.04)",
                            p: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              color: "#fff",
                              bgcolor: "#d32f2f",
                              transform: "translateY(-2px)"
                            }
                          }}
                          onClick={() => handleDelete(structure._id)}
                          disabled={isBulkDeleting}
                        >
                          <Delete sx={{ fontSize: 18 }} />
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
          sx={{
            mt: 3,
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            border: "1px solid rgba(128, 0, 0, 0.08)",
            boxShadow: "0 4px 12px rgba(128, 0, 0, 0.03)"
          }}
        />
      </Paper>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Table Structure"
        content="Are you sure you want to delete this table structure? This action cannot be undone and will fail if it's being used by subcategories or table posts."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
}
