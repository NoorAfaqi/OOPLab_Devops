"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { updateProfile as updateProfileApi } from '../../../lib/api';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Person,
  Email,
  Phone,
  Public,
  Cake,
} from '@mui/icons-material';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, token, updateUser, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    nationality: user?.nationality || '',
    phoneCountryCode: '',
    phoneNumber: '',
    profilePicture: user?.profilePicture || '',
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;
    
    // Only redirect to signin if auth is done loading and user is not authenticated
    if (!isLoading && (!user || !token)) {
      router.push('/auth/signin');
      return;
    }
    
    // If user is authenticated, set up form data
    if (user) {
      // Parse phone number if it includes country code
      let phoneCountryCode = '';
      let phoneNumber = '';
      if (user.phoneNumber) {
        // List of common country codes (longest first to avoid partial matches)
        const countryCodes = ['+358', '+880', '+977', '+234', '+254', '+233', '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298', '+299', '+44', '+49', '+33', '+39', '+34', '+31', '+32', '+41', '+43', '+45', '+46', '+47', '+86', '+81', '+82', '+91', '+92', '+94', '+60', '+65', '+66', '+84', '+63', '+62', '+61', '+64', '+55', '+54', '+56', '+57', '+51', '+52', '+1', '+7', '+20', '+27'];
        
        // Try to match country codes from longest to shortest
        let matched = false;
        for (const code of countryCodes) {
          if (user.phoneNumber.startsWith(code)) {
            phoneCountryCode = code;
            phoneNumber = user.phoneNumber.substring(code.length).trim();
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          // If no country code detected, just use the whole number
          phoneNumber = user.phoneNumber;
        }
      }

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        nationality: user.nationality || '',
        phoneCountryCode,
        phoneNumber,
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user, token, router, isLoading]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Combine country code and phone number
      const phoneNumberForSubmit = formData.phoneCountryCode && formData.phoneNumber 
        ? `${formData.phoneCountryCode}${formData.phoneNumber}` 
        : formData.phoneNumber || undefined;

      const dataToSubmit = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || undefined,
        nationality: formData.nationality || undefined,
        phoneNumber: phoneNumberForSubmit,
        profilePicture: formData.profilePicture || undefined,
      };

      const response = await updateProfileApi(token, dataToSubmit);
      
      if (response.success) {
        updateUser(response.data.user);
        setSuccess('Profile updated successfully!');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show nothing if not authenticated (will redirect in useEffect)
  if (!user || !token) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              mb: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Profile Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage your account information and preferences
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Profile Form */}
        <Card sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Profile Picture Section */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Avatar
                src={formData.profilePicture || undefined}
                alt={`${formData.firstName} ${formData.lastName}`}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '3rem',
                  backgroundColor: 'primary.main',
                }}
              >
                {!formData.profilePicture && `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()}
              </Avatar>
              <TextField
                fullWidth
                label="Profile Picture URL"
                value={formData.profilePicture}
                onChange={handleInputChange('profilePicture')}
                variant="outlined"
                size="small"
                placeholder="https://example.com/your-picture.jpg"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Enter a URL to your profile picture
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Personal Information
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>

              {/* Contact Information */}
              <Typography variant="h6" sx={{ mb: 3, mt: 4, fontWeight: 600 }}>
                Contact Information
              </Typography>
              
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                disabled
                variant="outlined"
                helperText="Email cannot be changed"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 3 }}
              />

              {/* Additional Information */}
              <Typography variant="h6" sx={{ mb: 3, mt: 4, fontWeight: 600 }}>
                Additional Information
              </Typography>
              
              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange('dateOfBirth')}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <Cake sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                
                <FormControl fullWidth>
                  <InputLabel id="nationality-label">Nationality</InputLabel>
                  <Select
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, nationality: e.target.value }));
                      setError(null);
                      setSuccess(null);
                    }}
                    labelId="nationality-label"
                    label="Nationality"
                  >
                    <MenuItem value="">Select Nationality</MenuItem>
                    <MenuItem value="Afghanistan">Afghanistan</MenuItem>
                    <MenuItem value="Albania">Albania</MenuItem>
                    <MenuItem value="Algeria">Algeria</MenuItem>
                    <MenuItem value="American">American</MenuItem>
                    <MenuItem value="Argentina">Argentina</MenuItem>
                    <MenuItem value="Australia">Australia</MenuItem>
                    <MenuItem value="Austria">Austria</MenuItem>
                    <MenuItem value="Bangladesh">Bangladesh</MenuItem>
                    <MenuItem value="Belgium">Belgium</MenuItem>
                    <MenuItem value="Brazil">Brazil</MenuItem>
                    <MenuItem value="British">British</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="China">China</MenuItem>
                    <MenuItem value="Denmark">Denmark</MenuItem>
                    <MenuItem value="Egypt">Egypt</MenuItem>
                    <MenuItem value="Finland">Finland</MenuItem>
                    <MenuItem value="France">France</MenuItem>
                    <MenuItem value="Germany">Germany</MenuItem>
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="Indonesian">Indonesian</MenuItem>
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
              </Stack>
              
              {/* Phone Number with Country Code */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Phone Number
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="phoneCountryCode-label">Country Code</InputLabel>
                    <Select
                      id="phoneCountryCode"
                      name="phoneCountryCode"
                      value={formData.phoneCountryCode}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, phoneCountryCode: e.target.value }));
                        setError(null);
                        setSuccess(null);
                      }}
                      labelId="phoneCountryCode-label"
                      label="Country Code"
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
                    fullWidth
                    id="phoneNumber"
                    name="phoneNumber"
                    label="Phone Number"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange('phoneNumber')}
                    variant="outlined"
                    placeholder="1234567890"
                  />
                </Box>
              </Box>

              {/* Username (Read-only) */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Username
                </Typography>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  value={user.username}
                  disabled
                  variant="outlined"
                  helperText="Username cannot be changed"
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                  sx={{
                    minWidth: 120,
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

