import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CheckCircle, XCircle, Save, Loader2 } from 'lucide-react';

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // Stores { studentId: 'present' | 'absent' }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch students from Firebase when the page loads
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const querySnapshot = await getDocs(q);
        
        const studentList = [];
        const initialAttendance = {};
        
        querySnapshot.forEach((doc) => {
          studentList.push({ id: doc.id, ...doc.data() });
          initialAttendance[doc.id] = 'present'; // Default everyone to present
        });

        setStudents(studentList);
        setAttendance(initialAttendance);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Handle toggling the attendance status
  const handleToggle = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  // Save the attendance record to Firebase
  const handleSubmit = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const today = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD
      
      // Save a new document in the 'attendance' collection
      await addDoc(collection(db, 'attendance'), {
        date: today,
        records: attendance,
        timestamp: serverTimestamp()
      });

      setMessage('Attendance saved successfully for today!');
    } catch (error) {
      console.error("Error saving attendance:", error);
      setMessage('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="professor">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-gray-600 mt-1">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={saving || students.length === 0}
            className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg font-medium ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading student list...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No students found in the database. Please register a student account first.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.name || 'Unknown Student'}</td>
                    <td className="px-6 py-4 text-gray-500">{student.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggle(student.id, 'present')}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            attendance[student.id] === 'present' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Present</span>
                        </button>
                        
                        <button
                          onClick={() => handleToggle(student.id, 'absent')}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            attendance[student.id] === 'absent' 
                              ? 'bg-red-100 text-red-800 border border-red-200' 
                              : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}