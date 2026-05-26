import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('student'); // Controls the toggle
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // This now routes based on the actual toggle switch selected
    if (role === 'professor') {
      navigate('/professor/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Left Side - University Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 items-center justify-center relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative z-10 text-center px-10 text-white">
          <GraduationCap className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Smart Classroom</h1>
          <p className="text-lg text-blue-100 max-w-md mx-auto">
            The next-generation portal for IoT-enabled interactive learning, attendance tracking, and campus automation.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-24 xl:px-32">
        <div className="w-full max-w-md mx-auto">
          
          {/* Mobile Header (Shows only on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-700" />
            <h2 className="text-3xl font-bold text-gray-900">Smart Classroom</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">Please enter your details to sign in.</p>
          </div>

          {/* Role Selection Toggle */}
          <div className="flex p-1 mb-8 bg-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                role === 'student' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('professor')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                role === 'professor' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Professor
            </button>
          </div>

          {/* Interactive Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Add this inside the right-side div, under the form in LoginPage.jsx */}
                <p className="mt-8 text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-blue-700 hover:underline">
                    Register here
                </a>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-700 border-gray-300 rounded focus:ring-blue-700" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-blue-700 hover:text-blue-600">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 mt-6 text-white font-bold bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200"
            >
              Sign In
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}