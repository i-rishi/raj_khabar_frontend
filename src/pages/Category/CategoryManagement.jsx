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
  CircularProgress
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
      </Paper>
    </Box>
  );
}
