// src/components/dashboard/SummaryCard.jsx
import { Card, CardContent, Typography, Box, keyframes } from "@mui/material";

const SummaryCard = ({ title, value, icon }) => {
  console.log("value => " + value);
  // Pulse animation for the icon
  const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

  return (
    <Card
      elevation={3}
      sx={{
        flex: 1,
        border: "2px solid #a0522d",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(128, 0, 0, 0.15)",
        backgroundColor: "#fffaf2",
        width: "100%",
        height: 170,
        transition: "all 0.3s ease-in-out",
        cursor: "pointer",
        background: "linear-gradient(135deg, #fffaf2 0%, #f4f0e4 100%)",

        "&:hover": {
          background: "linear-gradient(135deg, #fdf9f5 0%, #fff8ed 100%)",
          boxShadow: "0 8px 24px rgba(128, 0, 0, 0.3)",
          transform: "translateY(-5px)"
        },

        "&:hover .icon": {
          animation: `${pulse} 0.8s ease-in-out`
        }
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          color="#4b0000"
          fontWeight="bold"
          fontSize="24px"
        >
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="400" color="#1a1a1a">
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: "#800000" }}>{icon}</Box>
    </Card>
  );
};

export default SummaryCard;
