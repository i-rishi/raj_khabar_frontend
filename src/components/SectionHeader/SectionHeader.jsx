import { Typography, Divider, Box } from "@mui/material";

export function SectionHeader({ title, subtitle, icon }) {
  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {icon && (
          <Box sx={{ mr: 4, fontSize: 28, color: "#800000", ml: 4 }}>
            {icon}
          </Box>
        )}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#800000"
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Divider
        sx={{
          borderBottomWidth: 3,
          backgroundColor: "#a0522d",
          width: "100%"
        }}
      />
    </Box>
  );
}
