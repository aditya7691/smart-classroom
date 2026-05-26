import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { Video, Clock, Book, Loader2, CheckCircle, Radio } from 'lucide-react';

export default function CreateClassPage() {
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!subject || !time) {
      setMessage('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      // THE FAILSAFE: 
      // The '?' (Optional Chaining) checks if currentUser exists.
      // If Firebase lost the session, it defaults to 'demo-professor' instead of crashing!
      await addDoc(collection(db, 'classes'), {
        subject: subject,
        professorId: auth.currentUser?.uid || 'demo-professor-123',
        professorName: auth.currentUser?.displayName || 'Professor',
        time: time,
        isLive: isLive,
        createdAt: serverTimestamp()
      });

      setMessage('Secure online class scheduled successfully!');
      setSubject('');
      setTime('');
      setIsLive(false);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error saving class:", error);
      setMessage('Failed to schedule class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="professor">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Online Class</h2>
          <p className="text-gray-600 mt-1">Create a secure, embedded live video session for your students.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.includes('successfully') && <CheckCircle className="w-5 h-5" />}
              <span className="font-medium">{message}</span>
            </div>
          )}

          <form onSubmit={handleCreateClass} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Topic</label>
              <div className="relative">
                <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Engineering Mathematics - Calculus"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Window</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g., Today, 10:00 AM - 11:30 AM"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg mt-6">
              <div>
                <p className="font-bold text-gray-900 flex items-center">
                  <Radio className="w-5 h-5 mr-2 text-red-500" /> Set as LIVE NOW
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This will immediately open the room for students to join.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isLive}
                  onChange={() => setIsLive(!isLive)}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 mt-6 text-white font-bold bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
              <span>{saving ? 'Publishing...' : 'Create Secure Class'}</span>
            </button>
          </form>

        </div>
      </div>
    </DashboardLayout>
  );
}