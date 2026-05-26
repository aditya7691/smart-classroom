import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export default function SignupPage() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save the user's role and name in the Firestore Database
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
        // Add placeholder data that we can update later in the profile section
        department: '', 
        avatarUrl: ''
      });

      // 3. Navigate them to their specific dashboard
      navigate(`/${role}/dashboard`);
      
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message.replace('Firebase: ', '')); // Clean up the error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-800 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 text-center px-10 text-white">
          <GraduationCap className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Join the Portal</h1>
          <p className="text-lg text-blue-100 max-w-md mx-auto">
            Create your account to access the smart classroom ecosystem.
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-24 xl:px-32">
        <div className="w-full max-w-md mx-auto">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
            <p className="mt-2 text-sm text-gray-600">Register as a student or professor.</p>
          </div>

          {/* Role Selection Toggle */}
          <div className="flex p-1 mb-6 bg-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                role === 'student' ? 'bg-white shadow text-blue-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('professor')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                role === 'professor' ? 'bg-white shadow text-blue-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Professor
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                placeholder={role === 'student' ? "student@university.edu" : "professor@university.edu"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 mt-6 text-white font-bold bg-blue-800 rounded-lg hover:bg-blue-900 transition-all disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-800 hover:underline">
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}