import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Switch,
  Avatar,
  Tooltip,
  CircularProgress,
  Chip
} from "@mui/material";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../config";

export function UserManagement() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAllUsers = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/auth/all-users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.users);
        else showToast(data.message || "Failed to fetch users", "error");
      })
      .catch(() => showToast("Error fetching users", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.isSuperAdmin) fetchAllUsers();
  }, [user]);

  const handleManageUser = async (userId, updates) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/manage-user/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates)
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast("User updated successfully", "success");
        fetchAllUsers();
      } else {
        showToast(data.message || "Failed to update user", "error");
      }
    } catch {
      showToast("Error updating user", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user?.isSuperAdmin) {
    return <Typography color="error">Access denied.</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" mb={3} color="primary">
        User Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, overflowX: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Avatar src={u.profilePhoto} alt={u.firstName} />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {u.firstName} {u.lastName}
                      </Typography>
                      {u.isSuperAdmin && (
                        <Chip
                          label="Super Admin"
                          color="secondary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={u.email}>
                        <Typography variant="body2" noWrap maxWidth={160}>
                          {u.email}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={u.role}
                        disabled={
                          u.isSuperAdmin ||
                          u._id === user._id ||
                          updatingId === u._id
                        }
                        onChange={(e) =>
                          handleManageUser(u._id, {
                            role: e.target.value,
                            isActive: u.isActive
                          })
                        }
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="superadmin">Super Admin</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.isActive}
                        disabled={
                          u.isSuperAdmin ||
                          u._id === user._id ||
                          updatingId === u._id
                        }
                        onChange={(e) =>
                          handleManageUser(u._id, {
                            role: u.role,
                            isActive: e.target.checked
                          })
                        }
                        color="primary"
                      />
                      <Typography
                        variant="caption"
                        color={u.isActive ? "success.main" : "error.main"}
                        sx={{ ml: 1 }}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {updatingId === u._id && <CircularProgress size={20} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
