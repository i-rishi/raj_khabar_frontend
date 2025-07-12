import { useState, useEffect } from "react";
import { Box, TextField, Button, MenuItem, Typography } from "@mui/material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useCategories } from "../../context/CategoryContext";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function HeaderComponentCreate() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    heading: "",
    link: "",
    link_type: "web-view",
    parentSlug: "",
    subCategorySlug: ""
  });
  const { showToast } = useToast();
  const { categories, subcategories, loadSubcategories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const parentSlug = params.get("parentSlug") || "";
  const subCategorySlug = params.get("subCategorySlug") || "";

  useEffect(() => {
    // Optionally set these as default values in your form
    setForm((prev) => ({
      ...prev,
      parentSlug,
      subCategorySlug
    }));
  }, [parentSlug, subCategorySlug]);

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
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/component/header/create-component`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include"
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast("Header component created!", "success");
        navigate("/header-component");
        // setForm({
        //   name: "",
        //   slug: "",
        //   heading: "",
        //   link: "",
        //   link_type: "web-view",
        //   parentSlug: "",
        //   subCategorySlug: ""
        // });
      } else {
        showToast(
          data.message || "Failed to create header component.",
          "error"
        );
      }
    } catch (error) {
      showToast("Error creating header component.", +error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 500, mx: "auto", mt: 4 }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Create Header Component
      </Typography>
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
      />
      <TextField
        select
        label="Link Type"
        name="link_type"
        value={form.link_type}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
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
        sx={{ mb: 2 }}
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
      <Button type="submit" variant="contained" sx={{ background: "#800000" }}>
        Create
      </Button>
    </Box>
  );
}
