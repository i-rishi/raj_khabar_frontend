import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Paper,
  Divider,
  InputAdornment,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { Add as AddIcon, Link as LinkIcon } from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../context/CategoryContext";

export function CardCreate() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    topField: "",
    cardHeading: "",
    middleField: "",
    link: { link: "", link_type: "external" }, // <-- update downloadLink to link
    parentSlug: "",
    subCategorySlug: ""
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Use category context
  const { categories, subcategories, loadSubcategories } = useCategories();

  // Load subcategories when category changes
  useEffect(() => {
    if (form.parentSlug) {
      loadSubcategories(form.parentSlug);
      setForm((prev) => ({ ...prev, subCategorySlug: "" })); // Reset subcategory on category change
    }
    // eslint-disable-next-line
  }, [form.parentSlug]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "link" || name === "link_type") {
      setForm((prev) => ({
        ...prev,
        link: {
          ...prev.link,
          [name]: value
        }
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
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/card/create-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Card created successfully!", "success");
        navigate("/card-management");
      } else {
        showToast(data.message || "Failed to create card", "error");
      }
    } catch (error) {
      showToast("Error creating card", error);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          minWidth: { xs: "98vw", sm: 420 },
          maxWidth: 520,
          background: "linear-gradient(135deg, #fff 60%, #ffe0e0 100%)",
          boxShadow: "0 8px 32px rgba(128,0,0,0.10)"
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "#800000",
            letterSpacing: 1,
            mb: 2,
            textAlign: "center"
          }}
        >
          Create Card
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <Stack spacing={2}>
            <TextField
              label="Card Name"
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
                name="subCategorySlug"
                value={form.subCategorySlug}
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
            <Divider sx={{ my: 1, borderColor: "#800000" }} />
            <TextField
              label="Card Heading"
              name="cardHeading"
              value={form.cardHeading}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
            />
            <TextField
              label="Top Field"
              name="topField"
              value={form.topField}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
            />
            <TextField
              label="Middle Field"
              name="middleField"
              value={form.middleField}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Download Link"
                name="link"
                value={form.link.link}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ background: "#fff" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon sx={{ color: "#800000" }} />
                    </InputAdornment>
                  )
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Link Type</InputLabel>
                <Select
                  name="link_type"
                  value={form.link.link_type}
                  label="Link Type"
                  onChange={handleChange}
                  sx={{ background: "#fff" }}
                >
                  <MenuItem value="external">External</MenuItem>
                  <MenuItem value="internal">Internal</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="web-view">Web View</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                background: "linear-gradient(90deg, #800000 60%, #ffb6b6 100%)",
                color: "#fffaf5",
                fontWeight: 700,
                letterSpacing: 1,
                py: 1.3,
                borderRadius: 3,
                fontSize: "1.1rem",
                boxShadow: "0 2px 12px #ffe0e0",
                "&:hover": { background: "#4d0000" }
              }}
              startIcon={<AddIcon />}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Card"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
