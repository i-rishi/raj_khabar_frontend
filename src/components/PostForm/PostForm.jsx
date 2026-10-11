// /components/PostForm/PostForm.jsx
import { useFormContext } from "react-hook-form";
import { Box, Button, Paper, CircularProgress } from "@mui/material";
import { PostFields } from "../PostFields/PostFields";
import { useNavigate, useLocation } from "react-router-dom";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";

export function PostForm({ onSubmit, onSaveDraft, isSavingDraft, post }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  return (
    <Paper
      sx={{
        mt: 3,
        p: 3,
        backgroundColor: "#f4f0e4",
        borderRadius: "10px",
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <PostFields
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          post={post}
        />
        <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant="contained"
            type="submit"
            sx={{
              backgroundColor: "#800000",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#600000",
              },
            }}
          >
            {post ? "Update Post" : "Submit Post"}
          </Button>

          {onSaveDraft && (
            <Button
              variant="outlined"
              type="button"
              onClick={onSaveDraft}
              disabled={isSavingDraft}
              startIcon={
                isSavingDraft ? (
                  <CircularProgress size={16} sx={{ color: "#800000" }} />
                ) : (
                  <BookmarkBorderRoundedIcon />
                )
              }
              sx={{
                color: "#800000",
                borderColor: "#800000",
                fontWeight: 600,
                textTransform: "none",
                px: 2.5,
                py: 1,
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#600000",
                  backgroundColor: "rgba(128, 0, 0, 0.06)",
                },
              }}
            >
              {isSavingDraft ? "Saving Draft..." : "Save as Draft"}
            </Button>
          )}

          <Button
            variant="outlined"
            type="button"
            onClick={() => navigate("/posts", { state: location.state })}
            sx={{
              color: "#555",
              borderColor: "#bbb",
              fontWeight: 600,
              textTransform: "none",
              px: 2.5,
              py: 1,
              borderRadius: "8px",
              "&:hover": {
                borderColor: "#888",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
