import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { Calendar, CheckCircle, XCircle, BarChart3, Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export default function StudentAttendancePage() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const myId = user.uid;

        try {
          // Fetch all attendance documents, newest first
          const q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
          const querySnapshot = await getDocs(q);
          
          const myRecords = [];
          let presentCount = 0;
          let absentCount = 0;

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.records && data.records[myId]) {
              const status = data.records[myId]; 
              
              myRecords.push({
                id: doc.id,
                date: data.date,
                status: status
              });

              if (status === 'present') presentCount++;
              if (status === 'absent') absentCount++;
            }
          });

          const totalClasses = presentCount + absentCount;
          const calcPercentage = totalClasses === 0 ? 0 : Math.round((presentCount / totalClasses) * 100);

          setRecords(myRecords);
          setStats({
            present: presentCount,
            absent: absentCount,
            total: totalClasses,
            percentage: calcPercentage
          });

        } catch (error) {
          console.error("Error fetching attendance:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper function to make dates look nice (e.g., "Oct 12, 2025")
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Attendance Report</h2>
            <p className="text-gray-600 mt-1">Track your daily presence and overall percentage.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">Loading your records...</p>
          </div>
        ) : (
          <>
            {/* Top Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-sm font-bold text-gray-500 mb-1">Overall Attendance</p>
                <p className={`text-3xl font-black ${stats.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.percentage}%
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-sm font-bold text-gray-500 mb-1">Total Classes</p>
                <p className="text-3xl font-black text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-sm font-bold text-gray-500 mb-1">Days Present</p>
                <p className="text-3xl font-black text-green-600">{stats.present}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-sm font-bold text-gray-500 mb-1">Days Absent</p>
                <p className="text-3xl font-black text-red-600">{stats.absent}</p>
              </div>
            </div>

            {/* Detailed Monthly List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Detailed History
                </h3>
              </div>
              
              {records.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No attendance records found.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {records.map((record) => (
                    <li key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-800">
                        {formatDate(record.date)}
                      </span>
                      
                      {record.status === 'present' ? (
                        <span className="flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Present
                        </span>
                      ) : (
                        <span className="flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                          <XCircle className="w-4 h-4 mr-1.5" /> Absent
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}