/* eslint-disable no-unused-vars */
import React, { useState } from "react";
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
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
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
import { useUser } from "../../context/UserContext";

const themeColor = "#800000";
const lightBg = "#fff6f6";

 export function Setting() {
  const { users } = useUser();

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6" sx={{ color: themeColor, fontWeight: 700 }}>
          User Management
        </Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          sx={{ background: themeColor }}
        >
          Add User
        </Button>
      </Stack>
      <List>
        {/* {users.map((user) => (
          <ListItem
            key={user.id}
            sx={{ borderRadius: 2, mb: 1, background: "#fff" }}
          >
            <ListItemAvatar>
              <Avatar src={user.avatar}>{user.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.name}
              secondary={`${user.email} • ${user.role}`}
              primaryTypographyProps={{ fontWeight: 600, color: themeColor }}
            />
            <ListItemSecondaryAction>
              <Tooltip title="Edit">
                <IconButton color="primary">
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton color="error">
                  <Delete />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))} */}
      </List>
    </Box>
  );
}

export function ProfileSection({ user }) {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photo: user?.profilePhoto || ""
  });

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

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
        <Button
          variant="outlined"
          sx={{ color: themeColor, borderColor: themeColor }}
        >
          Change Photo
        </Button>
      </Stack>
      <Stack spacing={2} maxWidth={400}>
        <TextField
          label="Name"
          name="name"
          value={profile.name}
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
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? "Save" : "Edit Profile"}
        </Button>
      </Stack>
    </Box>
  );
}

export function SecuritySection() {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ color: themeColor, fontWeight: 700, mb: 2 }}
      >
        Security
      </Typography>
      <Stack spacing={2} maxWidth={400}>
        <TextField label="Current Password" type="password" />
        <TextField label="New Password" type="password" />
        <TextField label="Confirm New Password" type="password" />
        <Button
          variant="contained"
          startIcon={<Lock />}
          sx={{ background: themeColor }}
        >
          Change Password
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
          <Tab label="User Management" />
        </Tabs>
        <Divider sx={{ mb: 4 }} />
        {tab === 0 && <ProfileSection user={user} />}
        {tab === 1 && <SecuritySection />}
        {tab === 2 && <PreferencesSection />}
        {tab === 3 && <UserManagementSection />}
      </Paper>
    </Box>
  );
}
