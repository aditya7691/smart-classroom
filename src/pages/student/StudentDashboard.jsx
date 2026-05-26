import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { Video, Calendar, Clock, BookOpen, ExternalLink, ArrowRight, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [studentName, setStudentName] = useState('Student');
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({ present: 0, total: 0, percentage: 0 });

  useEffect(() => {
    const fetchDashboardData = async (user) => {
      // 1. Fetch Classes (Guaranteed to load)
      try {
        const classSnap = await getDocs(collection(db, 'classes'));
        const allClasses = classSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOnlineClasses(allClasses.slice(0, 5));
      } catch (error) {
        console.log("Class fetch error:", error);
      }

      // 2. Fetch Materials (Guaranteed to load)
      try {
        const matSnap = await getDocs(collection(db, 'materials'));
        const allMats = matSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentMaterials(allMats.slice(0, 3));
      } catch (error) {
        console.log("Material fetch error:", error);
      }

      // 3. Fetch Attendance
      if (user) {
        const myId = user.uid;
        try {
          const attSnap = await getDocs(collection(db, 'attendance'));
          let presentCount = 0;
          let totalClasses = 0;

          attSnap.forEach((doc) => {
            const data = doc.data();
            if (data.records && data.records[myId]) {
              totalClasses++;
              if (data.records[myId] === 'present') presentCount++;
            }
          });

          const percentage = totalClasses === 0 ? 0 : Math.round((presentCount / totalClasses) * 100);
          setAttendance({ present: presentCount, total: totalClasses, percentage });
        } catch (error) {
          console.log("Attendance fetch error:", error);
        }
      }

      // GUARANTEED to turn off the infinite loading spinner
      setLoading(false); 
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setStudentName(user.displayName || 'Student');
      fetchDashboardData(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-linear-to-r from-blue-800 to-blue-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {studentName}!</h2>
            <p className="text-blue-100 max-w-xl">
              Check your attendance standing and upcoming schedule below.
            </p>
          </div>
          <Activity className="absolute right-0 bottom-0 w-48 h-48 text-white opacity-10 translate-x-10 translate-y-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            <div className="xl:col-span-2 space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-blue-600" />
                    Online Classes
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {onlineClasses.length === 0 ? (
                    <p className="p-5 text-gray-500">No upcoming classes scheduled.</p>
                  ) : (
                    onlineClasses.map((cls) => (
                      <div key={cls.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-bold text-gray-900 text-lg">{cls.subject || 'Untitled Class'}</h4>
                            {cls.isLive && (
                              <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {cls.professorName || 'Professor'}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {cls.time || 'No time set'}</span>
                          </div>
                        </div>
                        
                        <Link 
                          to={cls.isLive ? `/classroom/${cls.id}` : '#'}
                          className={`flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-bold transition-colors ${
                            cls.isLive 
                              ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-md shadow-blue-200' 
                              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          }`}
                          onClick={(e) => !cls.isLive && e.preventDefault()}
                        >
                          <Video className="w-4 h-4" />
                          <span>{cls.isLive ? 'Join Class' : 'Waiting...'}</span>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Recently Uploaded Notes
                  </h3>
                  <Link to="/student/materials" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentMaterials.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent materials found.</p>
                  ) : (
                    recentMaterials.map((mat) => (
                      <a key={mat.id} href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{mat.subject}</span>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 line-clamp-1">{mat.title}</h4>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Attendance Overview</h3>
                
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-gray-100" style={{ background: `conic-gradient(${attendance.percentage >= 75 ? '#1d4ed8' : '#dc2626'} ${attendance.percentage}%, #f3f4f6 0)` }}>
                    <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                      <span className={`text-3xl font-black ${attendance.percentage >= 75 ? 'text-gray-900' : 'text-red-600'}`}>
                        {attendance.percentage}%
                      </span>
                      <span className="text-xs font-medium text-gray-500">Present</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Total Classes</span>
                    <span className="font-bold text-gray-900">{attendance.total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Classes Attended</span>
                    <span className="font-bold text-green-600">{attendance.present}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Classes Missed</span>
                    <span className="font-bold text-red-600">{attendance.total - attendance.present}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}