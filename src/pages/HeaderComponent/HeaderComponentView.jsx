import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubCategoryIcon,
  OpenInNew as OpenInNewIcon
} from "@mui/icons-material";
import { ConfirmDialog } from "../../components/Dialog/Dialog";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useNavigate, useParams } from "react-router-dom";

export function HeaderComponentView() {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch component data
  useEffect(() => {
    const fetchComponent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/component/header/components/${id}`,
          {
            credentials: "include"
          }
        );

        const data = await response.json();

        if (data.success) {
          setComponent(data.data);
        } else {
          showToast(
            data.message || "Failed to fetch header component",
            "error"
          );
          navigate("/header-component/management");
        }
      } catch (error) {
        console.error("Error fetching header component:", error);
        showToast("Error fetching header component", "error");
        navigate("/header-component/management");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComponent();
    }
  }, [id, showToast, navigate]);

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/header/components/${id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast("Header component deleted successfully", "success");
        navigate("/header-component/management");
      } else {
        showToast(data.message || "Failed to delete header component", "error");
      }
    } catch (error) {
      console.error("Error deleting header component:", error);
      showToast("Error deleting header component", "error");
    } finally {
      setConfirmOpen(false);
    }
  };

  const getLinkTypeColor = (linkType) => {
    switch (linkType) {
      case "web-view":
        return "#1976d2";
      case "external":
        return "#2e7d32";
      case "internal":
        return "#ed6c02";
      case "pdf":
        return "#d32f2f";
      default:
        return "#757575";
    }
  };

  const getLinkTypeLabel = (linkType) => {
    switch (linkType) {
      case "web-view":
        return "Web View";
      case "external":
        return "External";
      case "internal":
        return "Internal";
      case "pdf":
        return "PDF";
      default:
        return linkType;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: "#800000" }} />
      </Box>
    );
  }

  if (!component) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Component not found
        </Typography>
      </Box>
    );
  }

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
          maxWidth: 800,
          mx: "auto",
          p: 4,
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)"
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/header-component/management")}
              sx={{ color: "#800000" }}
            >
              Back
            </Button>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#800000",
                letterSpacing: 1
              }}
            >
              Header Component Details
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit Component">
              <IconButton
                onClick={() =>
                  navigate(`/header-component/edit/${component._id}`)
                }
                sx={{ color: "#800000" }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Component">
              <IconButton onClick={handleDelete} sx={{ color: "#d32f2f" }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Component Information */}
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: "#fffaf5", height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: "#800000", mb: 2, fontWeight: 600 }}
                >
                  Basic Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {component.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Slug
                    </Typography>
                    <Chip
                      label={component.slug}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: "#800000", color: "#800000" }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Heading
                    </Typography>
                    <Typography variant="body1">{component.heading}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Link Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: "#fffaf5", height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: "#800000", mb: 2, fontWeight: 600 }}
                >
                  Link Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Link Type
                    </Typography>
                    <Chip
                      label={getLinkTypeLabel(component.link.link_type)}
                      size="small"
                      sx={{
                        background: getLinkTypeColor(component.link.link_type),
                        color: "#fff",
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Link URL
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {component.link.link}
                      </Typography>
                      <Tooltip title="Open Link">
                        <IconButton
                          size="small"
                          onClick={() =>
                            window.open(component.link.link, "_blank")
                          }
                          sx={{ color: "#800000" }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: "#fffaf5", height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: "#800000", mb: 2, fontWeight: 600 }}
                >
                  Category Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Parent Category
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CategoryIcon sx={{ fontSize: 16, color: "#800000" }} />
                      <Typography variant="body1">
                        {component.parentCategory?.name || component.parentSlug}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Subcategory
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SubCategoryIcon
                        sx={{ fontSize: 16, color: "#800000" }}
                      />
                      <Typography variant="body1">
                        {component.subCategory?.name ||
                          component.subCategorySlug}
                      </Typography>
                      <Chip
                        label="Table Type"
                        size="small"
                        sx={{
                          background: "#4caf50",
                          color: "#fff",
                          fontSize: "0.7rem"
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Metadata */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: "#fffaf5", height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: "#800000", mb: 2, fontWeight: 600 }}
                >
                  Metadata
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Component ID
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {component._id}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(component.createdAt)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(component.updatedAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmOpen}
          title="Delete Header Component"
          content={`Are you sure you want to delete "${component.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </Paper>
    </Box>
  );
}
