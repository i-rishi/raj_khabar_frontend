// /components/PostForm/PostForm.jsx
import { useFormContext, Controller } from "react-hook-form";
import { Box, Button, Paper } from "@mui/material";
import { PostFields } from "../PostFields/PostFields";
import { useToast } from "../../context/ToastContext";
import { useNavigate, useLocation } from "react-router-dom";

export function PostForm({ onSubmit, post }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    control,
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
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            sx={{
              backgroundColor: "#800000",
              "&:hover": {
                backgroundColor: "#600000",
              },
            }}
          >
            {post ? "Update Post" : "Submit Post"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/posts", { state: location.state })}
            sx={{
              color: "#800000",
              borderColor: "#800000",
              "&:hover": {
                borderColor: "#600000",
                backgroundColor: "rgba(128, 0, 0, 0.04)",
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
