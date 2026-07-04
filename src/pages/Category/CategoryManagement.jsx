/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  Grid
} from "@mui/material";
import { Add as AddIcon, ExpandMore, Edit, Delete, ContentCopy } from "@mui/icons-material";
import { ConfirmDialog } from "../../components/Dialog/Dialog";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

export function CategoryManagement() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState(null);
  const [pendingDeleteSub, setPendingDeleteSub] = useState(null); // <-- for subcategory
  const [confirmSubOpen, setConfirmSubOpen] = useState(false); // <-- for subcategory
  const navigate = useNavigate();

  // Cloning State
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneCategoryData, setCloneCategoryData] = useState(null);
  const [cloneIconPreview, setCloneIconPreview] = useState(null);
  const [cloneIconFile, setCloneIconFile] = useState(null);
  const [tableStructures, setTableStructures] = useState([]);
  const [isCloning, setIsCloning] = useState(false);

  // Lazy-load table structures on modal open
  useEffect(() => {
    if (cloneOpen) {
      fetch(`${API_BASE_URL}/api/structure/get-table`, {
        credentials: "include"
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTableStructures(data.rowData || []);
          }
        })
        .catch((error) => console.error("Error fetching structures:", error));
    }
  }, [cloneOpen]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleOpenCloneModal = (category) => {
    setCloneCategoryData({
      name: `${category.name} (Copy)`,
      slug: `${category.slug}_copy`,
      description: category.description || "",
      isVisibleOnHome: category.isVisibleOnHome || false,
      hideCategory: category.hideCategory || false,
      iconUrl: category.iconUrl || "",
      subcategories: (category.subcategories || []).map((sub) => ({
        name: sub.name,
        slug: `${sub.slug}_copy`,
        type: sub.type || "post",
        description: sub.description || "",
        tableStructureSlug: sub.tableStructureSlug || "",
      }))
    });
    setCloneIconPreview(category.iconUrl || null);
    setCloneIconFile(null);
    setCloneOpen(true);
  };

  const handleCategoryNameChange = (val) => {
    setCloneCategoryData(prev => ({
      ...prev,
      name: val,
      slug: generateSlug(val)
    }));
  };

  const handleSubcategoryNameChange = (index, val) => {
    setCloneCategoryData(prev => {
      const updatedSubs = [...prev.subcategories];
      updatedSubs[index] = {
        ...updatedSubs[index],
        name: val,
        slug: generateSlug(val)
      };
      return { ...prev, subcategories: updatedSubs };
    });
  };

  const handleAddSubcategoryToClone = () => {
    setCloneCategoryData(prev => ({
      ...prev,
      subcategories: [
        ...prev.subcategories,
        {
          name: "",
          slug: "",
          type: "post",
          description: "",
          tableStructureSlug: ""
        }
      ]
    }));
  };

  const handleRemoveSubcategoryFromClone = (index) => {
    setCloneCategoryData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubcategoryFieldChange = (index, field, val) => {
    setCloneCategoryData(prev => {
      const updatedSubs = [...prev.subcategories];
      updatedSubs[index] = {
        ...updatedSubs[index],
        [field]: val
      };
      return { ...prev, subcategories: updatedSubs };
    });
  };

  const handleCloneIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCloneIconFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCloneIconPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCloneIcon = () => {
    setCloneIconFile(null);
    setCloneIconPreview(null);
    setCloneCategoryData(prev => ({
      ...prev,
      iconUrl: ""
    }));
  };

  const handleCloneSubmit = async (e) => {
    e.preventDefault();
    if (!cloneCategoryData.name || !cloneCategoryData.slug) {
      showToast("Name and slug are required for the category", "error");
      return;
    }

    for (const sub of cloneCategoryData.subcategories) {
      if (!sub.name || !sub.slug) {
        showToast("All subcategories must have a name and slug", "error");
        return;
      }
      if (sub.type === "table" && !sub.tableStructureSlug) {
        showToast(`Please select a table structure for subcategory: ${sub.name}`, "error");
        return;
      }
    }

    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append("name", cloneCategoryData.name);
      formData.append("slug", cloneCategoryData.slug);
      formData.append("description", cloneCategoryData.description);
      formData.append("isVisibleOnHome", cloneCategoryData.isVisibleOnHome);
      formData.append("hideCategory", cloneCategoryData.hideCategory || false);
      
      if (cloneIconFile) {
        formData.append("icon", cloneIconFile);
      } else {
        formData.append("iconUrl", cloneCategoryData.iconUrl);
      }

      formData.append("subcategories", JSON.stringify(cloneCategoryData.subcategories));

      const res = await fetch(`${API_BASE_URL}/api/category/clone-category`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) {
        showToast("Category and subcategories cloned successfully!", "success");
        setCloneOpen(false);
        // Refresh categories
        const refreshRes = await fetch(`${API_BASE_URL}/api/category/getcategories/admin`, {
          credentials: "include"
        });
        const refreshData = await refreshRes.json();
        setCategories(refreshData.categories || []);
      } else {
        showToast(data.message || "Failed to clone category", "error");
      }
    } catch (error) {
      console.error("Error cloning category:", error);
      showToast("Error cloning category", "error");
    } finally {
      setIsCloning(false);
    }
  };

  // Fetch categories with subcategories
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/category/getcategories/admin`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data => " + JSON.stringify(data.categories));
        setCategories(data.categories || []);
        setLoading(false);
      });
  }, []);

  // Filter categories by search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteCategory = (categorySlug) => {
    setPendingDeleteSlug(categorySlug);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    fetch(`${API_BASE_URL}/api/category/delete-category/${pendingDeleteSlug}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(
            categories.filter((cat) => cat.slug !== pendingDeleteSlug)
          );
          setConfirmOpen(false);
          showToast("Category deleted successfully", "success");
        } else {
          showToast(data.message || "Failed to delete category", "error");
        }
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        showToast("Error deleting category", "error");
      });
  };

  // Subcategory delete handler
  const handleDeleteSubcategory = (categorySlug, subSlug) => {
    setPendingDeleteSlug(categorySlug);
    setPendingDeleteSub(subSlug);
    setConfirmSubOpen(true);
  };

  const handleConfirmDeleteSub = () => {
    fetch(
      `${API_BASE_URL}/api/category/delete-sub-category/${pendingDeleteSub}`,
      {
        method: "DELETE",
        credentials: "include"
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.slug === pendingDeleteSlug
                ? {
                    ...cat,
                    subcategories: cat.subcategories.filter(
                      (sub) => sub.slug !== pendingDeleteSub
                    )
                  }
                : cat
            )
          );
          setConfirmSubOpen(false);
          showToast("Subcategory deleted successfully", "success");
        } else {
          showToast(data.message || "Failed to delete subcategory", "error");
        }
      })
      .catch((error) => {
        console.error("Error deleting subcategory:", error);
        showToast("Error deleting subcategory", "error");
      });
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
          maxWidth: 900,
          mx: "auto",
          p: 4,
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
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
            Category Management
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
            onClick={() => navigate("/dashboard/create-category")}
          >
            Add Category
          </Button>
        </Stack>
        <TextField
          label="Search Categories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{
            mb: 3,
            background: "#fff",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#800000" }
            }
          }}
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : filteredCategories.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
            No categories found.
          </Typography>
        ) : (
          filteredCategories.map((category) => (
            <Accordion key={category._id} sx={{ mb: 2, background: "#fffaf5" }}>
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: "#800000" }} />}
                sx={{
                  "& .MuiAccordionSummary-content": { alignItems: "center" }
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#800000" }}>
                  {category.name}
                </Typography>
                <Chip
                  label={category.isVisibleOnHome ? "Visible" : "Hidden"}
                  size="small"
                  sx={{
                    ml: 2,
                    background: category.isVisibleOnHome
                      ? "#c8e6c9"
                      : "#ffe0e0",
                    color: "#4d0000"
                  }}
                />
                {category.hideCategory && (
                  <Chip
                    label="Hidden on Website"
                    size="small"
                    sx={{
                      ml: 1,
                      background: "#ffb74d",
                      color: "#5d4037"
                    }}
                  />
                )}
              </AccordionSummary>
              <AccordionDetails
                sx={{ display: "flex", flexDirection: "column" }}
              >
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
                >
                  <IconButton
                    size="small"
                    sx={{ color: "#800000", mr: 1 }}
                    onClick={() => handleOpenCloneModal(category)}
                    title="Clone Category"
                  >
                    <ContentCopy />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ color: "#800000", mr: 1 }}
                    onClick={() =>
                      navigate(`/category/edit-category/${category.slug}`)
                    }
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ color: "#800000" }}
                    onClick={() => handleDeleteCategory(category.slug)}
                  >
                    <Delete />
                  </IconButton>
                  <ConfirmDialog
                    open={confirmOpen}
                    title="Delete Category"
                    content="Are you sure you want to delete this category?"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmOpen(false)}
                  />
                </Box>
                <Typography sx={{ mb: 1, color: "#4d0000" }}>
                  {category.description || "No description"}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#800000", mb: 1 }}
                >
                  Subcategories:
                </Typography>
                {category.subcategories && category.subcategories.length > 0 ? (
                  category.subcategories.map((sub) => (
                    <Paper
                      key={sub._id}
                      sx={{
                        p: 1,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        background: "#ffe0e0"
                      }}
                      elevation={0}
                    >
                      <Typography sx={{ flex: 1, color: "#800000" }}>
                        {sub.name}
                      </Typography>
                      <IconButton
                      size="small"
                      sx={{ color: "#800000", mr: 1 }}
                      onClick={() =>
                        navigate(
                          `/category/${category.slug}/clone-subcategory/${sub.slug}`
                        )
                      }
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#800000", mr: 1 }}
                        onClick={() =>
                          navigate(
                            `/category/${category.slug}/edit-subcategory/${sub.slug}`
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#800000" }}
                        onClick={() =>
                          handleDeleteSubcategory(category.slug, sub.slug)
                        }
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))
                ) : (
                  <Typography color="text.secondary" sx={{ ml: 1 }}>
                    No subcategories.
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 2,
                    borderColor: "#800000",
                    color: "#800000",
                    fontWeight: 600,
                    "&:hover": { borderColor: "#4d0000", color: "#4d0000" }
                  }}
                  onClick={() =>
                    navigate(`/category/${category.slug}/subcategory/create`)
                  }
                >
                  Add Subcategory
                </Button>
              </AccordionDetails>
            </Accordion>
          ))
        )}
        <ConfirmDialog
          open={confirmSubOpen}
          title="Delete Subcategory"
          content="Are you sure you want to delete this subcategory?"
          onConfirm={handleConfirmDeleteSub}
          onCancel={() => setConfirmSubOpen(false)}
        />

        {cloneCategoryData && (
          <Dialog
            open={cloneOpen}
            onClose={() => setCloneOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                background: "#fffaf5",
                boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
              }
            }}
          >
            <DialogTitle sx={{ fontWeight: 700, color: "#800000", pb: 1 }}>
              Clone Category & Subcategories
            </DialogTitle>
            <Divider sx={{ borderColor: "#ffe0e0" }} />
            <form onSubmit={handleCloneSubmit}>
              <DialogContent sx={{ py: 3 }}>
                <Stack spacing={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#800000" }}>
                    Main Category Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="New Category Name"
                        fullWidth
                        required
                        variant="outlined"
                        value={cloneCategoryData.name}
                        onChange={(e) => handleCategoryNameChange(e.target.value)}
                        sx={{ background: "#fff" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="New Category Slug"
                        fullWidth
                        required
                        variant="outlined"
                        value={cloneCategoryData.slug}
                        onChange={(e) =>
                          setCloneCategoryData({
                            ...cloneCategoryData,
                            slug: generateSlug(e.target.value)
                          })
                        }
                        sx={{ background: "#fff" }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        value={cloneCategoryData.description}
                        onChange={(e) =>
                          setCloneCategoryData({
                            ...cloneCategoryData,
                            description: e.target.value
                          })
                        }
                        sx={{ background: "#fff" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cloneCategoryData.isVisibleOnHome}
                            onChange={(e) =>
                              setCloneCategoryData({
                                ...cloneCategoryData,
                                isVisibleOnHome: e.target.checked
                              })
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#800000"
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                backgroundColor: "#800000"
                              }
                            }}
                          />
                        }
                        label="Visible on Home"
                        sx={{ color: "#800000" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!cloneCategoryData.hideCategory}
                            onChange={(e) =>
                              setCloneCategoryData({
                                ...cloneCategoryData,
                                hideCategory: e.target.checked
                              })
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#800000"
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                backgroundColor: "#800000"
                              }
                            }}
                          />
                        }
                        label="Hide Category"
                        sx={{ color: "#800000" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Button
                          variant="outlined"
                          component="label"
                          sx={{
                            borderColor: "#800000",
                            color: "#800000",
                            "&:hover": { borderColor: "#4d0000", color: "#4d0000" }
                          }}
                        >
                          Change Icon
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleCloneIconChange}
                          />
                        </Button>
                        {cloneIconPreview && (
                          <>
                            <Avatar
                              src={cloneIconPreview}
                              alt="Icon Preview"
                              sx={{
                                width: 40,
                                height: 40,
                                border: "2px solid #800000"
                              }}
                            />
                            <Button size="small" color="error" onClick={handleRemoveCloneIcon}>
                              Remove
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2, borderColor: "#ffe0e0" }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#800000" }}>
                      Subcategories to Clone ({cloneCategoryData.subcategories.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      size="small"
                      onClick={handleAddSubcategoryToClone}
                      sx={{
                        borderColor: "#800000",
                        color: "#800000",
                        "&:hover": { borderColor: "#4d0000", color: "#4d0000" }
                      }}
                    >
                      Add Subcategory
                    </Button>
                  </Stack>

                  {cloneCategoryData.subcategories.length === 0 ? (
                    <Typography color="text.secondary">
                      No subcategories will be created. Click "Add Subcategory" to add one.
                    </Typography>
                  ) : (
                    cloneCategoryData.subcategories.map((sub, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid #ffe0e0",
                          borderRadius: 2,
                          background: "#fff",
                          position: "relative"
                        }}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveSubcategoryFromClone(index)}
                          sx={{ position: "absolute", top: 8, right: 8 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                        <Grid container spacing={2} sx={{ pr: 4 }}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Subcategory Name"
                              fullWidth
                              required
                              size="small"
                              value={sub.name}
                              onChange={(e) => handleSubcategoryNameChange(index, e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Subcategory Slug"
                              fullWidth
                              required
                              size="small"
                              value={sub.slug}
                              onChange={(e) =>
                                handleSubcategoryFieldChange(index, "slug", generateSlug(e.target.value))
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small" required>
                              <InputLabel>Type</InputLabel>
                              <Select
                                label="Type"
                                value={sub.type}
                                onChange={(e) => handleSubcategoryFieldChange(index, "type", e.target.value)}
                              >
                                <MenuItem value="post">Post</MenuItem>
                                <MenuItem value="table">Table</MenuItem>
                                <MenuItem value="card">Card</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small" disabled={sub.type !== "table"}>
                              <InputLabel>Table Structure</InputLabel>
                              <Select
                                label="Table Structure"
                                value={sub.tableStructureSlug || ""}
                                onChange={(e) =>
                                  handleSubcategoryFieldChange(index, "tableStructureSlug", e.target.value)
                                }
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {tableStructures.map((structure) => (
                                  <MenuItem key={structure.slug} value={structure.slug}>
                                    {structure.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Subcategory Description"
                              fullWidth
                              size="small"
                              value={sub.description || ""}
                              onChange={(e) =>
                                handleSubcategoryFieldChange(index, "description", e.target.value)
                              }
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))
                  )}
                </Stack>
              </DialogContent>
              <Divider sx={{ borderColor: "#ffe0e0" }} />
              <DialogActions sx={{ p: 2, background: "#ffe0e0" }}>
                <Button onClick={() => setCloneOpen(false)} color="inherit" disabled={isCloning}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isCloning}
                  sx={{
                    background: "#800000",
                    color: "#fffaf5",
                    fontWeight: 600,
                    "&:hover": { background: "#4d0000" }
                  }}
                >
                  {isCloning ? "Cloning..." : "Clone Category"}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        )}
      </Paper>
    </Box>
  );
}
