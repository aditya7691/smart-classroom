import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { Users, BookOpen, Clock, AlertCircle, Loader2, Video, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    students: 0, classes: 0, materials: 0, tests: 0
  });
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async (user) => {
      // 1. Fetch Classes (Presentation-Proof: Will run even if session blips)
      try {
        const classSnap = await getDocs(collection(db, 'classes'));
        const allFetchedClasses = classSnap.docs.map(document => ({ id: document.id, ...document.data() }));
        
        // Keep classes belonging to this user, OR our demo failsafe
        const targetId = user?.uid || 'demo-professor-123';
        const filteredClasses = allFetchedClasses.filter(
          c => c.professorId === targetId || c.professorId === 'demo-professor-123'
        );
          
        setMyClasses(filteredClasses.slice(0, 3));
        setDashboardStats(prev => ({ ...prev, classes: allFetchedClasses.length }));
      } catch (error) {
        console.error("Class fetch error:", error);
      }

      // 2. Fetch Stats
      if (user) {
        try {
          const studentQuery = query(collection(db, 'users'), where('role', '==', 'student'));
          const studentSnap = await getDocs(studentQuery);
          const materialSnap = await getDocs(collection(db, 'materials'));
          const testSnap = await getDocs(collection(db, 'tests'));

          setDashboardStats(prev => ({
            ...prev,
            students: studentSnap.size,
            materials: materialSnap.size,
            tests: testSnap.size
          }));
        } catch (error) {
          console.log("Stats fetch error:", error);
        }
      }

      // GUARANTEED to turn off the infinite loading spinner
      setLoading(false); 
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      fetchDashboardData(user);
    });

    return () => unsubscribe();
  }, []);

  // NEW: Function to delete a class when the lecture is over
  const handleEndClass = async (classId) => {
    if (window.confirm("Are you sure you want to end this class? It will be removed from the dashboard.")) {
      try {
        await deleteDoc(doc(db, 'classes', classId));
        // Remove it from the screen immediately without needing a refresh
        setMyClasses(prev => prev.filter(c => c.id !== classId)); 
      } catch (error) {
        console.error("Failed to end class:", error);
        alert("Could not end the class. Please try again.");
      }
    }
  };

  const stats = [
    { title: 'Total Students', value: dashboardStats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Scheduled Classes', value: dashboardStats.classes, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Materials Uploaded', value: dashboardStats.materials, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Active Tests', value: dashboardStats.tests, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <DashboardLayout role="professor">
      <div className="space-y-6">
        
        <div className="bg-blue-800 rounded-xl p-8 text-white shadow-sm">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.displayName || 'Professor'}!</h2>
          <p className="text-blue-100">Here is your live classroom overview.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-blue-600" />
                    My Scheduled Classes
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {myClasses.length === 0 ? (
                    <p className="p-5 text-gray-500 text-sm">You haven't scheduled any classes yet.</p>
                  ) : (
                    myClasses.map((cls) => (
                      <div key={cls.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-bold text-gray-900">{cls.subject || 'Untitled Class'}</h4>
                            {cls.isLive && (
                              <span className="flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {cls.time || 'No time set'}</span>
                          </div>
                        </div>
                        
                        {/* Action Buttons Container */}
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/classroom/${cls.id}`}
                            className={`flex items-center justify-center space-x-2 px-5 py-2 rounded-lg font-bold transition-colors ${
                              cls.isLive 
                                ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <Video className="w-4 h-4" />
                            <span>{cls.isLive ? 'Start Class' : 'Enter Room'}</span>
                          </Link>
                          
                          {/* END CLASS BUTTON */}
                          <button 
                            onClick={() => handleEndClass(cls.id)}
                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors border border-red-100"
                            title="End Class"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to="/professor/classes" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium border border-gray-200">
                      + Schedule Online Class
                    </Link>
                    <Link to="/professor/create-test" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium border border-gray-200">
                      + Create Online Exam
                    </Link>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Classroom Sensor Status</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-800">Room 302 (IoT Enabled)</p>
                      <p className="text-sm text-gray-500">Awaiting NodeMCU connection...</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
                      Offline
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}