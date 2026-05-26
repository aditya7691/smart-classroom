import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProfessorDashboard from './pages/professor/ProfessorDashboard';
import AttendancePage from './pages/professor/AttendancePage';
import QRGeneratorPage from './pages/professor/QRGeneratorPage';
import QRScannerPage from './pages/student/QRScannerPage';
import UploadNotesPage from './pages/professor/UploadNotesPage';
import StudentMaterialsPage from './pages/student/StudentMaterialsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import CreateClassPage from './pages/professor/CreateClassPage';
import CreateTestPage from './pages/professor/CreateTestPage';
import TakeTestPage from './pages/student/TakeTestPage';
import LiveClassroomPage from './pages/shared/LiveClassroomPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Automatically redirect the base URL to the login page */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* The Login Route */}
        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/classroom/:classId" element={<LiveClassroomPage />} />
        
        {/* Placeholder routes for our dashboards (we will build these later) */}
       
        <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
        <Route path="/professor/attendance" element={<AttendancePage />} />
        <Route path="/professor/qr-attendance" element={<QRGeneratorPage />} />
        <Route path="/professor/materials" element={<UploadNotesPage />} />
        <Route path="/professor/classes" element={<CreateClassPage />} />
        <Route path="/professor/create-test" element={<CreateTestPage />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/scan-qr" element={<QRScannerPage />} />
        <Route path="/student/materials" element={<StudentMaterialsPage />} />
        <Route path="/student/attendance" element={<StudentAttendancePage />} />
        <Route path="/student/exams" element={<TakeTestPage />} />


      </Routes>
    </Router>
  );
}

export default App;