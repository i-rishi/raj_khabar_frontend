import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  InputAdornment,
  Avatar,
  Stack,
  Select,
  MenuItem,
  IconButton
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import {
  Add as AddIcon,
  Image as ImageIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useCategories } from "../../context/CategoryContext";

export function CategoryCreate() {
  const { showToast } = useToast();
  const [iconPreview, setIconPreview] = useState(null);
  const { categories } = useCategories();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentSlug: "",
      iconUrl: "",
      isVisibleOnHome: true
    }
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "iconUrl" && value instanceof File) {
          formData.append("icon", value);
        } else {
          formData.append(key, value);
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/category/create-category`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const result = await res.json();
      if (result.success) {
        showToast("Category created successfully!", "success");
        reset();
        setIconPreview(null);
      } else {
        showToast(result.message || "Failed to create category.", "error");
      }
    } catch (err) {
      showToast("Error creating category.", err);
    }
  };

  // For icon preview
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    setValue("iconUrl", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setIconPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setIconPreview(null);
    }
  };

  // Remove icon
  const handleRemoveIcon = () => {
    setValue("iconUrl", null);
    setIconPreview(null);
  };

  return (
    <Box
      sx={{
        height: "103%",
        background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 400,
          maxWidth: 480,
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#800000",
            mb: 2,
            textAlign: "center",
            letterSpacing: 1
          }}
        >
          <AddIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Create Category
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <Stack spacing={2}>
            <TextField
              label="Category Name"
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
            />
            <TextField
              label="Slug"
              {...register("slug", { required: "Slug is required" })}
              error={!!errors.slug}
              helperText={errors.slug?.message}
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">/</InputAdornment>
                )
              }}
            />
            <TextField
              label="Description"
              {...register("description")}
              multiline
              minRows={2}
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
            />
            <Controller
              name="parentSlug"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  displayEmpty
                  fullWidth
                  variant="outlined"
                  sx={{ background: "#fff" }}
                >
                  <MenuItem value="">
                    <em>No Parent</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ color: "#800000", mb: 1 }}>
                Category Icon
              </Typography>
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
                  Upload Icon
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleIconChange}
                  />
                </Button>
                {iconPreview && (
                  <>
                    <Avatar
                      src={iconPreview}
                      alt="Icon Preview"
                      sx={{
                        width: 40,
                        height: 40,
                        border: "2px solid #800000"
                      }}
                    />
                    <IconButton onClick={handleRemoveIcon} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Stack>
            </Box>
            <Controller
              name="isVisibleOnHome"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      {...field}
                      checked={!!field.value}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#800000"
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "#800000"
                          }
                      }}
                    />
                  }
                  label="Visible on Home"
                  sx={{ color: "#800000" }}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                background: "#800000",
                color: "#fffaf5",
                fontWeight: 600,
                letterSpacing: 1,
                py: 1.2,
                borderRadius: 2,
                fontSize: "1rem",
                "&:hover": { background: "#4d0000" }
              }}
              disabled={isSubmitting}
              startIcon={<AddIcon />}
            >
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
