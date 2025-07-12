import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  CircularProgress,
  Paper,
  Stack
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useCategories } from "../../context/CategoryContext";
import { useNavigate, useParams } from "react-router-dom";

export function HeaderComponentEdit() {
  const { id } = useParams();
  const { showToast } = useToast();
  const { categories, subcategories, loadSubcategories } = useCategories();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    heading: "",
    link: "",
    link_type: "web-view",
    parentSlug: "",
    subCategorySlug: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch component data
  useEffect(() => {
    const fetchComponent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/component/header/components/${id}`,
          {
            credentials: "include"
          }
        );

        const data = await response.json();

        if (data.success) {
          const component = data.data;
          setForm({
            name: component.name,
            slug: component.slug,
            heading: component.heading,
            link: component.link.link,
            link_type: component.link.link_type,
            parentSlug: component.parentSlug,
            subCategorySlug: component.subCategorySlug
          });

          // Load subcategories for the parent category
          if (component.parentSlug) {
            loadSubcategories(component.parentSlug);
          }
        } else {
          showToast(
            data.message || "Failed to fetch header component",
            "error"
          );
          navigate("/header-component/management");
        }
      } catch (error) {
        console.error("Error fetching header component:", error);
        showToast("Error fetching header component", "error");
        navigate("/header-component/management");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComponent();
    }
  }, [id, loadSubcategories, showToast, navigate]);

  // Load subcategories when parent category changes
  useEffect(() => {
    if (form.parentSlug) {
      loadSubcategories(form.parentSlug);
    }
  }, [form.parentSlug, loadSubcategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      // Generate slug: lowercase, replace spaces and special chars with hyphens
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: slug
      }));
    } else if (name === "parentSlug") {
      // Reset subcategory when parent changes
      setForm((prev) => ({
        ...prev,
        [name]: value,
        subCategorySlug: ""
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.slug ||
      !form.heading ||
      !form.link ||
      !form.parentSlug ||
      !form.subCategorySlug
    ) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      setSaving(true);
      const body = {
        name: form.name,
        slug: form.slug,
        heading: form.heading,
        link: {
          link: form.link,
          link_type: form.link_type
        },
        parentSlug: form.parentSlug,
        subCategorySlug: form.subCategorySlug
      };

      const response = await fetch(
        `${API_BASE_URL}/api/component/header/components/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include"
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast("Header component updated successfully!", "success");
        navigate("/header-component/management");
      } else {
        showToast(
          data.message || "Failed to update header component.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating header component:", error);
      showToast("Error updating header component.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: "#800000" }} />
      </Box>
    );
  }

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
          maxWidth: 600,
          mx: "auto",
          p: 4,
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/header-component/management")}
            sx={{ color: "#800000" }}
          >
            Back
          </Button>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#800000",
              letterSpacing: 1
            }}
          >
            Edit Header Component
          </Typography>
        </Stack>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ maxWidth: 500, mx: "auto" }}
        >
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Heading"
            name="heading"
            value={form.heading}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Link"
            name="link"
            value={form.link}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            select
            label="Link Type"
            name="link_type"
            value={form.link_type}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          >
            <MenuItem value="web-view">Web View</MenuItem>
            <MenuItem value="external">External</MenuItem>
            <MenuItem value="internal">Internal</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
          </TextField>
          <TextField
            select
            label="Parent Category"
            name="parentSlug"
            value={form.parentSlug}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          >
            <MenuItem value="">
              <em>Select a parent category</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.slug} value={category.slug}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Subcategory (Table Type Only)"
            name="subCategorySlug"
            value={form.subCategorySlug}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
            required
            disabled={!form.parentSlug}
            helperText="Only subcategories with type 'table' can have header components"
          >
            <MenuItem value="">
              <em>Select a table subcategory</em>
            </MenuItem>
            {form.parentSlug &&
              subcategories[form.parentSlug]?.map(
                (subcategory) =>
                  subcategory.type === "table" && (
                    <MenuItem key={subcategory.slug} value={subcategory.slug}>
                      {subcategory.name} (Table)
                    </MenuItem>
                  )
              )}
          </TextField>

          <Stack direction="row" spacing={2}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/header-component")}
              sx={{
                borderColor: "#800000",
                color: "#800000",
                "&:hover": {
                  borderColor: "#4d0000",
                  background: "rgba(128,0,0,0.04)"
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={saving}
              sx={{
                background: "#800000",
                "&:hover": { background: "#4d0000" },
                "&:disabled": { background: "#ccc" }
              }}
            >
              {saving ? "Saving..." : "Update Component"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
