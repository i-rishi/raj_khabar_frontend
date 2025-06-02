/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Grid,
  MenuItem,
  Divider
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const columnTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "link", label: "Link" }
];

export function Tablestructure() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    columns: [
      { name: "", type: "text" },
      { name: "", type: "text" }
    ]
  });

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
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleColumnChange = (idx, field, value) => {
    setForm((prev) => {
      const columns = [...prev.columns];
      columns[idx][field] = value;
      return { ...prev, columns };
    });
  };

  const handleAddColumn = () => {
    setForm((prev) => ({
      ...prev,
      columns: [...prev.columns, { name: "", type: "text" }]
    }));
  };

  const handleRemoveColumn = (idx) => {
    setForm((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/structure/create-table`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        showToast("Table structure created successfully!", "success");
        navigate("/table-structure");
        setForm({
          name: "",
          slug: "",
          description: "",
          columns: [
            { name: "", type: "text" },
            { name: "", type: "text" }
          ]
        });
      } else {
        if (result.message === "Unauthorized") {
          navigate("/login");
          return;
        }
        showToast(
          result.message || "Failed to create table structure.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating table structure:", error);
      showToast("Error creating table structure!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          minWidth: { xs: "95vw", sm: 420 },
          maxWidth: 600,
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
          Create Table Structure
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <Stack spacing={2}>
            <TextField
              label="Table Name"
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
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              minRows={2}
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
            />
            <Divider sx={{ my: 2, borderColor: "#800000" }}>
              <Typography sx={{ color: "#800000", fontWeight: 600 }}>
                Columns
              </Typography>
            </Divider>
            {form.columns.map((col, idx) => (
              <Grid
                container
                spacing={2}
                alignItems="center"
                key={idx}
                sx={{
                  background: "#fffaf5",
                  borderRadius: 2,
                  mb: 1,
                  p: 1,
                  boxShadow: "0 2px 8px rgba(128,0,0,0.05)"
                }}
              >
                <Grid item xs={5}>
                  <TextField
                    label="Column Name"
                    value={col.name}
                    onChange={(e) =>
                      handleColumnChange(idx, "name", e.target.value)
                    }
                    required
                    fullWidth
                    variant="outlined"
                    sx={{ background: "#fff" }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Type"
                    select
                    value={col.type}
                    onChange={(e) =>
                      handleColumnChange(idx, "type", e.target.value)
                    }
                    required
                    fullWidth
                    variant="outlined"
                    sx={{ background: "#fff" }}
                  >
                    {columnTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: "center" }}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveColumn(idx)}
                    disabled={form.columns.length <= 2}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddColumn}
              sx={{
                borderColor: "#800000",
                color: "#800000",
                fontWeight: 600,
                "&:hover": { borderColor: "#4d0000", color: "#4d0000" }
              }}
              fullWidth
            >
              Add Column
            </Button>
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
              {isSubmitting ? "Creating..." : "Create Table Structure"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
