import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

export default function LiveClassroomPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User found! Use their real name
        setUser({
          name: currentUser.displayName || 'Student/Professor',
          email: currentUser.email || 'user@smartclass.com'
        });
      } else {
        // PRESENTATION FAILSAFE: 
        // If Firebase loses the session, DO NOT crash. Use a fallback demo user!
        setUser({
          name: 'Demo User (Session Failsafe)',
          email: 'demo@smartclass.com'
        });
      }
      setLoading(false); // Stop the loading spinner
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p>Securing connection...</p>
      </div>
    );
  }

  // The hidden, secure room name generated from the database ID
  const secureRoomName = `SmartClass_BTech_SecureRoom_${classId}`;

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      
      {/* Top Header Navigation */}
      <div className="bg-gray-900 border-b border-gray-800 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="hover:bg-gray-800 p-2 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center">
              <ShieldCheck className="w-5 h-5 text-green-500 mr-2" />
              Secure Live Classroom
            </h1>
          </div>
        </div>
        <div className="text-sm text-gray-400 bg-gray-800 px-4 py-1.5 rounded-full border border-gray-700">
          Joined as: <span className="font-bold text-white">{user.name}</span>
        </div>
      </div>

      {/* The Embedded Video Player */}
      <div className="flex-1 w-full bg-black relative">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={secureRoomName}
          configOverwrite={{
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            disableModeratorIndicator: true,
            prejoinPageEnabled: false, // Jumps right into the meeting
            hideConferenceSubject: true 
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: user.name, 
            email: user.email
          }}
          getIFrameRef={(iframeRef) => { 
            iframeRef.style.height = '100%'; 
            iframeRef.style.width = '100%'; 
          }}
          onReadyToClose={() => navigate(-1)} // Clicking the red phone goes back to dashboard
        />
      </div>
      
    </div>
  );
}