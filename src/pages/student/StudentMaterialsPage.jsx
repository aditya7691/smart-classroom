import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BookOpen, ExternalLink, Calendar, FileText, Loader2 } from 'lucide-react';

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        // Query the database, ordering by newest first
        const q = query(collection(db, 'materials'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const materialsList = [];
        querySnapshot.forEach((doc) => {
          materialsList.push({ id: doc.id, ...doc.data() });
        });
        
        setMaterials(materialsList);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Helper function to format the Firebase timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Study Materials</h2>
            <p className="text-gray-600 mt-1">Access notes, slides, and resources uploaded by your professors.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">Loading your materials...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">No materials found</h3>
            <p className="text-gray-500 mt-2">Your professors haven't uploaded any study resources yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                      {item.subject}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                  <a 
                    href={item.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-700 transition-colors"
                  >
                    <span>View Document</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}