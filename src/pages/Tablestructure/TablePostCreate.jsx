/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Grid,
  Switch,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  Paper,
  Fade,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import {
  AddCircleOutline,
  Link as LinkIcon,
  Category,
  TableChart,
  ListAlt,
  ArrowBack,
  HelpOutline
} from "@mui/icons-material";
import { useCategories } from "../../context/CategoryContext";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate, useLocation } from "react-router-dom";

export function TablePostCreate() {
  const { categories, subcategories, loadSubcategories } = useCategories();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentSlug: location.state?.category || "",
    subcategorySlug: location.state?.subcategory || "",
    tableStructureSlug: "",
    rowData: []
  });

  const [tableStructures, setTableStructures] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch table structures from backend
  useEffect(() => {
    async function fetchTableStructures() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/structure/get-table`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) setTableStructures(data.rowData || []);
      } catch (err) {
        showToast("Failed to load table structures", "error");
      }
    }
    fetchTableStructures();
  }, [showToast]);

  // Load subcategories when parentSlug changes
  useEffect(() => {
    if (form.parentSlug) {
      loadSubcategories(form.parentSlug);
    }
  }, [form.parentSlug, loadSubcategories]);

  // Auto-resolve tableStructureSlug when subcategories/structures are loaded
  useEffect(() => {
    if (form.parentSlug && form.subcategorySlug && tableStructures.length > 0) {
      const subList = subcategories[form.parentSlug] || [];
      const selectedSub = subList.find((sub) => sub.slug === form.subcategorySlug);
      if (selectedSub && !form.tableStructureSlug) {
        setForm((prev) => ({
          ...prev,
          tableStructureSlug: selectedSub.tableStructureSlug || ""
        }));
      }
    }
  }, [form.parentSlug, form.subcategorySlug, subcategories, tableStructures, form.tableStructureSlug]);

  // Update columns and rowData when tableStructureSlug changes
  useEffect(() => {
    const structure = tableStructures.find(
      (t) => t.slug === form.tableStructureSlug
    );
    if (structure) {
      setColumns(structure.columns);
      setForm((prev) => ({
        ...prev,
        rowData: structure.columns.map(() => ({
          row: "",
          isLink: false,
          link_type: "external"
        }))
      }));
    } else {
      setColumns([]);
      setForm((prev) => ({ ...prev, rowData: [] }));
    }
  }, [form.tableStructureSlug, tableStructures]);

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
    }));
  };

  // Handle changes, auto-set tableStructureSlug from subcategory
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If subcategory is changed, auto-set tableStructureSlug
    if (name === "subcategorySlug") {
      const selectedSub = (subcategories[form.parentSlug] || []).find(
        (sub) => sub.slug === value
      );
      setForm((prev) => ({
        ...prev,
        subcategorySlug: value,
        tableStructureSlug: selectedSub?.tableStructureSlug || ""
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRowChange = (idx, field, value) => {
    setForm((prev) => {
      const rowData = [...prev.rowData];
      rowData[idx][field] = value;
      return { ...prev, rowData };
    });
  };

  const handleSwitchChange = (idx, checked) => {
    setForm((prev) => {
      const rowData = [...prev.rowData];
      rowData[idx].isLink = checked;
      if (!checked) rowData[idx].link_type = "external";
      return { ...prev, rowData };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (columns.length !== form.rowData.length) {
      showToast("Row fields must match the number of columns.", "error");
      return;
    }
    // Verify all rows have input
    if (form.rowData.some((row) => !row.row)) {
      showToast("Please fill in all table row fields.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/table/create-table-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Table Post Created Successfully!", "success");
        navigate("/table-management", { state: location.state });
      } else {
        if (data.message === "Unauthorized") {
          navigate("/login");
          return;
        }
        showToast(data.message || "Failed to create table post", "error");
      }
    } catch (err) {
      showToast("Error creating table post", "error");
    }
    setLoading(false);
  };

  const isFormValid =
    form.name &&
    form.slug &&
    form.parentSlug &&
    form.subcategorySlug &&
    form.tableStructureSlug &&
    columns.length > 0 &&
    columns.length === form.rowData.length &&
    !form.rowData.some((row) => !row.row);

  const activeStructure = tableStructures.find(
    (t) => t.slug === form.tableStructureSlug
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fbf8f3 0%, #f7e3e3 100%)",
        py: 4,
        px: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1400 }}>
        {/* Header Section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 4 }}
        >
          <Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/table-management", { state: location.state })}
              sx={{
                color: "#800000",
                fontWeight: 600,
                textTransform: "none",
                mb: 1,
                "&:hover": { backgroundColor: "rgba(128, 0, 0, 0.05)" }
              }}
            >
              Back to Table Management
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#800000" }}>
              Create Table Post
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
              Create a structured table entry by choosing a category hierarchy and configuring row data.
            </Typography>
          </Box>
        </Stack>

        <form onSubmit={handleSubmit} autoComplete="off" style={{ width: "100%" }}>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Left Column: Post Details & Settings */}
            <Grid item xs={12} sm={5} md={4} sx={{ minWidth: 0 }}>
              <Stack spacing={3}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3.5,
                    borderRadius: 4,
                    boxShadow: "0 8px 32px rgba(128,0,0,0.06)",
                    border: "1px solid #fff",
                    background: "rgba(255, 255, 255, 0.9)",
                    width: "100%"
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <Category sx={{ color: "#800000", fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#800000" }}>
                      Post Information
                    </Typography>
                  </Stack>

                  <Stack spacing={2.5}>
                    <TextField
                      label="Post Name"
                      name="name"
                      value={form.name}
                      onChange={handleNameChange}
                      required
                      fullWidth
                      variant="outlined"
                      placeholder="e.g. Latest Exam Schedule"
                      sx={{ background: "#fff" }}
                    />

                    <TextField
                      label="Slug"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      placeholder="e.g. latest_exam_schedule"
                      sx={{ background: "#fff" }}
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ color: "#800000", fontWeight: 600, mr: 0.5 }}>
                            /
                          </Typography>
                        )
                      }}
                    />

                    <Divider sx={{ my: 1 }} />

                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="parentSlug"
                        value={form.parentSlug}
                        label="Category"
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat.slug} value={cat.slug}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth required disabled={!form.parentSlug}>
                      <InputLabel>Subcategory</InputLabel>
                      <Select
                        name="subcategorySlug"
                        value={form.subcategorySlug}
                        label="Subcategory"
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        {(subcategories[form.parentSlug] || []).map((sub) => (
                          <MenuItem key={sub.slug} value={sub.slug}>
                            {sub.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Mapped Table Structure"
                      value={activeStructure?.name || ""}
                      placeholder="Structure auto-resolves from subcategory"
                      InputProps={{ readOnly: true }}
                      fullWidth
                      disabled
                      sx={{
                        background: "#fdfdfd",
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "#333",
                          fontWeight: 600
                        }
                      }}
                      helperText={
                        activeStructure
                          ? `Resolved: ${activeStructure.columns.length} columns defined`
                          : "Please select category & subcategory to resolve structure"
                      }
                    />
                  </Stack>
                </Paper>

                {/* Left Column: Action Card */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    boxShadow: "0 8px 32px rgba(128,0,0,0.06)",
                    border: "1px solid #fff",
                    background: "rgba(255, 255, 255, 0.9)",
                    width: "100%"
                  }}
                >
                  <Stack spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutline />}
                      disabled={!isFormValid || loading}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: "linear-gradient(90deg, #800000 0%, #a02020 100%)",
                        boxShadow: "0 4px 12px rgba(128,0,0,0.25)",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        color: "#fffaf5",
                        "&:hover": {
                          background: "linear-gradient(90deg, #600000 0%, #800000 100%)",
                          boxShadow: "0 6px 16px rgba(128,0,0,0.35)"
                        },
                        "&.Mui-disabled": {
                          background: "#e0d8d8",
                          color: "#9e9494"
                        }
                      }}
                    >
                      {loading ? "Creating..." : "Create Table Post"}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate("/table-management", { state: location.state })}
                      sx={{
                        py: 1.2,
                        borderRadius: 2,
                        borderColor: "#800000",
                        color: "#800000",
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: "#600000",
                          backgroundColor: "rgba(128, 0, 0, 0.05)"
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={7} md={8} sx={{ minWidth: 0 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(128,0,0,0.06)",
                  border: "1px solid #fff",
                  background: "rgba(255, 255, 255, 0.9)",
                  minHeight: 450,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%"
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <TableChart sx={{ color: "#800000", fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#800000" }}>
                    Table Rows Data
                  </Typography>
                </Stack>

                 {columns.length > 0 ? (
                  <Fade in timeout={400}>
                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #efe8e0", borderRadius: 3, overflow: "hidden", background: "#fff" }}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: "#faf8f5" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: "#800000", py: 2, px: 2.5, width: "30%" }}>
                              Column / Field Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "#800000", py: 2, px: 2, width: "40%" }}>
                              Value
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "#800000", py: 2, px: 2, width: "30%" }}>
                              Link Configuration
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {columns.map((col, idx) => (
                            <TableRow 
                              key={idx}
                              sx={{ 
                                "&:hover": { backgroundColor: "#fffdfa" },
                                transition: "background-color 0.2s"
                              }}
                            >
                              <TableCell sx={{ py: 2, px: 2.5, verticalAlign: "middle" }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <ListAlt sx={{ fontSize: 18, color: "#800000" }} />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#333" }}>
                                    {col.name}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell sx={{ py: 1.5, px: 2, verticalAlign: "middle" }}>
                                <TextField
                                  value={form.rowData[idx]?.row || ""}
                                  onChange={(e) => handleRowChange(idx, "row", e.target.value)}
                                  required
                                  fullWidth
                                  size="small"
                                  variant="outlined"
                                  placeholder={`Enter cell value`}
                                  InputProps={{
                                    endAdornment: form.rowData[idx]?.isLink ? (
                                      <Tooltip title="Row behaves as link">
                                        <LinkIcon color="primary" sx={{ fontSize: 20 }} />
                                      </Tooltip>
                                    ) : null
                                  }}
                                />
                              </TableCell>

                              <TableCell sx={{ py: 1.5, px: 2, verticalAlign: "middle" }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: "#666" }}>
                                      Link?
                                    </Typography>
                                    <Switch
                                      checked={!!form.rowData[idx]?.isLink}
                                      onChange={(_, checked) => handleSwitchChange(idx, checked)}
                                      color="primary"
                                      size="small"
                                    />
                                  </Stack>

                                  {form.rowData[idx]?.isLink && (
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                      <Select
                                        value={form.rowData[idx]?.link_type || "external"}
                                        onChange={(e) => handleRowChange(idx, "link_type", e.target.value)}
                                      >
                                        <MenuItem value="external">External</MenuItem>
                                        <MenuItem value="pdf">PDF</MenuItem>
                                        <MenuItem value="web-view">Web View</MenuItem>
                                      </Select>
                                    </FormControl>
                                  )}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Fade>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed #efe8e0",
                      borderRadius: 4,
                      p: 4,
                      textAlign: "center",
                      background: "#faf8f5"
                    }}
                  >
                    <TableChart sx={{ fontSize: 64, color: "#d2b4b4", mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#800000", mb: 1 }}>
                      No Table Columns Mapped Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#777", maxWidth: 400 }}>
                      To configure table row values, please select a <b>Category</b> and a <b>Subcategory</b> containing a table structure in the post settings on the left.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
}
