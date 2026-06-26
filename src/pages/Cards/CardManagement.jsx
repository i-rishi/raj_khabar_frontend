/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Link as MuiLink
} from "@mui/material";
import { Download, Edit, Delete, OpenInNew } from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { ConfirmDialog } from "../../components/Dialog/Dialog";
import Checkbox from "@mui/material/Checkbox";
import BulkDeleteToolbar from "../../components/BulkDeleteToolbar/BulkDeleteToolbar";
import useBulkDelete from "../../hooks/useBulkDelete";

// App theme colors
const PRIMARY = "#800000"; // Rich Crimson/Burgundy
const SECONDARY = "#ffb6b6"; // Soft accent
const BG_GRADIENT = "linear-gradient(135deg, #fcfbf9 0%, #f7f1e5 50%, #fbebeb 100%)";

export function CardManagement() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Bulk selection hook
  const {
    selectedItems,
    selectedCount,
    isLoading: isBulkDeleting,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    performBulkDelete,
  } = useBulkDelete(
    'cards',
    () => {
      showToast('Selected cards deleted', 'success');
      fetchCards();
    },
    (err) => showToast(err?.message || 'Failed to delete selected cards', 'error')
  );

  // Fetch cards from backend
  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/card/get-all-card-posts`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setCards(data.data || []);
      } else {
        showToast(data.message || "Failed to fetch cards", "error");
      }
    } catch (error) {
      showToast("Error fetching cards", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line
  }, []);

  const handleSelectAll = () => {
    selectAll(cards.map((c) => c._id));
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/card/delete/${deleteId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Card deleted!", "success");
        setCards((prev) => prev.filter((c) => c._id !== deleteId));
      } else {
        showToast(data.message || "Failed to delete card", "error");
      }
    } catch (error) {
      showToast("Error deleting card", error);
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: BG_GRADIENT,
        px: { xs: 2, sm: 6 },
        py: 6
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            background: `linear-gradient(45deg, ${PRIMARY} 30%, #cc3333 90%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.5px"
          }}
        >
          Card Management
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: PRIMARY,
            color: "#fff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
            py: 1.25,
            boxShadow: `0 4px 14px rgba(128, 0, 0, 0.25)`,
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "#600000",
              boxShadow: `0 6px 20px rgba(128, 0, 0, 0.35)`,
              transform: "translateY(-2px)"
            }
          }}
          onClick={() => navigate("/card-create")}
        >
          + Create Card
        </Button>
      </Stack>

      {selectedCount > 0 && (
        <Box mb={3}>
          <BulkDeleteToolbar
            selectedCount={selectedCount}
            totalCount={cards.length}
            contentType="cards"
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onBulkDelete={performBulkDelete}
            isLoading={isBulkDeleting}
          />
        </Box>
      )}

      <Fade in>
        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12}>
              <Typography align="center" sx={{ color: PRIMARY, py: 8, fontWeight: 600 }}>
                Loading cards...
              </Typography>
            </Grid>
          ) : cards.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" sx={{ color: PRIMARY, py: 8, fontWeight: 600 }}>
                No cards found.
              </Typography>
            </Grid>
          ) : (
            cards.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card._id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(128, 0, 0, 0.08)",
                    boxShadow: "0 10px 30px rgba(128, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)",
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 20px 40px rgba(128, 0, 0, 0.08)",
                      borderColor: "rgba(128, 0, 0, 0.2)"
                    }
                  }}
                >
                  <CardContent
                    onClick={() => toggleSelection(card._id)}
                    sx={{ cursor: 'pointer', p: 3, "&:last-child": { pb: 3 } }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={2}
                    >
                      <Checkbox
                        checked={isSelected(card._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelection(card._id);
                        }}
                        sx={{
                          color: "rgba(128, 0, 0, 0.4)",
                          p: 0,
                          mr: 0.5,
                          '&.Mui-checked': { color: PRIMARY },
                        }}
                      />
                      <Chip
                        label={card.parentSlug}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          textTransform: "uppercase",
                          bgcolor: "rgba(128, 0, 0, 0.06)",
                          color: PRIMARY,
                          borderRadius: "6px",
                          border: "1px solid rgba(128, 0, 0, 0.1)",
                          height: 22
                        }}
                      />
                      <Chip
                        label={card.subCategorySlug}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          textTransform: "uppercase",
                          bgcolor: "rgba(255, 182, 182, 0.25)",
                          color: "#990000",
                          borderRadius: "6px",
                          border: "1px solid rgba(255, 182, 182, 0.4)",
                          height: 22
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: PRIMARY,
                        mb: 1,
                        lineHeight: 1.3
                      }}
                    >
                      {card.cardHeading}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(128, 0, 0, 0.8)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        mb: 1
                      }}
                    >
                      {card.topField}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#4a4a4a",
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {card.middleField}
                    </Typography>

                    {card.link && card.link.link && (
                      <MuiLink
                        href={card.link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          color: "#fff",
                          bgcolor: PRIMARY,
                          borderRadius: "8px",
                          px: 2,
                          py: 0.75,
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          boxShadow: "0 4px 12px rgba(128, 0, 0, 0.15)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "#600000",
                            transform: "scale(1.03)",
                            boxShadow: "0 6px 16px rgba(128, 0, 0, 0.25)"
                          }
                        }}
                      >
                        <Download sx={{ mr: 0.5, fontSize: 16 }} />
                        Download
                        {card.link.link_type === "external" && (
                          <OpenInNew sx={{ ml: 0.5, fontSize: 14 }} />
                        )}
                      </MuiLink>
                    )}
                  </CardContent>

                  <CardActions
                    sx={{
                      justifyContent: "space-between",
                      pb: 2,
                      px: 3,
                      borderTop: "1px solid rgba(128, 0, 0, 0.06)",
                      mt: "auto",
                      background: "rgba(128, 0, 0, 0.01)"
                    }}
                  >
                    <Chip
                      label={isSelected(card._id) ? 'Selected' : ''}
                      size="small"
                      sx={{
                        visibility: isSelected(card._id) ? 'visible' : 'hidden',
                        bgcolor: "rgba(128, 0, 0, 0.08)",
                        color: PRIMARY,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        borderRadius: "6px",
                        height: 22
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton
                          sx={{
                            color: PRIMARY,
                            bgcolor: "rgba(128, 0, 0, 0.04)",
                            p: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              color: "#fff",
                              bgcolor: PRIMARY,
                              transform: "translateY(-2px)"
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/card-edit/${card.slug}`);
                          }}
                        >
                          <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          sx={{
                            color: "#d32f2f",
                            bgcolor: "rgba(211, 47, 47, 0.04)",
                            p: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              color: "#fff",
                              bgcolor: "#d32f2f",
                              transform: "translateY(-2px)"
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(card._id);
                          }}
                          disabled={isBulkDeleting}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Fade>
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Card"
        content="Are you sure you want to delete this card? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
}
