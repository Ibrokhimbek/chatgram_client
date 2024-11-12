import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

interface Props {
  onLoginSuccess: (username: string, token: string) => void;
}

const SignIn: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"email" | "verification">("email");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await axios.post("https://chatgram.gymrat.uz/auth/verifyEmail", {
        email,
      });
      setStep("verification");
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://chatgram.gymrat.uz/auth/verifyCode",
        {
          email,
          code,
        }
      );
      const { token } = response.data.data;
      const username = email.split("@")[0];
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("authToken", token);
      onLoginSuccess(username, token);
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
      sx={{ padding: 3 }}
      maxWidth={400}
    >
      <Typography variant="h4" gutterBottom>
        {step === "email" ? "Sign In" : "Enter Verification Code"}
      </Typography>

      {step === "email" ? (
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
      ) : (
        <TextField
          label="Verification Code"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fullWidth
          required
        />
      )}

      {error && <Typography color="error">{error}</Typography>}

      <Button
        variant="contained"
        color="primary"
        onClick={step === "email" ? handleEmailSubmit : handleCodeSubmit}
        disabled={loading}
        fullWidth
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : step === "email" ? (
          "Next"
        ) : (
          "Verify Code"
        )}
      </Button>
    </Box>
  );
};

export default SignIn;
