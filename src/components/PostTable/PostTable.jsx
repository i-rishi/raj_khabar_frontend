import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Box,
  Paper,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography
} from "@mui/material";
import { MdEdit, MdDelete, MdVisibility, MdClose } from "react-icons/md";

export function PostTable({ posts, onView, onEdit, onDelete, onAddPost }) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("title");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState("");
  const [previewPost, setPreviewPost] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(filter.toLowerCase()) ||
      post.description.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedPosts = filteredPosts.sort((a, b) => {
    const valA = a[orderBy].toLowerCase();
    const valB = b[orderBy].toLowerCase();
    return order === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const paginatedPosts = sortedPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper
      sx={{
        mt: 3,
        p: 2,
        backgroundColor: "#f4f0e4",
        borderRadius: "10px"
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <TextField
            label="Search Posts"
            variant="outlined"
            value={filter}
            onChange={handleFilterChange}
            sx={{
              backgroundColor: "#f4f0e4",
              width: "80%",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#800000" },
                "&:hover fieldset": { borderColor: "#a0522d" },
                "&.Mui-focused fieldset": { borderColor: "#800000" }
              },
              "& label": { color: "#800000" },
              "& label.Mui-focused": { color: "#800000" }
            }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#800000",
              "&:hover": { backgroundColor: "#a00000" },
              textTransform: "none"
            }}
            onClick={onAddPost}
          >
            Add Post
          </Button>
        </Stack>

        <TableContainer
          component={Paper}
          sx={{ backgroundColor: "#f4f0e4", border: "1px solid #800000" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#800000" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "title"}
                    direction={orderBy === "title" ? order : "asc"}
                    onClick={() => handleRequestSort("title")}
                    sx={{ color: "#fff", "&.Mui-active": { color: "#fff" } }}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "description"}
                    direction={orderBy === "description" ? order : "asc"}
                    onClick={() => handleRequestSort("description")}
                    sx={{ color: "#fff", "&.Mui-active": { color: "#fff" } }}
                  >
                    Description
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPosts.map((post, index) => (
                <TableRow
                  hover
                  key={index}
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "#fceee4"
                    }
                  }}
                >
                  <TableCell sx={{ color: "#1a1a1a" }}>{post.title}</TableCell>
                  <TableCell sx={{ color: "#333" }}>
                    {post.description}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <MdVisibility
                        onClick={() => {
                          setPreviewPost(post);
                          if (onView) onView(post);
                        }}
                        style={{ cursor: "pointer" }}
                        size={24}
                        className="action-icon"
                      />
                      <MdEdit
                        onClick={() => onEdit(post)}
                        style={{ cursor: "pointer" }}
                        size={24}
                        className="action-icon"
                      />
                      <MdDelete
                        onClick={() => onDelete(post)}
                        style={{ cursor: "pointer" }}
                        size={24}
                        className="action-icon"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPosts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            backgroundColor: "#f4f0e4",
            color: "#800000",
            "& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                color: "#800000"
              }
          }}
        />
      </Box>

      {/* Post Preview Modal */}
      {previewPost && (
        <Dialog
          open={Boolean(previewPost)}
          onClose={() => setPreviewPost(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "#fefdfa",
              borderRadius: "12px",
            }
          }}
        >
          <DialogTitle sx={{ m: 0, p: 2, backgroundColor: "#800000", color: "#fff", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              Post Preview
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setPreviewPost(null)}
              sx={{ color: "#fff" }}
            >
              <MdClose size={24} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 4 }}>
            <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
              {/* Category */}
              {previewPost.category && (
                <Typography variant="overline" sx={{ color: "#a0522d", fontWeight: "bold" }}>
                  {previewPost.category.name || previewPost.categorySlug || "Category"}
                </Typography>
              )}

              {/* Title */}
              <Typography variant="h3" sx={{ fontWeight: "bold", mt: 1, mb: 2, color: "#1a1a1a", fontSize: { xs: "2rem", md: "2.5rem" } }}>
                {previewPost.title}
              </Typography>

              {/* Date */}
              <Typography variant="subtitle2" sx={{ color: "#666", mb: 3 }}>
                Published on {new Date(previewPost.publishedAt || previewPost.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>

              {/* Thumbnail Image */}
              {previewPost.imageUrl && (
                <Box
                  component="img"
                  sx={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "400px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    mb: 4,
                  }}
                  alt={previewPost.title}
                  src={previewPost.imageUrl}
                />
              )}

              {/* Content Rendered as Plain Text */}
              <Box
                className="post-content-preview"
                sx={{
                  color: "#333",
                  lineHeight: 1.8,
                  fontSize: "1.1rem",
                  mt: 4,
                  whiteSpace: "pre-wrap"
                }}
              >
                {(() => {
                  const content = previewPost.content;
                  if (!content) return "";

                  // Try to see if it's JSON from Tiptap
                  let isJson = false;
                  let parsedJson = null;
                  try {
                    if (typeof content === "object") {
                      parsedJson = content;
                      isJson = true;
                    } else if (typeof content === "string" && content.startsWith("{") && content.includes('"type"')) {
                      parsedJson = JSON.parse(content);
                      if (parsedJson && parsedJson.type === "doc") {
                        isJson = true;
                      }
                    }
                  } catch (e) {
                    isJson = false;
                  }

                  if (isJson) {
                    let textResult = "";
                    const traverse = (node) => {
                      if (node.type === "text" && node.text) {
                        textResult += node.text;
                      }
                      if (node.content && Array.isArray(node.content)) {
                        node.content.forEach((child) => traverse(child));
                      }
                      // Add newlines after block level elements
                      if (["paragraph", "heading", "blockquote"].includes(node.type)) {
                        textResult += "\n\n";
                      }
                    };
                    traverse(parsedJson);
                    return textResult.trim();
                  }

                  // If it's a string containing escaped HTML like &lt;p&gt; 
                  // or normal HTML like <p>
                  // We can decode and extract text
                  if (typeof content === "string") {
                    try {
                      // 1. Unescape HTML entities (just in case they are double escaped)
                      const txt = document.createElement("textarea");
                      txt.innerHTML = content;
                      const decodedHTML = txt.value;

                      // 2. Extract plain text from HTML
                      const tempDiv = document.createElement("div");
                      tempDiv.innerHTML = decodedHTML;
                      const text = tempDiv.textContent || tempDiv.innerText || "";
                      return text.trim();
                    } catch (e) {
                      return content;
                    }
                  }
                  
                  return content;
                })()}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Paper>
  );
}
