import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { QRCodeSVG } from 'qrcode.react';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Play, Square, Users, RefreshCw } from 'lucide-react';

export default function QRGeneratorPage() {
  const [isActive, setIsActive] = useState(false);
  const [activeToken, setActiveToken] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [attendees, setAttendees] = useState([]);
  
  // We use a fixed session ID for this demo so the student side can easily find it
  const sessionId = "current_live_class"; 

  // Function to generate a random 6-character token
  const generateToken = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  // 1. Handle the 10-second Rotating Token Timer
  useEffect(() => {
    let tokenInterval;
    let countdownInterval;

    if (isActive) {
      // Set the very first token immediately
      const initialToken = generateToken();
      setActiveToken(initialToken);
      setDoc(doc(db, 'active_sessions', sessionId), {
        token: initialToken,
        isLive: true,
        updatedAt: new Date().toISOString()
      });

      // Update the countdown number every 1 second
      countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
      }, 1000);

      // Generate and push a new token to Firebase every 10 seconds
      tokenInterval = setInterval(() => {
        const newToken = generateToken();
        setActiveToken(newToken);
        
        setDoc(doc(db, 'active_sessions', sessionId), {
          token: newToken,
          isLive: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
      }, 10000);
    } else {
      // If professor stops the session, clear the token in Firebase
      setDoc(doc(db, 'active_sessions', sessionId), {
        token: null,
        isLive: false
      }, { merge: true });
    }

    // Cleanup function to prevent memory leaks when navigating away
    return () => {
      clearInterval(tokenInterval);
      clearInterval(countdownInterval);
    };
  }, [isActive]);

  // 2. Listen for Students Scanning in Real-Time
  useEffect(() => {
    if (!isActive) return;

    // Listen to the 'attendees' subcollection inside this session
    const unsubscribe = onSnapshot(collection(db, 'active_sessions', sessionId, 'attendees'), (snapshot) => {
      const studentList = [];
      snapshot.forEach((doc) => {
        studentList.push({ id: doc.id, ...doc.data() });
      });
      setAttendees(studentList);
    });

    return () => unsubscribe();
  }, [isActive]);

  return (
    <DashboardLayout role="professor">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Live QR Attendance</h2>
            <p className="text-gray-600 mt-1">Project the screen. Codes refresh every 10 seconds.</p>
          </div>
          
          <button 
            onClick={() => {
              setIsActive(!isActive);
              setCountdown(10);
              if (!isActive) setAttendees([]); // Clear list on new session
            }}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold transition-colors ${
              isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            {isActive ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isActive ? 'Stop Session' : 'Start Session'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side: The QR Code Display */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center min-h-125">
            {isActive ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-blue-50">
                  {/* The actual QR Code generated from the activeToken */}
                  <QRCodeSVG value={activeToken} size={320} level="H" />
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-3xl font-mono font-bold tracking-widest text-gray-800 bg-gray-100 px-6 py-2 rounded-lg">
                    {activeToken}
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-4 text-blue-600">
                    <RefreshCw className={`w-5 h-5 ${countdown <= 3 ? 'animate-spin text-red-500' : ''}`} />
                    <p className={`font-medium ${countdown <= 3 ? 'text-red-500' : ''}`}>
                      Refreshing in {countdown} seconds
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">
                <div className="w-64 h-64 border-4 border-dashed border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Play className="w-16 h-16 text-gray-300" />
                </div>
                <p className="text-lg font-medium">Click 'Start Session' to generate code</p>
              </div>
            )}
          </div>

          {/* Right Side: Live Scan Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-125">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Live Scans
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                {attendees.length} Present
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!isActive ? (
                <p className="text-center text-gray-400 mt-10 text-sm">Session offline</p>
              ) : attendees.length === 0 ? (
                <p className="text-center text-gray-400 mt-10 text-sm">Waiting for scans...</p>
              ) : (
                attendees.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-100 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-xs">
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{student.name || 'Unknown Student'}</p>
                      <p className="text-xs text-gray-500">Scanned just now</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}