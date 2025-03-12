import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  TextareaAutosize,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const steps = ['Email', 'OTP Verification', 'Profile Information', 'Confirmation'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    medicalHistory: '',
    photograph: null as File | null,
  });
  const [userData, setUserData] = useState<any>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.registerEmail(email);
      setActiveStep(1);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.verifyOtp(email, otp);
      setToken(response.data.token);
      setActiveStep(2);
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('weight', formData.weight);
      form.append('height', formData.height);
      form.append('medicalHistory', formData.medicalHistory);
      if (formData.photograph) {
        form.append('photograph', formData.photograph);
      }

      const response = await api.updateProfile(form);
      setUserData(response.data);
      setActiveStep(3);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        setFormData({ ...formData, photograph: file });
      } else {
        alert('Please upload only PNG or JPG files');
      }
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <form onSubmit={handleEmailSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary">
              Next
            </Button>
          </form>
        );
      case 1:
        return (
          <form onSubmit={handleOtpSubmit}>
            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary">
              Verify OTP
            </Button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleProfileSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Weight (kg)</InputLabel>
              <Select
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
              >
                {Array.from({ length: 150 }, (_, i) => i + 30).map((weight) => (
                  <MenuItem key={weight} value={weight}>{weight} kg</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Height (cm)</InputLabel>
              <Select
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                required
              >
                {Array.from({ length: 120 }, (_, i) => i + 100).map((height) => (
                  <MenuItem key={height} value={height}>{height} cm</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextareaAutosize
              minRows={3}
              placeholder="Medical History"
              style={{ width: '100%', marginTop: '16px', padding: '8px' }}
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              required
            />

            <input
              accept="image/png,image/jpeg"
              style={{ display: 'none' }}
              id="photograph-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="photograph-upload">
              <Button component="span" variant="outlined" fullWidth style={{ marginTop: '16px' }}>
                Upload Photograph (PNG/JPG only)
              </Button>
            </label>

            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              style={{ marginTop: '16px' }}
            >
              Submit
            </Button>
          </form>
        );
      case 3:
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Congratulations! Registration Complete
            </Typography>
            {userData && (
              <div>
                <Typography>Email: {email}</Typography>
                <Typography>Weight: {userData.weight} kg</Typography>
                <Typography>Height: {userData.height} cm</Typography>
                <Typography>Medical History: {userData.medicalHistory}</Typography>
                {userData.photograph && (
                  <img 
                    src={`http://localhost:5000/${userData.photograph}`} 
                    alt="Profile" 
                    style={{ maxWidth: '200px', marginTop: '16px' }}
                  />
                )}
              </div>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/home')}
              style={{ marginTop: '16px' }}
            >
              Go to Home
            </Button>
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper style={{ padding: '20px', marginTop: '20px' }}>
        <Typography component="h1" variant="h4" align="center">
          Registration
        </Typography>
        <Stepper activeStep={activeStep} style={{ margin: '20px 0' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default Register;
