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
  Stepper,
  Step,
  StepLabel,
  Paper
} from "@mui/material";
import { AddCircleOutline, Link as LinkIcon } from "@mui/icons-material";
import { useCategories } from "../../context/CategoryContext";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const steps = [
  "Basic Info",
  "Category & Structure",
  "Table Rows",
  "Review & Submit"
];

export function TablePostCreate() {
  const { categories, subcategories, loadSubcategories } = useCategories();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentSlug: "",
    subcategorySlug: "",
    tableStructureSlug: "",
    rowData: []
  });

  const [tableStructures, setTableStructures] = useState([]);
  const [columns, setColumns] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

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

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (columns.length !== form.rowData.length) {
      showToast("Row fields must match the number of columns.", "error");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/table/create-table-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Table Post Created!", "success");
        setForm({
          name: "",
          slug: "",
          parentSlug: "",
          subcategorySlug: "",
          tableStructureSlug: "",
          rowData: []
        });
        setColumns([]);
        setActiveStep(0);
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
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        py: 6
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
          {steps.map((label, idx) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
          }}
        >
          <form onSubmit={handleSubmit} autoComplete="off">
            <Stack spacing={2}>
              {activeStep === 0 && (
                <>
                  <Typography variant="h6" sx={{ color: "#800000" }}>
                    Basic Info
                  </Typography>
                  <TextField
                    label="Post Name"
                    name="name"
                    value={form.name}
                    onChange={handleNameChange}
                    required
                    fullWidth
                    variant="outlined"
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
                    sx={{ background: "#fff" }}
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ color: "#800000", mr: 1 }}>
                          /
                        </Typography>
                      )
                    }}
                  />
                </>
              )}
              {activeStep === 1 && (
                <>
                  <Typography variant="h6" sx={{ color: "#800000" }}>
                    Category & Table Structure
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="parentSlug"
                      value={form.parentSlug}
                      label="Category"
                      onChange={handleChange}
                      sx={{ background: "#fff" }}
                      required
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Subcategory</InputLabel>
                    <Select
                      name="subcategorySlug"
                      value={form.subcategorySlug}
                      label="Subcategory"
                      onChange={handleChange}
                      sx={{ background: "#fff" }}
                      required
                      disabled={!form.parentSlug}
                    >
                      {(subcategories[form.parentSlug] || []).map((sub) => (
                        <MenuItem key={sub.slug} value={sub.slug}>
                          {sub.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Table Structure"
                    value={
                      tableStructures.find(
                        (t) => t.slug === form.tableStructureSlug
                      )?.name || ""
                    }
                    InputProps={{ readOnly: true }}
                    fullWidth
                    sx={{ background: "#fff" }}
                  />
                </>
              )}
              {activeStep === 2 && (
                <>
                  <Typography variant="h6" sx={{ color: "#800000" }}>
                    Table Rows
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: "#800000" }} />
                  {columns.length > 0 && (
                    <Grid container spacing={2}>
                      {columns.map((col, idx) => (
                        <React.Fragment key={idx}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label={col.name}
                              value={form.rowData[idx]?.row || ""}
                              onChange={(e) =>
                                handleRowChange(idx, "row", e.target.value)
                              }
                              required
                              fullWidth
                              variant="outlined"
                              sx={{ background: "#fff" }}
                              InputProps={{
                                endAdornment: form.rowData[idx]?.isLink ? (
                                  <Tooltip title="This row is a link">
                                    <LinkIcon color="primary" />
                                  </Tooltip>
                                ) : null
                              }}
                            />
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography
                              sx={{
                                color: "#800000",
                                fontWeight: 500,
                                mt: 2,
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              Is Link?
                              <Switch
                                checked={!!form.rowData[idx]?.isLink}
                                onChange={(_, checked) =>
                                  handleSwitchChange(idx, checked)
                                }
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            {form.rowData[idx]?.isLink && (
                              <FormControl fullWidth>
                                <InputLabel>Link Type</InputLabel>
                                <Select
                                  value={
                                    form.rowData[idx]?.link_type || "external"
                                  }
                                  label="Link Type"
                                  onChange={(e) =>
                                    handleRowChange(
                                      idx,
                                      "link_type",
                                      e.target.value
                                    )
                                  }
                                  sx={{ background: "#fff" }}
                                >
                                  <MenuItem value="external">External</MenuItem>
                                  <MenuItem value="internal">Internal</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          </Grid>
                        </React.Fragment>
                      ))}
                    </Grid>
                  )}
                </>
              )}
              {activeStep === 3 && (
                <>
                  <Typography variant="h6" sx={{ color: "#800000" }}>
                    Review & Submit
                  </Typography>
                  <Box
                    sx={{ background: "#fffaf5", borderRadius: 2, p: 2, mb: 2 }}
                  >
                    <Typography>
                      <b>Name:</b> {form.name}
                    </Typography>
                    <Typography>
                      <b>Slug:</b> {form.slug}
                    </Typography>
                    <Typography>
                      <b>Category:</b>{" "}
                      {categories.find((c) => c.slug === form.parentSlug)?.name}
                    </Typography>
                    <Typography>
                      <b>Subcategory:</b>{" "}
                      {
                        (subcategories[form.parentSlug] || []).find(
                          (s) => s.slug === form.subcategorySlug
                        )?.name
                      }
                    </Typography>
                    <Typography>
                      <b>Table Structure:</b>{" "}
                      {
                        tableStructures.find(
                          (t) => t.slug === form.tableStructureSlug
                        )?.name
                      }
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography>
                      <b>Rows:</b>
                    </Typography>
                    <ul>
                      {columns.map((col, idx) => (
                        <li key={col.name}>
                          <b>{col.name}:</b> {form.rowData[idx]?.row}{" "}
                          {form.rowData[idx]?.isLink && (
                            <span style={{ color: "#1976d2" }}>
                              [Link: {form.rowData[idx]?.link_type}]
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Box>
                </>
              )}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                {activeStep > 0 && (
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      background: "#800000",
                      color: "#fffaf5",
                      "&:hover": { background: "#4d0000" }
                    }}
                    disabled={
                      (activeStep === 0 && (!form.name || !form.slug)) ||
                      (activeStep === 1 &&
                        (!form.parentSlug ||
                          !form.subcategorySlug ||
                          !form.tableStructureSlug)) ||
                      (activeStep === 2 &&
                        (columns.length !== form.rowData.length ||
                          form.rowData.some((row) => !row.row)))
                    }
                  >
                    Next
                  </Button>
                )}
                {activeStep === steps.length - 1 && (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      background: "#800000",
                      color: "#fffaf5",
                      "&:hover": { background: "#4d0000" }
                    }}
                    startIcon={<AddCircleOutline />}
                  >
                    Create Table Post
                  </Button>
                )}
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
