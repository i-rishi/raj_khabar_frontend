/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress
} from "@mui/material";
import axios from "axios";

export function CategorySelect({
  register,
  control,
  selectedCategory,
  setValue
}) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(""); // Add error state

  useEffect(() => {
    // Fetch categories from your API
    axios
      .get("/api/categories")
      .then((response) => {
        setCategories(response.data);
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories."); // Show error message if API call fails
        setLoading(false); // Stop loading even on error
      });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      // Fetch subcategories based on selected category
      axios
        .get(`/api/subcategories/${selectedCategory}`)
        .then((response) => {
          setSubcategories(response.data);
          setValue("subcategoryslug", ""); // Reset subcategory if category changes
        })
        .catch((err) => {
          console.error("Error fetching subcategories:", err);
          setError("Failed to load subcategories.");
        });
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, setValue]);

  if (loading) {
    return <CircularProgress sx={{ color: "#800000" }} />; // Show loading spinner while data is loading
  }

  return (
    <Grid container spacing={2}>
      {error && (
        <Grid item xs={12}>
          <p style={{ color: "red" }}>{error}</p> {/* Display error message */}
        </Grid>
      )}
      {/* Category */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            {...register("categoryslug", { required: "Category is required" })}
            label="Category"
            defaultValue=""
            fullWidth
            sx={{
              backgroundColor: "#fff",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#800000"
                },
                "&:hover fieldset": {
                  borderColor: "#800000"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#800000"
                }
              }
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category.slug} value={category.slug}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Subcategory */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Subcategory</InputLabel>
          <Select
            {...register("subcategoryslug", {
              required: "Subcategory is required"
            })}
            label="Subcategory"
            defaultValue=""
            disabled={!selectedCategory}
            fullWidth
            sx={{
              backgroundColor: "#fff",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#800000"
                },
                "&:hover fieldset": {
                  borderColor: "#800000"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#800000"
                }
              }
            }}
          >
            {subcategories.map((subcategory) => (
              <MenuItem key={subcategory.slug} value={subcategory.slug}>
                {subcategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
