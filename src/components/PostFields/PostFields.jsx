/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  TextField,
  Grid,
  MenuItem,
  Checkbox,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCategories } from "../../context/CategoryContext";
import TiptapEditor from "../TiptapEditor/TiptapEditor";

export function PostFields({ register, errors, watch, setValue, post }) {
  const { categories, subcategories, loadSubcategories } = useCategories();
  const [editorContent, setEditorContent] = useState(null);
  const selectedCategory = watch("categoryslug") || "";
  const [imageRemoved, setImageRemoved] = useState(false);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const handleEditorChange = (json) => {
    setEditorContent(json);
    setValue("content", json); // register it in react-hook-form
  };
  console.log("PostFields component rendered with post:", post);
  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        setTagInput("");
        setValue("tags", newTags); // update react-hook-form
      }
    }
  };

  const handleTagDelete = (tagToDelete) => {
    const newTags = tags.filter((tag) => tag !== tagToDelete);
    setTags(newTags);
    setValue("tags", newTags); // update react-hook-form
  };

  const handleRemoveImage = () => {
    setValue("image", null);
    setImageRemoved(true);
  };

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
    }
  }, [selectedCategory, loadSubcategories]);

  useEffect(() => {
    const formTags = watch("tags");
    if (Array.isArray(formTags)) setTags(formTags);
  }, [watch("tags")]);

  const handleTitleChange = (e) => {
    const name = e.target.value;
    setValue("title", name);
    // Generate slug from title
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
    setValue("slug", slug);
  };

  return (
    <Grid container spacing={2}>
      {/* Title */}
      <Grid size={4} sm={6}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          size="small"
          {...register("title", { required: "Title is required" })}
          error={!!errors.title}
          helperText={errors.title?.message}
          sx={textfieldStyle}
          value={watch("title") ?? ""}
          onChange={handleTitleChange}
        />
      </Grid>

      {/* Slug */}
      <Grid size={4} sm={6}>
        <TextField
          label="Slug"
          variant="outlined"
          fullWidth
          size="small"
          {...register("slug", { required: "Slug is required" })}
          error={!!errors.slug}
          helperText={errors.slug?.message}
          sx={textfieldStyle}
          value={watch("slug") ?? ""}
        />
      </Grid>
      {/* Status */}
      <Grid size={4} sm={6}>
        <TextField
          label="Status"
          variant="outlined"
          fullWidth
          select
          size="small"
          {...register("status", { required: "Status is required" })}
          error={!!errors.status}
          helperText={errors.status?.message}
          sx={textfieldStyle}
          value={watch("status") ?? ""}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: "#fffaf5",
                  color: "#4d0000",
                  border: "1px solid #800000",
                },
              },
            },
          }}
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="Archived">Archived</MenuItem>
        </TextField>
      </Grid>
      <Grid size={6}>
        <TextField
          label="Category"
          variant="outlined"
          fullWidth
          select
          size="small"
          {...register("categoryslug", { required: "Category is required" })}
          error={!!errors.category}
          helperText={errors.category?.message}
          sx={textfieldStyle}
          value={selectedCategory}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: "#fffaf5",
                  color: "#4d0000",
                  border: "1px solid #800000",
                },
              },
            },
          }}
        >
          {categories.map((cat) => (
            <MenuItem key={cat._id} value={cat.slug}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      {/* Subcategory Dropdown */}
      {selectedCategory && (
        <Grid size={6}>
          <TextField
            label="Subcategory"
            variant="outlined"
            select
            fullWidth
            size="small"
            {...register("subcategoryslug", {
              required: "Subcategory is required",
            })}
            error={!!errors.subcategory}
            helperText={errors.subcategory?.message}
            sx={textfieldStyle}
            value={watch("subcategoryslug") ?? ""}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    backgroundColor: "#fffaf5",
                    color: "#4d0000",
                    border: "1px solid #800000",
                  },
                },
              },
            }}
          >
            {(subcategories[selectedCategory] || []).map((sub) => (
              <MenuItem key={sub._id} value={sub.slug}>
                {sub.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}
      {/* Description */}
      <Grid size={6}>
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          size="small"
          {...register("description", { required: "Description is required" })}
          error={!!errors.description}
          helperText={errors.description?.message}
          sx={textfieldStyle}
          value={watch("description") ?? ""}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          label="Tags"
          variant="outlined"
          fullWidth
          size="small"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          error={!!errors.tags}
          helperText={
            errors.tags?.message || "Press Enter or comma to add tags"
          }
          sx={textfieldStyle}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleTagDelete(tag)}
              deleteIcon={<CloseIcon />}
              sx={{ background: "#ffe0e0", color: "#800000" }}
            />
          ))}
        </Box>
      </Grid>
      {/* Upload Image */}
      <Grid size={6}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#800000",
            fontWeight: 500,
          }}
        >
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setValue("image", file); // store in react-hook-form
            }
          }}
          style={{ marginBottom: "8px" }}
        />
        {/* Preview */}
        {watch("image") ? (
          <Box sx={{ mt: 1, position: "relative", display: "inline-block" }}>
            <img
              src={URL.createObjectURL(watch("image"))}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: 200,
                borderRadius: 8,
                border: "1px solid #800000",
              }}
            />
            <IconButton
              size="small"
              onClick={handleRemoveImage}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                background: "#fff",
                border: "1px solid #800000",
                borderRadius: "50%",
                p: 0.5,
                zIndex: 2,
                "&:hover": { background: "#ffe0e0" },
              }}
            >
              <CloseIcon fontSize="small" sx={{ color: "#800000" }} />
            </IconButton>
          </Box>
        ) : post?.imageUrl && !imageRemoved ? (
          <Box sx={{ mt: 1, position: "relative", display: "inline-block" }}>
            <img
              src={post.imageUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: 200,
                borderRadius: 8,
                border: "1px solid #800000",
              }}
            />
            <IconButton
              size="small"
              onClick={handleRemoveImage}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                background: "#fff",
                border: "1px solid #800000",
                borderRadius: "50%",
                p: 0.5,
                zIndex: 2,
                "&:hover": { background: "#ffe0e0" },
              }}
            >
              <CloseIcon fontSize="small" sx={{ color: "#800000" }} />
            </IconButton>
          </Box>
        ) : null}
      </Grid>
      {/* Type */}
      <input type="hidden" value="post" {...register("type")} />
      {/* Is Visible in Carousel */}
      <Grid size={3}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          Is Visible in Carousel
          <Checkbox
            {...register("isVisibleInCarousel")}
            sx={{
              color: "#800000",
              "&.Mui-checked": {
                color: "#800000",
              },
            }}
            checked={!!watch("isVisibleInCarousel")}
          />
        </label>
      </Grid>
      {/* show ad on links */}
      <Grid size={3}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          Show Ad on Links
          <Checkbox
            {...register("showAdOnLinks")}
            sx={{
              color: "#800000",
              "&.Mui-checked": {
                color: "#800000",
              },
            }}
            checked={!!watch("showAdOnLinks")}
          />
        </label>
      </Grid>
      {/* Editor */}
      <Grid size={12}>
        <TiptapEditor
          onChange={handleEditorChange}
          initialContent={watch("content")}
        />
        <input
          type="hidden"
          {...register("content", { required: "Content is required" })}
        />
        {errors.content && (
          <p style={{ color: "red", fontSize: "0.8rem" }}>
            {errors.content.message}
          </p>
        )}
      </Grid>
    </Grid>
  );
}

const textfieldStyle = {
  backgroundColor: "#fffaf5", // Updated background to beige tone
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#800000",
    },
    "&:hover fieldset": {
      borderColor: "#800000",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#800000",
    },
  },
  "& .MuiInputBase-input": {
    padding: "10px",
  },
};
