import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, MoreVert } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { ConfirmDialog } from "../../components/Dialog/Dialog";

export function MainCategoryAllData() {
  const { slug } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState(null);
  const [tab, setTab] = useState(0);
  const [selectedSub, setSelectedSub] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItem, setMenuItem] = useState(null);

  // ConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch centralized data
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/centralized/category/${slug}/overview`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategoryData(data);
        else showToast(data.message || "Failed to load category", "error");
        setLoading(false);
      })
      .catch(() => {
        showToast("Failed to load category", "error");
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [slug]);

  // Filtered data by subcategory
  const filteredPosts = useMemo(() => {
    if (!categoryData) return [];
    if (selectedSub === "all") return categoryData.posts;
    return categoryData.posts.filter(
      (p) => p.subCategory && p.subCategory.slug === selectedSub
    );
  }, [categoryData, selectedSub]);

  const filteredTablePosts = useMemo(() => {
    if (!categoryData) return [];
    if (selectedSub === "all") return categoryData.tablePosts;
    return categoryData.tablePosts.filter(
      (p) => p.subCategory && p.subCategory.slug === selectedSub
    );
  }, [categoryData, selectedSub]);

  const filteredCardPosts = useMemo(() => {
    if (!categoryData) return [];
    if (selectedSub === "all") return categoryData.cardPosts;
    return categoryData.cardPosts.filter(
      (p) => p.subCategory && p.subCategory.slug === selectedSub
    );
  }, [categoryData, selectedSub]);

  // Handle edit/delete menu
  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  // Open confirm dialog for delete
  const handleDeleteRequest = (type, item) => {
    setDeleteTarget({ type, item });
    setConfirmOpen(true);
    handleMenuClose();
  };

  // Delete handlers (for posts, table, card)
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    let url = "";
    if (type === "post") {
      url = `${API_BASE_URL}/api/post/${item._id}`;
    } else if (type === "table") {
      url = `${API_BASE_URL}/api/table/delete-table-post/${item._id}`;
    } else if (type === "card") {
      url = `${API_BASE_URL}/api/card/delete/${item._id}`;
    }
    try {
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Deleted successfully", "success");
        // Refresh data
        setCategoryData((prev) => ({
          ...prev,
          posts:
            type === "post"
              ? prev.posts.filter((p) => p._id !== item._id)
              : prev.posts,
          tablePosts:
            type === "table"
              ? prev.tablePosts.filter((p) => p._id !== item._id)
              : prev.tablePosts,
          cardPosts:
            type === "card"
              ? prev.cardPosts.filter((p) => p._id !== item._id)
              : prev.cardPosts,
        }));
      } else {
        showToast(data.message || "Delete failed", "error");
      }
    } catch {
      showToast("Delete failed", "error");
    }
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!categoryData) return null;

  const { category, subcategories } = categoryData;

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, minHeight: "100vh" }}>
      {/* Category Header */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 3,
          background: "linear-gradient(135deg, #fff 60%, #ffe0e0 100%)",
        }}
      >
        <Avatar
          src={category.iconUrl}
          alt={category.name}
          sx={{ width: 80, height: 80, border: "2px solid #800000" }}
        />
        <Box flex={1}>
          <Typography variant="h4" fontWeight={900} color="#800000">
            {category.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={1}>
            {category.description || "No description"}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={category.isVisibleOnHome ? "Visible on Home" : "Hidden"}
              color={category.isVisibleOnHome ? "success" : "default"}
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() =>
                navigate(`/category/edit-category/${category.slug}`)
              }
              sx={{ color: "#800000", borderColor: "#800000" }}
            >
              Edit Category
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Subcategory Filter */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        <Chip
          label="All"
          color={selectedSub === "all" ? "primary" : "default"}
          onClick={() => setSelectedSub("all")}
          sx={{ fontWeight: 700 }}
        />
        {subcategories.map((sub) => (
          <Chip
            key={sub._id}
            label={sub.name}
            color={selectedSub === sub.slug ? "primary" : "default"}
            onClick={() => setSelectedSub(sub.slug)}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Stack>

      {/* Tabs for content types */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Posts" />
        <Tab label="Table Posts" />
        <Tab label="Card Posts" />
      </Tabs>

      {/* Posts Tab */}
      {tab === 0 && (
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" color="#800000">
              Posts
            </Typography>
            <Button
              variant="contained"
              sx={{ background: "#800000" }}
              onClick={() => navigate("/dashboard/create-post")}
            >
              Add Post
            </Button>
          </Stack>
          {filteredPosts.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No posts found.
            </Typography>
          ) : (
            <Stack direction="row" flexWrap="wrap" gap={2}>
              {filteredPosts.map((post) => (
                <Card key={post._id} sx={{ width: 320, position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={post.imageUrl}
                    alt={post.title}
                  />
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="#800000"
                      fontWeight={700}
                    >
                      {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.subCategory?.name}
                    </Typography>
                  </CardContent>
                  <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                    <IconButton
                      onClick={(e) =>
                        handleMenuOpen(e, { ...post, type: "post" })
                      }
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Table Posts Tab */}
      {tab === 1 && (
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" color="#800000">
              Table Posts
            </Typography>
            <Button
              variant="contained"
              sx={{ background: "#800000" }}
              onClick={() => navigate("/TablePostCreate")}
            >
              Add Table Post
            </Button>
          </Stack>
          {filteredTablePosts.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No table posts found.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Subcategory</TableCell>
                    <TableCell>Rows</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTablePosts.map((tp) => (
                    <TableRow key={tp._id}>
                      <TableCell>{tp.name}</TableCell>
                      <TableCell>{tp.subCategory?.name}</TableCell>
                      <TableCell>
                        {tp.rowData?.map((row, idx) =>
                          row.isLink ? (
                            <a
                              key={row._id}
                              href={row.row}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginRight: 8 }}
                            >
                              Link {idx + 1}
                            </a>
                          ) : (
                            <span key={row._id} style={{ marginRight: 8 }}>
                              {row.row}
                            </span>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(tp.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() =>
                              navigate(`/table-post/edit/${tp.slug}`)
                            }
                            size="small"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteRequest("table", tp)}
                            size="small"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Card Posts Tab */}
      {tab === 2 && (
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" color="#800000">
              Card Posts
            </Typography>
            <Button
              variant="contained"
              sx={{ background: "#800000" }}
              onClick={() => navigate("/card-create")}
            >
              Add Card Post
            </Button>
          </Stack>
          {filteredCardPosts.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No card posts found.
            </Typography>
          ) : (
            <Stack direction="row" flexWrap="wrap" gap={2}>
              {filteredCardPosts.map((card) => (
                <Card key={card._id} sx={{ width: 320, position: "relative" }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="#800000"
                      fontWeight={700}
                    >
                      {card.cardHeading}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.subCategory?.name}
                    </Typography>
                  </CardContent>
                  <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                    <IconButton
                      onClick={(e) =>
                        handleMenuOpen(e, { ...card, type: "card" })
                      }
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Edit/Delete Menu for Posts and Cards */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (menuItem?.type === "post") {
              navigate(`/posts/edit/${menuItem._id}`);
            } else if (menuItem?.type === "card") {
              navigate(`/card-edit/${menuItem.slug}`);
            }
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteRequest(menuItem?.type, menuItem)}
          sx={{ color: "error.main" }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Confirm Dialog for Delete */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Confirmation"
        content="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
