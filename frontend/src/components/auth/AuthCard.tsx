"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Link,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme as useMacTheme } from "../../theme/MacThemeProvider";

interface AuthCardProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

export default function AuthCard({ isSignUp, onToggleMode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isLoading, isAuthenticated } = useAuth();
  const { isDarkMode } = useMacTheme();
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    nationality: "",
    phoneCountryCode: "",
    phoneNumber: "",
  });

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      
      await login({
        email: formData.email,
        password: formData.password,
      });

      router.push(callbackUrl);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Validate username
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    // Validate username format (letters, numbers, and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    // Validate username length
    if (formData.username.length < 3 || formData.username.length > 50) {
      setError("Username must be between 3 and 50 characters long");
      return;
    }

    try {
      setError("");
      
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        nationality: formData.nationality || undefined,
        phoneNumber: formData.phoneCountryCode && formData.phoneNumber 
          ? `${formData.phoneCountryCode}${formData.phoneNumber}` 
          : undefined,
      });

      router.push(callbackUrl);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggleMode();
      setIsAnimating(false);
    }, 150);
  };

  const handleSubmit = isSignUp ? handleSignUp : handleCredentialsSignIn;

  return (
    <Card 
      elevation={8}
      sx={{ 
        maxWidth: isSignUp ? 450 : 380, 
        mx: "auto",
        borderRadius: 3,
        overflow: "hidden",
        background: isDarkMode ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
        color: isDarkMode ? "#ffffff" : "#1a1a1a",
        transition: "all 0.3s ease-in-out",
        opacity: isAnimating ? 0.7 : 1,
        transform: isAnimating ? "translateY(10px) scale(0.98)" : "translateY(0) scale(1)",
        "&:hover": {
          transform: isAnimating ? "translateY(10px) scale(0.98)" : "translateY(-2px) scale(1)",
          boxShadow: isDarkMode ? "0 12px 24px rgba(0, 0, 0, 0.3)" : "0 12px 24px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 2.5 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: isDarkMode ? "#ffffff" : "#1a1a1a" }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Typography>
          <Typography variant="body1" sx={{ color: isDarkMode ? "#cccccc" : "#666666", fontSize: "0.95rem" }}>
            {isSignUp ? "Join OOPLab today" : "Sign in to your OOPLab account"}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<GoogleIcon />}
          sx={{
            mb: 1.5,
            py: 1.5,
            borderRadius: 2,
            borderColor: "#4285F4",
            color: "#4285F4",
            fontWeight: 600,
            fontSize: "1rem",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(66, 133, 244, 0.04)",
              borderColor: "#3367D6",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Continue with Google"
          )}
        </Button>

        <Divider sx={{ my: 1.5 }}>
          <Typography variant="body2" sx={{ color: isDarkMode ? "#cccccc" : "#666666", fontWeight: 500 }}>
            OR
          </Typography>
        </Divider>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.5}>
            {/* Name Fields - Only for Sign Up */}
            {isSignUp && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  variant="outlined"
                  disabled={isLoading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      color: isDarkMode ? "#ffffff" : "#000000",
                      backgroundColor: `${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"} !important`,
                      "& fieldset": {
                        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover fieldset": {
                        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#007AFF",
                      },
                      "&.Mui-focused": {
                        backgroundColor: `${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"} !important`,
                      },
                      "&:hover": {
                        backgroundColor: `${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"} !important`,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#007AFF",
                    },
                    "& .MuiInputBase-input": {
                      color: isDarkMode ? "#ffffff" : "#000000",
                    },
                  }}
                />
                <TextField
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  variant="outlined"
                  disabled={isLoading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      color: isDarkMode ? "#ffffff" : "#000000",
                      backgroundColor: `${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"} !important`,
                      "& fieldset": {
                        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover fieldset": {
                        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#007AFF",
                      },
                      "&.Mui-focused": {
                        backgroundColor: `${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"} !important`,
                      },
                      "&:hover": {
                        backgroundColor: `${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"} !important`,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#007AFF",
                    },
                    "& .MuiInputBase-input": {
                      color: isDarkMode ? "#ffffff" : "#000000",
                    },
                  }}
                />
              </Box>
            )}

            {/* Email */}
            <TextField
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              fullWidth
              variant="outlined"
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {/* Username - Only for Sign Up */}
            {isSignUp && (
              <TextField
                id="username"
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                helperText="3-50 characters, letters, numbers, and underscores only"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}

            {/* Password Fields */}
            <TextField
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              fullWidth
              variant="outlined"
              disabled={isLoading}
              helperText={isSignUp ? "Must be at least 6 characters" : undefined}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {/* Confirm Password - Only for Sign Up */}
            {isSignUp && (
              <TextField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}

            {/* Optional Fields - Only for Sign Up */}
            {isSignUp && (
              <>
                <FormControl fullWidth disabled={isLoading}>
                  <InputLabel>Nationality (Optional)</InputLabel>
                  <Select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    label="Nationality (Optional)"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">Select Nationality</MenuItem>
                    <MenuItem value="Afghanistan">Afghanistan</MenuItem>
                    <MenuItem value="Albania">Albania</MenuItem>
                    <MenuItem value="Algeria">Algeria</MenuItem>
                    <MenuItem value="Argentina">Argentina</MenuItem>
                    <MenuItem value="Australia">Australia</MenuItem>
                    <MenuItem value="Austria">Austria</MenuItem>
                    <MenuItem value="Bangladesh">Bangladesh</MenuItem>
                    <MenuItem value="Belgium">Belgium</MenuItem>
                    <MenuItem value="Brazil">Brazil</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="China">China</MenuItem>
                    <MenuItem value="Denmark">Denmark</MenuItem>
                    <MenuItem value="Egypt">Egypt</MenuItem>
                    <MenuItem value="Finland">Finland</MenuItem>
                    <MenuItem value="France">France</MenuItem>
                    <MenuItem value="Germany">Germany</MenuItem>
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="Indonesia">Indonesia</MenuItem>
                    <MenuItem value="Italy">Italy</MenuItem>
                    <MenuItem value="Japan">Japan</MenuItem>
                    <MenuItem value="Malaysia">Malaysia</MenuItem>
                    <MenuItem value="Mexico">Mexico</MenuItem>
                    <MenuItem value="Netherlands">Netherlands</MenuItem>
                    <MenuItem value="Nigeria">Nigeria</MenuItem>
                    <MenuItem value="Norway">Norway</MenuItem>
                    <MenuItem value="Pakistan">Pakistan</MenuItem>
                    <MenuItem value="Philippines">Philippines</MenuItem>
                    <MenuItem value="Poland">Poland</MenuItem>
                    <MenuItem value="Russia">Russia</MenuItem>
                    <MenuItem value="Saudi Arabia">Saudi Arabia</MenuItem>
                    <MenuItem value="Singapore">Singapore</MenuItem>
                    <MenuItem value="South Africa">South Africa</MenuItem>
                    <MenuItem value="South Korea">South Korea</MenuItem>
                    <MenuItem value="Spain">Spain</MenuItem>
                    <MenuItem value="Sweden">Sweden</MenuItem>
                    <MenuItem value="Switzerland">Switzerland</MenuItem>
                    <MenuItem value="Thailand">Thailand</MenuItem>
                    <MenuItem value="Turkey">Turkey</MenuItem>
                    <MenuItem value="Ukraine">Ukraine</MenuItem>
                    <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                    <MenuItem value="United States">United States</MenuItem>
                    <MenuItem value="Vietnam">Vietnam</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                {/* Phone Number with Country Code */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <FormControl sx={{ minWidth: 120 }} disabled={isLoading}>
                    <InputLabel>Country Code</InputLabel>
                    <Select
                      name="phoneCountryCode"
                      value={formData.phoneCountryCode}
                      onChange={handleInputChange}
                      label="Country Code"
                      sx={{
                        borderRadius: 2,
                      }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="+1">🇺🇸 +1</MenuItem>
                      <MenuItem value="+44">🇬🇧 +44</MenuItem>
                      <MenuItem value="+49">🇩🇪 +49</MenuItem>
                      <MenuItem value="+33">🇫🇷 +33</MenuItem>
                      <MenuItem value="+39">🇮🇹 +39</MenuItem>
                      <MenuItem value="+34">🇪🇸 +34</MenuItem>
                      <MenuItem value="+31">🇳🇱 +31</MenuItem>
                      <MenuItem value="+32">🇧🇪 +32</MenuItem>
                      <MenuItem value="+41">🇨🇭 +41</MenuItem>
                      <MenuItem value="+43">🇦🇹 +43</MenuItem>
                      <MenuItem value="+45">🇩🇰 +45</MenuItem>
                      <MenuItem value="+46">🇸🇪 +46</MenuItem>
                      <MenuItem value="+47">🇳🇴 +47</MenuItem>
                      <MenuItem value="+358">🇫🇮 +358</MenuItem>
                      <MenuItem value="+7">🇷🇺 +7</MenuItem>
                      <MenuItem value="+86">🇨🇳 +86</MenuItem>
                      <MenuItem value="+81">🇯🇵 +81</MenuItem>
                      <MenuItem value="+82">🇰🇷 +82</MenuItem>
                      <MenuItem value="+91">🇮🇳 +91</MenuItem>
                      <MenuItem value="+92">🇵🇰 +92</MenuItem>
                      <MenuItem value="+880">🇧🇩 +880</MenuItem>
                      <MenuItem value="+94">🇱🇰 +94</MenuItem>
                      <MenuItem value="+977">🇳🇵 +977</MenuItem>
                      <MenuItem value="+60">🇲🇾 +60</MenuItem>
                      <MenuItem value="+65">🇸🇬 +65</MenuItem>
                      <MenuItem value="+66">🇹🇭 +66</MenuItem>
                      <MenuItem value="+84">🇻🇳 +84</MenuItem>
                      <MenuItem value="+63">🇵🇭 +63</MenuItem>
                      <MenuItem value="+62">🇮🇩 +62</MenuItem>
                      <MenuItem value="+61">🇦🇺 +61</MenuItem>
                      <MenuItem value="+64">🇳🇿 +64</MenuItem>
                      <MenuItem value="+55">🇧🇷 +55</MenuItem>
                      <MenuItem value="+54">🇦🇷 +54</MenuItem>
                      <MenuItem value="+56">🇨🇱 +56</MenuItem>
                      <MenuItem value="+57">🇨🇴 +57</MenuItem>
                      <MenuItem value="+51">🇵🇪 +51</MenuItem>
                      <MenuItem value="+52">🇲🇽 +52</MenuItem>
                      <MenuItem value="+1">🇨🇦 +1</MenuItem>
                      <MenuItem value="+27">🇿🇦 +27</MenuItem>
                      <MenuItem value="+20">🇪🇬 +20</MenuItem>
                      <MenuItem value="+234">🇳🇬 +234</MenuItem>
                      <MenuItem value="+254">🇰🇪 +254</MenuItem>
                      <MenuItem value="+233">🇬🇭 +233</MenuItem>
                      <MenuItem value="+212">🇲🇦 +212</MenuItem>
                      <MenuItem value="+213">🇩🇿 +213</MenuItem>
                      <MenuItem value="+216">🇹🇳 +216</MenuItem>
                      <MenuItem value="+218">🇱🇾 +218</MenuItem>
                      <MenuItem value="+220">🇬🇲 +220</MenuItem>
                      <MenuItem value="+221">🇸🇳 +221</MenuItem>
                      <MenuItem value="+222">🇲🇷 +222</MenuItem>
                      <MenuItem value="+223">🇲🇱 +223</MenuItem>
                      <MenuItem value="+224">🇬🇳 +224</MenuItem>
                      <MenuItem value="+225">🇨🇮 +225</MenuItem>
                      <MenuItem value="+226">🇧🇫 +226</MenuItem>
                      <MenuItem value="+227">🇳🇪 +227</MenuItem>
                      <MenuItem value="+228">🇹🇬 +228</MenuItem>
                      <MenuItem value="+229">🇧🇯 +229</MenuItem>
                      <MenuItem value="+230">🇲🇺 +230</MenuItem>
                      <MenuItem value="+231">🇱🇷 +231</MenuItem>
                      <MenuItem value="+232">🇸🇱 +232</MenuItem>
                      <MenuItem value="+233">🇬🇭 +233</MenuItem>
                      <MenuItem value="+234">🇳🇬 +234</MenuItem>
                      <MenuItem value="+235">🇹🇩 +235</MenuItem>
                      <MenuItem value="+236">🇨🇫 +236</MenuItem>
                      <MenuItem value="+237">🇨🇲 +237</MenuItem>
                      <MenuItem value="+238">🇨🇻 +238</MenuItem>
                      <MenuItem value="+239">🇸🇹 +239</MenuItem>
                      <MenuItem value="+240">🇬🇶 +240</MenuItem>
                      <MenuItem value="+241">🇬🇦 +241</MenuItem>
                      <MenuItem value="+242">🇨🇬 +242</MenuItem>
                      <MenuItem value="+243">🇨🇩 +243</MenuItem>
                      <MenuItem value="+244">🇦🇴 +244</MenuItem>
                      <MenuItem value="+245">🇬🇼 +245</MenuItem>
                      <MenuItem value="+246">🇮🇴 +246</MenuItem>
                      <MenuItem value="+247">🇦🇨 +247</MenuItem>
                      <MenuItem value="+248">🇸🇨 +248</MenuItem>
                      <MenuItem value="+249">🇸🇩 +249</MenuItem>
                      <MenuItem value="+250">🇷🇼 +250</MenuItem>
                      <MenuItem value="+251">🇪🇹 +251</MenuItem>
                      <MenuItem value="+252">🇸🇴 +252</MenuItem>
                      <MenuItem value="+253">🇩🇯 +253</MenuItem>
                      <MenuItem value="+254">🇰🇪 +254</MenuItem>
                      <MenuItem value="+255">🇹🇿 +255</MenuItem>
                      <MenuItem value="+256">🇺🇬 +256</MenuItem>
                      <MenuItem value="+257">🇧🇮 +257</MenuItem>
                      <MenuItem value="+258">🇲🇿 +258</MenuItem>
                      <MenuItem value="+260">🇿🇲 +260</MenuItem>
                      <MenuItem value="+261">🇲🇬 +261</MenuItem>
                      <MenuItem value="+262">🇷🇪 +262</MenuItem>
                      <MenuItem value="+263">🇿🇼 +263</MenuItem>
                      <MenuItem value="+264">🇳🇦 +264</MenuItem>
                      <MenuItem value="+265">🇲🇼 +265</MenuItem>
                      <MenuItem value="+266">🇱🇸 +266</MenuItem>
                      <MenuItem value="+267">🇧🇼 +267</MenuItem>
                      <MenuItem value="+268">🇸🇿 +268</MenuItem>
                      <MenuItem value="+269">🇰🇲 +269</MenuItem>
                      <MenuItem value="+290">🇸🇭 +290</MenuItem>
                      <MenuItem value="+291">🇪🇷 +291</MenuItem>
                      <MenuItem value="+297">🇦🇼 +297</MenuItem>
                      <MenuItem value="+298">🇫🇴 +298</MenuItem>
                      <MenuItem value="+299">🇬🇱 +299</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    name="phoneNumber"
                    label="Phone Number (Optional)"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    disabled={isLoading}
                    placeholder="1234567890"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                backgroundColor: "#007AFF",
                "&:hover": {
                  backgroundColor: "#0056CC",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </Stack>
        </Box>

        {/* Toggle Link */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: isDarkMode ? "#cccccc" : "#666666" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              component="button"
              onClick={handleToggleMode}
              sx={{
                color: "#007AFF",
                textDecoration: "none",
                fontWeight: 600,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  textDecoration: "underline",
                  transform: "scale(1.05)",
                },
              }}
            >
              {isSignUp ? "Sign in here" : "Create one now"}
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
