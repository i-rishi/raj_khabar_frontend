import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import rajkhabar from "../../assets/images/rajkhabar.png";
import Cookies from "js-cookie";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  // const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // if your backend sets httpOnly cookies
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      console.log("Login result:", result);
      setUser(result.user);
      if (result.success && result.token) {
        // Persist token for Authorization header on subsequent requests
        localStorage.setItem("authToken", result.token);
        // Optional: also keep a cookie copy if other code expects it
        Cookies.set("token", result.token, { sameSite: "strict" });
        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again." + error.message);
      console.error("Login error:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(120deg, #fffaf5 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          minWidth: { xs: "90vw", sm: 400 },
          maxWidth: 420,
          background: "#fffaf5",
          border: "1.5px solid #800000",
          boxShadow: "0 8px 32px #80000022",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
            width: "100%"
          }}
        >
          <img
            src={rajkhabar}
            alt="Logo"
            style={{ height: 72, marginBottom: 8 }}
          />
        </Box>
        <Typography
          variant="h6"
          align="center"
          sx={{ color: "#800000", fontWeight: 600, mb: 2, letterSpacing: 1 }}
        >
          Login to Raj Khabar
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#800000" },
                "&:hover fieldset": { borderColor: "#800000" },
                "&.Mui-focused fieldset": { borderColor: "#800000" }
              }
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#800000" },
                "&:hover fieldset": { borderColor: "#800000" },
                "&.Mui-focused fieldset": { borderColor: "#800000" }
              }
            }}
          />
          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              background: "#800000",
              color: "#fffaf5",
              fontWeight: 600,
              "&:hover": { background: "#4d0000" },
              py: 1.2,
              fontSize: 18,
              borderRadius: 2,
              boxShadow: "0 2px 8px #80000022"
            }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
