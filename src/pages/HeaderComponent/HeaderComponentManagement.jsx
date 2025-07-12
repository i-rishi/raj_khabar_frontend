/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Chip,
  CircularProgress,
  TablePagination,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubCategoryIcon
} from "@mui/icons-material";
import { ConfirmDialog } from "../../components/Dialog/Dialog";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

export function HeaderComponentManagement() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // State management
  const [headerComponents, setHeaderComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [parentSlugFilter, setParentSlugFilter] = useState("");
  const [subCategorySlugFilter, setSubCategorySlugFilter] = useState("");

  // Dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [pendingDeleteName, setPendingDeleteName] = useState("");

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Fetch header components
  const fetchHeaderComponents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(parentSlugFilter && { parentSlug: parentSlugFilter }),
        ...(subCategorySlugFilter && { subCategorySlug: subCategorySlugFilter })
      });

      const response = await fetch(
        `${API_BASE_URL}/api/component/header/components?${params}`,
        {
          credentials: "include"
        }
      );

      const data = await response.json();

      if (data.success) {
        setHeaderComponents(data.data.headerComponents);
        setTotalItems(data.data.pagination.totalItems);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        showToast(data.message || "Failed to fetch header components", "error");
      }
    } catch (error) {
      console.error("Error fetching header components:", error);
      showToast("Error fetching header components", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaderComponents();
  }, [page, rowsPerPage, search, parentSlugFilter, subCategorySlugFilter]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle delete
  const handleDelete = (component) => {
    setPendingDeleteId(component._id);
    setPendingDeleteName(component.name);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/component/header/components/${pendingDeleteId}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast("Header component deleted successfully", "success");
        fetchHeaderComponents(); // Refresh the list
      } else {
        showToast(data.message || "Failed to delete header component", "error");
      }
    } catch (error) {
      console.error("Error deleting header component:", error);
      showToast("Error deleting header component", "error");
    } finally {
      setConfirmOpen(false);
    }
  };

  // Handle menu
  const handleMenuOpen = (event, component) => {
    setAnchorEl(event.currentTarget);
    setSelectedComponent(component);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComponent(null);
  };

  const handleEdit = () => {
    if (selectedComponent) {
      navigate(`/header-component/edit/${selectedComponent._id}`);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedComponent) {
      navigate(`/header-component/view/${selectedComponent._id}`);
    }
    handleMenuClose();
  };

  // Get link type color
  const getLinkTypeColor = (linkType) => {
    switch (linkType) {
      case "web-view":
        return "#1976d2";
      case "external":
        return "#2e7d32";
      case "internal":
        return "#ed6c02";
      case "pdf":
        return "#d32f2f";
      default:
        return "#757575";
    }
  };

  // Get link type label
  const getLinkTypeLabel = (linkType) => {
    switch (linkType) {
      case "web-view":
        return "Web View";
      case "external":
        return "External";
      case "internal":
        return "Internal";
      case "pdf":
        return "PDF";
      default:
        return linkType;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
        p: 4
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 1200,
          mx: "auto",
          p: 4,
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#800000",
              letterSpacing: 1
            }}
          >
            Header Component Management
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
            onClick={() => navigate("/header-component-create")}
          >
            Add Header Component
          </Button>
        </Stack>

        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Search Components"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="Search by name, heading, or slug..."
              sx={{
                background: "#fff",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#800000" }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Parent Category Slug"
              value={parentSlugFilter}
              onChange={(e) => setParentSlugFilter(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="Filter by parent category..."
              sx={{
                background: "#fff",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#800000" }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Subcategory Slug"
              value={subCategorySlugFilter}
              onChange={(e) => setSubCategorySlugFilter(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="Filter by subcategory..."
              sx={{
                background: "#fff",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#800000" }
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress sx={{ color: "#800000" }} />
          </Box>
        ) : headerComponents.length === 0 ? (
          <Card sx={{ mt: 3, background: "#fffaf5" }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No header components found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {search || parentSlugFilter || subCategorySlugFilter
                  ? "Try adjusting your search criteria"
                  : "Create your first header component to get started. Note: Header components can only be created for subcategories with type 'table'."}
              </Typography>
              {!search && !parentSlugFilter && !subCategorySlugFilter && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    background: "#800000",
                    "&:hover": { background: "#4d0000" }
                  }}
                  onClick={() => navigate("/header-component/create")}
                >
                  Create Header Component
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Table */}
            <TableContainer sx={{ background: "#fff", borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "#800000" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                      Component Name
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                      Heading
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                      Link Type
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                      Parent Category
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                      Subcategory
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {headerComponents.map((component) => (
                    <TableRow
                      key={component._id}
                      sx={{
                        "&:hover": { background: "#fffaf5" },
                        "&:nth-of-type(odd)": { background: "#fafafa" }
                      }}
                    >
                      <TableCell>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {component.name}
                          </Typography>
                          <Chip
                            label={component.slug}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {component.heading}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getLinkTypeLabel(component.link.link_type)}
                          size="small"
                          sx={{
                            background: getLinkTypeColor(
                              component.link.link_type
                            ),
                            color: "#fff",
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CategoryIcon
                            sx={{ fontSize: 16, color: "#800000" }}
                          />
                          <Typography variant="body2">
                            {component.parentCategory?.name ||
                              component.parentSlug}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <SubCategoryIcon
                            sx={{ fontSize: 16, color: "#800000" }}
                          />
                          <Typography variant="body2">
                            {component.subCategory?.name ||
                              component.subCategorySlug}
                          </Typography>
                          <Chip
                            label="Table"
                            size="small"
                            sx={{
                              background: "#4caf50",
                              color: "#fff",
                              fontSize: "0.6rem",
                              height: 20
                            }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              sx={{ color: "#800000" }}
                              onClick={() =>
                                navigate(
                                  `/header-component/view/${component._id}`
                                )
                              }
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Component">
                            <IconButton
                              size="small"
                              sx={{ color: "#800000" }}
                              onClick={() =>
                                navigate(
                                  `/header-component/edit/${component._id}`
                                )
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Options">
                            <IconButton
                              size="small"
                              sx={{ color: "#800000" }}
                              onClick={(e) => handleMenuOpen(e, component)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    color: "#800000",
                    fontWeight: 500
                  }
              }}
            />
          </>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmOpen}
          title="Delete Header Component"
          content={`Are you sure you want to delete "${pendingDeleteName}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: "#fffaf5",
              border: "1px solid #800000",
              borderRadius: 2
            }
          }}
        >
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <VisibilityIcon sx={{ color: "#800000" }} />
            </ListItemIcon>
            <ListItemText primary="View Details" />
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon sx={{ color: "#800000" }} />
            </ListItemIcon>
            <ListItemText primary="Edit Component" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedComponent) {
                handleDelete(selectedComponent);
              }
              handleMenuClose();
            }}
            sx={{ color: "#d32f2f" }}
          >
            <ListItemIcon>
              <DeleteIcon sx={{ color: "#d32f2f" }} />
            </ListItemIcon>
            <ListItemText primary="Delete Component" />
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
}
