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
  CircularProgress,
  Divider
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useCategories } from "../../context/CategoryContext";

export function TablePostEdit() {
  const { slug } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { categories, subcategories, loadSubcategories } = useCategories();

  const [loading, setLoading] = useState(true);
  const [tableStructures, setTableStructures] = useState([]);
  const [columns, setColumns] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentSlug: "",
    subcategorySlug: "",
    tableStructureSlug: "",
    rowData: []
  });

  // Fetch table post details
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/table/get-table-post/${slug}`,
          {
            credentials: "include"
          }
        );
        const data = await res.json();
        if (data.success && data.rowData) {
          setForm({
            name: data.rowData.name || "",
            slug: data.rowData.slug || "",
            parentSlug: data.rowData.parentSlug || "",
            subcategorySlug: data.rowData.subcategorySlug || "",
            tableStructureSlug: data.rowData.tableStructureSlug || "",
            rowData: data.rowData.rowData || []
          });
        } else {
          showToast(data.message || "Failed to fetch table post", "error");
          navigate("/table-management");
        }
      } catch (error) {
        showToast("Error fetching table post", error);
        navigate("/table-management");
      }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [slug]);

  // Fetch table structures
  useEffect(() => {
    async function fetchTableStructures() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/structure/get-table`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) setTableStructures(data.rowData || []);
      } catch (error) {
        showToast("Failed to load table structures", error);
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

  // Update columns when tableStructureSlug changes
  useEffect(() => {
    const structure = tableStructures.find(
      (t) => t.slug === form.tableStructureSlug
    );
    if (structure) {
      setColumns(structure.columns);
    } else {
      setColumns([]);
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
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/table/update-table-post/${slug}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form)
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast("Table Post Updated!", "success");
        navigate("/table-management");
      } else {
        showToast(data.message || "Failed to update table post", "error");
      }
    } catch (error) {
      showToast("Error updating table post", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        py: 6
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#800000", mb: 3 }}
        >
          Edit Table Post
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <Stack spacing={3}>
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
              disabled
              sx={{ background: "#fff" }}
              InputProps={{
                startAdornment: (
                  <Typography sx={{ color: "#800000", mr: 1 }}>/</Typography>
                )
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="parentSlug"
                value={form.parentSlug}
                label="Category"
                onChange={handleChange}
                sx={{ background: "#fff" }}
                required
                disabled
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
                disabled
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
              disabled
              value={
                tableStructures.find((t) => t.slug === form.tableStructureSlug)
                  ?.name || ""
              }
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ background: "#fff" }}
            />
            <Divider sx={{ my: 1, borderColor: "#800000" }} />
            <Typography sx={{ color: "#800000", fontWeight: 600 }}>
              Table Rows
            </Typography>
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
                          value={form.rowData[idx]?.link_type || "external"}
                          label="Link Type"
                          onChange={(e) =>
                            handleRowChange(idx, "link_type", e.target.value)
                          }
                          sx={{ background: "#fff" }}
                        >
                          <MenuItem value="external">External</MenuItem>
                          <MenuItem value="internal">Internal</MenuItem>
                          <MenuItem value="pdf">PDF</MenuItem>
                          <MenuItem value="web-view">Web View</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate("/table-management")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: "#800000",
                  color: "#fffaf5",
                  "&:hover": { background: "#4d0000" }
                }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Table Post"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
