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

export function CardManagement() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fetch cards from backend
  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/card/get-all-card-posts`, {
          credentials: "include"
        });
        const data = await res.json();
        console.log(data);
        if (data.success) {
          setCards(data.data || []);
        } else {
          showToast(data.message || "Failed to fetch cards", "error");
        }
      } catch (error) {
        showToast("Error fetching cards", error);
      }
      setLoading(false);
    }
    fetchCards();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/card/${slug}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Card deleted!", "success");
        setCards((prev) => prev.filter((c) => c.slug !== slug));
      } else {
        showToast(data.message || "Failed to delete card", "error");
      }
    } catch (error) {
      showToast("Error deleting card", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f4f0e4 0%, #e0eafc 100%)",
        px: { xs: 1, sm: 6 },
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
          sx={{ fontWeight: 900, color: "#1a237e", letterSpacing: 1 }}
        >
          Card Management
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #1a237e 60%, #64b5f6 100%)",
            color: "#fff",
            fontWeight: 700,
            borderRadius: 3,
            px: 3,
            boxShadow: "0 2px 12px #90caf9",
            "&:hover": { background: "#0d1333" }
          }}
          onClick={() => navigate("/card-create")}
        >
          + Create Card
        </Button>
      </Stack>
      <Fade in>
        <Grid container spacing={4}>
          {loading ? (
            <Grid item xs={12}>
              <Typography align="center" sx={{ color: "#1a237e" }}>
                Loading cards...
              </Typography>
            </Grid>
          ) : cards.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" sx={{ color: "#1a237e" }}>
                No cards found.
              </Typography>
            </Grid>
          ) : (
            cards.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.slug}>
                <Card
                  elevation={8}
                  sx={{
                    borderRadius: 5,
                    background:
                      "linear-gradient(135deg, #fff 60%, #e3f2fd 100%)",
                    boxShadow: "0 8px 32px rgba(26,35,126,0.10)",
                    minHeight: 260,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "box-shadow 0.3s",
                    "&:hover": { boxShadow: "0 12px 36px #90caf9" }
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      <Chip
                        label={card.parentSlug}
                        color="primary"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: "#1a237e",
                          color: "#fff"
                        }}
                      />
                      <Chip
                        label={card.subCategorySlug}
                        color="secondary"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: "#64b5f6",
                          color: "#1a237e"
                        }}
                      />
                    </Stack>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: "#1a237e",
                        mb: 1,
                        letterSpacing: 1
                      }}
                    >
                      {card.cardHeading}
                    </Typography>
                    <Typography
                      sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}
                    >
                      {card.topField}
                    </Typography>
                    <Typography sx={{ color: "#333", mb: 1 }}>
                      {card.middleField}
                    </Typography>
                    {card.downloadLink && card.downloadLink.link && (
                      <MuiLink
                        href={card.downloadLink.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          color: "#1565c0",
                          fontWeight: 700,
                          mt: 1,
                          "&:hover": {
                            textDecoration: "underline",
                            color: "#0d1333"
                          }
                        }}
                      >
                        <Download sx={{ mr: 0.5 }} fontSize="small" />
                        Download
                        {card.downloadLink.link_type === "external" && (
                          <OpenInNew sx={{ ml: 0.5 }} fontSize="small" />
                        )}
                      </MuiLink>
                    )}
                  </CardContent>
                  <CardActions
                    sx={{ justifyContent: "flex-end", pb: 2, pr: 2 }}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/card-edit/${card.slug}`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(card.slug)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Fade>
    </Box>
  );
}
