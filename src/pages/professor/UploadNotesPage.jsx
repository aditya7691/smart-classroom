import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { Link, Book, Loader2, CheckCircle, Type } from 'lucide-react';

export default function UploadNotesPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !subject || !driveLink) {
      setMessage('Please fill all fields.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Save the Drive link directly to Firestore (100% Free)
      await addDoc(collection(db, 'materials'), {
        title: title,
        subject: subject,
        fileUrl: driveLink,
        uploadedBy: auth.currentUser.uid,
        timestamp: serverTimestamp()
      });

      setMessage('Material link published successfully!');
      setTitle('');
      setSubject('');
      setDriveLink('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Database error:", error);
      setMessage('An error occurred while saving to the database.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout role="professor">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Share Study Materials</h2>
          <p className="text-gray-600 mt-1">Paste Google Drive or Dropbox links for your students.</p>
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

          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 4: Thermodynamics PDF"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <div className="relative">
                <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Physics 101"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Drive Link</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">Ensure your Google Drive link is set to "Anyone with the link can view".</p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 mt-6 text-white font-bold bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-70"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link className="w-5 h-5" />}
              <span>{uploading ? 'Publishing...' : 'Publish Material Link'}</span>
            </button>
          </form>

        </div>
      </div>
    </DashboardLayout>
  );
}