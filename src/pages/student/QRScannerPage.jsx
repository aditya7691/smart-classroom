import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Scanner } from '@yudiel/react-qr-scanner';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { CheckCircle, XCircle, Camera, Loader2 } from 'lucide-react';

export default function QRScannerPage() {
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle', 'scanning', 'success', 'error'
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState('');

  // Fetch the current student's name when the page loads
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setStudentName(userDoc.data().name);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleScan = async (scannedText) => {
    if (!scannedText || scanStatus === 'scanning' || scanStatus === 'success') return;
    
    setScanStatus('scanning');
    setMessage('Verifying code...');

    try {
      const sessionId = "current_live_class";
      const sessionRef = doc(db, 'active_sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists() || !sessionSnap.data().isLive) {
        setScanStatus('error');
        setMessage('No active attendance session found. Please wait for the professor.');
        setTimeout(() => setScanStatus('idle'), 4000);
        return;
      }

      const activeToken = sessionSnap.data().token;

      // Check if the scanned QR code matches the live token in the database
      if (scannedText[0].rawValue === activeToken) {
        // Token matches! Record the attendance
        const studentId = auth.currentUser.uid;
        
        await setDoc(doc(db, 'active_sessions', sessionId, 'attendees', studentId), {
          studentId: studentId,
          name: studentName,
          timestamp: new Date().toISOString()
        });

        setScanStatus('success');
        setMessage('Attendance marked successfully!');
      } else {
        // Token is old or invalid
        setScanStatus('error');
        setMessage('Invalid or expired QR Code. Please scan the newest code on the screen.');
        setTimeout(() => setScanStatus('idle'), 3000);
      }

    } catch (error) {
      console.error("Scanning Error:", error);
      setScanStatus('error');
      setMessage('Network error. Please try again.');
      setTimeout(() => setScanStatus('idle'), 3000);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mark Attendance</h2>
          <p className="text-gray-600 mt-2">Point your camera at the screen to scan the live QR code.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          
          {/* Status Messages */}
          {scanStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
              <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
              <h3 className="text-xl font-bold text-green-800">Verified!</h3>
              <p className="text-green-600 font-medium">{message}</p>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-500 shrink-0" />
              <p className="text-red-700 font-medium">{message}</p>
            </div>
          )}

          {scanStatus === 'scanning' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center space-x-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-blue-800 font-medium">{message}</p>
            </div>
          )}

          {/* The Camera Scanner */}
          {scanStatus !== 'success' && (
            <div className="overflow-hidden rounded-xl border-4 border-gray-100 relative bg-black aspect-square max-w-md mx-auto flex items-center justify-center">
              <Scanner 
                onScan={handleScan}
                onError={(error) => console.log(error?.message)}
                components={{
                  audio: false, // Turn off the beep sound
                  finder: true, // Show the scanning square
                }}
              />
              {/* Decorative overlay */}
              <div className="absolute inset-0 border-40 border-black/40 pointer-events-none"></div>
            </div>
          )}

          {scanStatus === 'success' && (
            <button 
              onClick={() => setScanStatus('idle')}
              className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Scan Another Class
            </button>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}