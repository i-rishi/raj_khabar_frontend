import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress
} from "@mui/material";
import { AddAPhoto } from "@mui/icons-material";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";

export function AddUser() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    isActive: true,
    isSuperAdmin: false,
    profilePhoto: null
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, profilePhoto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", form.role);
      formData.append("isActive", form.isActive);
      formData.append("isSuperAdmin", form.isSuperAdmin);
      if (form.profilePhoto) formData.append("file", form.profilePhoto);

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast("User registered successfully", "success");
        navigate("/user-management");
      } else {
        showToast(data.message || "Failed to register user", "error");
      }
    } catch (error) {
      showToast("Error registering user", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          minWidth: { xs: "98vw", sm: 420 },
          maxWidth: 500,
          background: "linear-gradient(135deg, #fff 60%, #ffe0e0 100%)",
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "#b71c1c",
            letterSpacing: 1,
            mb: 2,
            textAlign: "center"
          }}
        >
          Add New User
        </Typography>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Stack spacing={3}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <label htmlFor="photo-upload">
                <input
                  accept="image/*"
                  id="photo-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
                <Avatar
                  src={preview}
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 1,
                    border: "2px solid #b71c1c",
                    cursor: "pointer",
                    transition: "0.2s"
                  }}
                >
                  <AddAPhoto />
                </Avatar>
              </label>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                fullWidth
              />
            </Stack>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ minLength: 6 }}
            />
            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                label="Role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="superadmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2} justifyContent="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isSuperAdmin}
                    onChange={handleChange}
                    name="isSuperAdmin"
                  />
                }
                label="Super Admin"
              />
            </Stack>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                fontWeight: 700,
                fontSize: 18,
                py: 1.2,
                background: "#b71c1c",
                "&:hover": { background: "#d32f2f" }
              }}
              disabled={loading}
              fullWidth
              startIcon={
                loading && <CircularProgress size={22} color="inherit" />
              }
            >
              {loading ? "Registering..." : "Add User"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
