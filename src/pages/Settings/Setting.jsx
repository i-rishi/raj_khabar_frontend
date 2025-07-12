/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Button,
  Stack,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  CircularProgress
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Lock,
  Email,
  Palette,
  Notifications
} from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const themeColor = "#800000";
const lightBg = "#fff6f6";

export function Setting() {
  const navigate = useNavigate();

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => navigate("/add-user")}
            sx={{ background: themeColor, mt: 1 }} // mt: 1 brings it a bit down
          >
            Add User
          </Button>
          <Button
            variant="outlined"
            sx={{ color: themeColor, borderColor: themeColor, mt: 1 }}
            onClick={() => navigate("/user-management")}
          >
            Manage Users
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export function ProfileSection({ user }) {
  const [editMode, setEditMode] = useState(false);
  const { showToast } = useToast();
  const { setUser } = useUser();
  const [profile, setProfile] = useState({
    name: user?.firstName || "",
    lname: user?.lastName || "",
    email: user?.email || "",
    photo: user?.profilePhoto || "",
    role: user?.role || "User"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", profile.name);
      formData.append("lastName", profile.lname);
      formData.append("email", profile.email);
      if (profile.photoFile) formData.append("file", profile.photoFile);

      const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: "PUT",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setEditMode(false);
        if (data.user) setUser(data.user);
        showToast("Profile updated successfully", "success");
      } else {
        showToast(data.message || "Failed to update profile", "error");
      }
    } catch (error) {
      showToast("Error updating profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ color: themeColor, fontWeight: 700, mb: 2 }}
      >
        Profile
      </Typography>
      <Stack direction="row" spacing={3} alignItems="center" mb={3}>
        <Avatar
          src={profile.photo}
          sx={{ width: 72, height: 72, border: `2px solid ${themeColor}` }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: themeColor, fontWeight: 400, mb: 0.5 }}
          >
            {profile.name || "Your Name"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: themeColor, fontWeight: 400, mb: 0.5 }}
          >
            {profile.role || "User"}
          </Typography>
          <Button
            variant="outlined"
            disabled={!editMode}
            sx={{
              color: themeColor,
              borderColor: themeColor,
              mt: 1,
              alignSelf: "flex-start"
            }}
          >
            Change Photo
          </Button>
        </Box>
      </Stack>
      <Stack spacing={2} maxWidth={400}>
        <TextField
          label="First Name"
          name="name"
          value={profile.name}
          onChange={handleChange}
          disabled={!editMode}
        />
        <TextField
          label="Last Name"
          name="lname"
          value={profile.lname}
          onChange={handleChange}
          disabled={!editMode}
        />
        <TextField
          label="Email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          disabled
        />
        <Button
          variant={editMode ? "contained" : "outlined"}
          sx={{
            background: editMode ? themeColor : "transparent",
            color: editMode ? "#fff" : themeColor,
            borderColor: themeColor
          }}
          onClick={editMode ? handleSave : () => setEditMode(true)}
          disabled={loading}
        >
          {loading ? "Saving..." : editMode ? "Save" : "Edit Profile"}
        </Button>
      </Stack>
    </Box>
  );
}

export function SecuritySection() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [passwords, setPasswords] = useState({
    email: user?.email || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswords = () => {
    if (!passwords.oldPassword) {
      showToast("Current password is required", "error");
      return false;
    }
    if (!passwords.newPassword) {
      showToast("New password is required", "error");
      return false;
    }
    if (passwords.newPassword.length < 6) {
      showToast("New password must be at least 6 characters long", "error");
      return false;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("New passwords do not match", "error");
      return false;
    }
    if (passwords.oldPassword === passwords.newPassword) {
      showToast(
        "New password must be different from current password",
        "error"
      );
      return false;
    }
    return true;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/updatepassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email: passwords.email,
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          "Password updated successfully! Please log in again.",
          "success"
        );
        // Clear form
        setPasswords({
          email: user?.email || "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setShowPasswords({
          oldPassword: false,
          newPassword: false,
          confirmPassword: false
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showToast(data.message || "Failed to update password", "error");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      showToast("Error updating password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ color: themeColor, fontWeight: 700, mb: 2 }}
      >
        Security
      </Typography>
      <Stack spacing={3} maxWidth={400}>
        <TextField
          label="Email"
          name="email"
          value={passwords.email}
          onChange={handleChange}
          disabled
          helperText="Your registered email address"
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "#666"
            }
          }}
        />

        <TextField
          label="Current Password"
          name="oldPassword"
          type={showPasswords.oldPassword ? "text" : "password"}
          value={passwords.oldPassword}
          onChange={handleChange}
          required
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={() => handleTogglePasswordVisibility("oldPassword")}
                edge="end"
                size="small"
              >
                {showPasswords.oldPassword ? "👁️" : "👁️‍🗨️"}
              </IconButton>
            )
          }}
        />

        <TextField
          label="New Password"
          name="newPassword"
          type={showPasswords.newPassword ? "text" : "password"}
          value={passwords.newPassword}
          onChange={handleChange}
          required
          helperText="Password must be at least 6 characters long"
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={() => handleTogglePasswordVisibility("newPassword")}
                edge="end"
                size="small"
              >
                {showPasswords.newPassword ? "👁️" : "👁️‍🗨️"}
              </IconButton>
            )
          }}
        />

        <TextField
          label="Confirm New Password"
          name="confirmPassword"
          type={showPasswords.confirmPassword ? "text" : "password"}
          value={passwords.confirmPassword}
          onChange={handleChange}
          required
          error={
            passwords.newPassword !== passwords.confirmPassword &&
            passwords.confirmPassword !== ""
          }
          helperText={
            passwords.newPassword !== passwords.confirmPassword &&
            passwords.confirmPassword !== ""
              ? "Passwords do not match"
              : ""
          }
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={() =>
                  handleTogglePasswordVisibility("confirmPassword")
                }
                edge="end"
                size="small"
              >
                {showPasswords.confirmPassword ? "👁️" : "👁️‍🗨️"}
              </IconButton>
            )
          }}
        />

        <Button
          variant="contained"
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : <Lock />
          }
          onClick={handleUpdatePassword}
          disabled={
            loading ||
            !passwords.oldPassword ||
            !passwords.newPassword ||
            !passwords.confirmPassword
          }
          sx={{
            background: themeColor,
            "&:hover": { background: "#4d0000" },
            "&:disabled": { background: "#ccc" }
          }}
        >
          {loading ? "Updating..." : "Change Password"}
        </Button>
      </Stack>
    </Box>
  );
}

export function PreferencesSection() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ color: themeColor, fontWeight: 700, mb: 2 }}
      >
        Preferences
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode((v) => !v)}
              color="primary"
            />
          }
          label={
            <span>
              <Palette sx={{ verticalAlign: "middle", mr: 1 }} />
              Dark Mode
            </span>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={emailNotif}
              onChange={() => setEmailNotif((v) => !v)}
              color="primary"
            />
          }
          label={
            <span>
              <Email sx={{ verticalAlign: "middle", mr: 1 }} />
              Email Notifications
            </span>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={pushNotif}
              onChange={() => setPushNotif((v) => !v)}
              color="primary"
            />
          }
          label={
            <span>
              <Notifications sx={{ verticalAlign: "middle", mr: 1 }} />
              Push Notifications
            </span>
          }
        />
      </Stack>
    </Box>
  );
}

export function SettingsPage() {
  const { user } = useUser();
  const [tab, setTab] = useState(0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        py: 6
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          minWidth: { xs: "98vw", sm: 520 },
          maxWidth: 900,
          background: "linear-gradient(135deg, #fff 60%, #ffe0e0 100%)",
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: themeColor,
            letterSpacing: 1,
            mb: 2,
            textAlign: "center"
          }}
        >
          Settings
        </Typography>
        <Setting />
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            mb: 4,
            ".MuiTab-root": { fontWeight: 700, color: themeColor },
            ".Mui-selected": { color: themeColor }
          }}
        >
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="Preferences" />
        </Tabs>
        <Divider sx={{ mb: 4 }} />
        {tab === 0 && <ProfileSection user={user} />}
        {tab === 1 && <SecuritySection />}
        {tab === 2 && <PreferencesSection />}
      </Paper>
    </Box>
  );
}
