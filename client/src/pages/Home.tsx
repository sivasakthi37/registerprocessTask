import React, { useEffect, useState } from 'react';
import { Container, Button, AppBar, Toolbar, Typography } from '@mui/material';
import YouTube from 'react-youtube';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const Home: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');

  useEffect(() => {
    const fetchYoutubeUrl = async () => {
      try {
        const response = await api.getYoutubeUrl();
        setYoutubeUrl(response.data.url);
      } catch (error) {
        console.error('Error fetching YouTube URL:', error);
      }
    };

    fetchYoutubeUrl();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getVideoId = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Welcome
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container style={{ marginTop: '20px' }}>
        {youtubeUrl && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <YouTube
              videoId={getVideoId(youtubeUrl) || ''}
              opts={{
                height: '390',
                width: '640',
                playerVars: {
                  autoplay: 0,
                },
              }}
            />
          </div>
        )}
      </Container>
    </div>
  );
};

export default Home;
