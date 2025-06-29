/* eslint-disable no-unused-vars */
// /components/PostForm/PostForm.jsx
import { useFormContext, Controller } from "react-hook-form";
import { Box, Button, Paper } from "@mui/material";
import { PostFields } from "../PostFields/PostFields";
import { useToast } from "../../context/ToastContext";

export function PostForm({ onSubmit, post }) {
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
        <Box sx={{ mt: 3 }}>
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
            Submit Post
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
