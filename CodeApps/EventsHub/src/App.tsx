import './App.css'
import * as React from 'react';
// Fluent UI Icons initialization
import { initializeIcons } from '@fluentui/font-icons-mdl2';
initializeIcons();
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Components/Header/Header';
import BannerImage from './Components/BannerImage/BannerImage';
import Events from './Components/Events/Events';
import Event from './Components/Event/Event';
import { Office365UsersService } from './generated/services/Office365UsersService';
import type { GraphUser_V1 } from './generated/models/Office365UsersModel';
import type { crb5a_codeapps_eventdetailses } from './generated/models/Crb5a_codeapps_eventdetailsesModel';

function App() {
  // Header related state
  const [user, setUser] = React.useState<GraphUser_V1 | null>(null);
  const [photo, setPhoto] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  // Current event for banner (when viewing event details)
  const [currentEvent, setCurrentEvent] = React.useState<crb5a_codeapps_eventdetailses | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        // Fetch user profile and photo
        async function fetchUserData() {
          try {
            const profileResult = await Office365UsersService.MyProfile_V2("id,displayName,mail,userPrincipalName");

            if (profileResult.success && profileResult.data) {
              const profile = profileResult.data;
              setUser(profile);

              if (profile?.id || profile?.userPrincipalName) {
                // Try both id and userPrincipalName for photo
                let photoData = null;
                try {
                  const photoResult = await Office365UsersService.UserPhoto_V2(profile.id || profile.userPrincipalName || '');
                  if (photoResult.success) {
                    photoData = photoResult.data;
                  }
                } catch {
                  // fallback to userPrincipalName if id fails
                  if (profile.userPrincipalName) {
                    try {
                      const photoResult = await Office365UsersService.UserPhoto_V2(profile.userPrincipalName);
                      if (photoResult.success) {
                        photoData = photoResult.data;
                      }
                    } catch (photoError) {
                      console.warn('Could not fetch user photo:', photoError);
                    }
                  }
                }
                if (photoData) {
                  setPhoto(`data:image/jpeg;base64,${photoData}`);
                }
              }
            } else {
              setError(profileResult.error?.message || 'Failed to fetch user profile');
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
          }
        }

        // Wait for initial data to load
        await fetchUserData();
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  return (
    <Router>
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <Spinner size={SpinnerSize.large} label="Loading data..." />
        </div>
      )}
      {!loading && (
        <>
          <Header user={user} photo={photo} error={error} />
          <BannerImage event={currentEvent} userEmail={user?.mail || user?.userPrincipalName || ''} />
          <Routes>
            <Route path="/" element={<Navigate to="/all-events" replace />} />
            <Route
              path="/all-events"
              element={<Events eventType="all" userEmail={user?.mail || user?.userPrincipalName || ''} onEventChange={setCurrentEvent} />}
            />
            <Route
              path="/my-events"
              element={<Events eventType="my" userEmail={user?.mail || user?.userPrincipalName || ''} onEventChange={setCurrentEvent} />}
            />
            <Route path="/event/:eventId" element={<Event onEventLoad={setCurrentEvent} />} />
          </Routes>
        </>
      )}
    </Router>
  )
}

export default App 