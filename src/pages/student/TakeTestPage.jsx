import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { FileText, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function TakeTestPage() {
  const [availableTests, setAvailableTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [warnings, setWarnings] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ earned: 0, total: 0 });

  // 1. Fetch available tests from Firebase
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tests'));
        const testsList = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().isActive) {
            testsList.push({ id: doc.id, ...doc.data() });
          }
        });
        setAvailableTests(testsList);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };
    fetchTests();
  }, []);

  // 2. The Anti-Cheating Engine (Tab Switch Detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the document becomes hidden (user switches tabs/minimizes window) while a test is active
      if (document.hidden && activeTest && !submitted) {
        setWarnings(prev => {
          const newWarnings = prev + 1;
          if (newWarnings >= 3) {
            alert("TEST TERMINATED: You have exceeded the maximum number of tab-switch warnings.");
            handleAutoSubmit(newWarnings);
          } else {
            alert(`WARNING ${newWarnings}/3: Do not switch tabs or leave this window during the exam! Your test will auto-submit after 3 warnings.`);
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeTest, submitted]);

  // Handle student selecting an option
  const handleOptionSelect = (qIndex, optionKey) => {
    setAnswers({ ...answers, [qIndex]: optionKey });
  };

  // Start the test
  const handleStartTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setWarnings(0);
    setSubmitted(false);
  };

  // Submit test and calculate score
  const handleSubmitTest = async (finalWarnings = warnings) => {
    if (!activeTest) return;
    
    // Calculate score
    let calculatedScore = 0;
    activeTest.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });

    setScore({ earned: calculatedScore, total: activeTest.questions.length });
    setSubmitted(true);

    try {
      // Save result to Firebase
      await addDoc(collection(db, 'test_results'), {
        studentId: auth.currentUser.uid,
        studentName: auth.currentUser.displayName || 'Student',
        testId: activeTest.id,
        testTitle: activeTest.title,
        score: calculatedScore,
        totalQuestions: activeTest.questions.length,
        warningsIssued: finalWarnings,
        submittedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving test results:", error);
    }
  };

  // Helper for auto-submitting on 3rd warning
  const handleAutoSubmit = (wCount) => {
    handleSubmitTest(wCount);
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* VIEW 1: List of Available Tests */}
        {!activeTest && (
          <>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Active Exams</h2>
                <p className="text-gray-600 mt-1">Select an exam to begin. Ensure you have a stable connection.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {availableTests.length === 0 ? (
                <p className="text-gray-500 text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
                  No exams are currently active.
                </p>
              ) : (
                availableTests.map((test) => (
                  <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded mb-2 inline-block">
                        {test.subject}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{test.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{test.questions.length} Questions • Anti-Cheating Enabled</p>
                    </div>
                    <button 
                      onClick={() => handleStartTest(test)}
                      className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
                    >
                      Start Exam
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* VIEW 2: The Active Testing Interface */}
        {activeTest && !submitted && (
          <div 
            className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-100"
            onContextMenu={(e) => e.preventDefault()} // Disable right-click
            onCopy={(e) => e.preventDefault()}       // Disable copy
            onPaste={(e) => e.preventDefault()}      // Disable paste
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{activeTest.title}</h2>
                <p className="text-gray-500">{activeTest.subject}</p>
              </div>
              <div className="flex items-center space-x-4">
                {warnings > 0 && (
                  <span className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Warnings: {warnings}/3
                  </span>
                )}
                <span className="flex items-center text-blue-700 font-bold bg-blue-50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 mr-2" /> Testing in Progress
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {activeTest.questions.map((q, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">
                    {index + 1}. {q.question}
                  </h3>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((optKey) => (
                      <label 
                        key={optKey} 
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          answers[index] === optKey 
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' 
                            : 'bg-white border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={optKey}
                          checked={answers[index] === optKey}
                          onChange={() => handleOptionSelect(index, optKey)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-4"
                        />
                        <span className="font-bold text-gray-700 mr-2">{optKey}.</span>
                        <span className="text-gray-800">{q.options[optKey]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleSubmitTest(warnings)}
              className="w-full mt-8 bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg flex justify-center items-center"
            >
              <CheckCircle className="w-6 h-6 mr-2" /> Submit Exam
            </button>
          </div>
        )}

        {/* VIEW 3: Results Screen */}
        {submitted && (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center">
            {warnings >= 3 ? (
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            ) : (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            )}
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {warnings >= 3 ? 'Exam Terminated' : 'Exam Submitted Successfully!'}
            </h2>
            
            <div className="my-8 inline-block bg-gray-50 p-6 rounded-xl border border-gray-200">
              <p className="text-gray-500 font-medium mb-1">Your Score</p>
              <p className={`text-5xl font-black ${score.earned >= (score.total / 2) ? 'text-green-600' : 'text-amber-500'}`}>
                {score.earned} <span className="text-2xl text-gray-400">/ {score.total}</span>
              </p>
            </div>
            
            {warnings > 0 && (
              <p className="text-red-600 font-bold mb-6">
                <AlertTriangle className="inline w-5 h-5 mr-1 mb-1" />
                This test was flagged with {warnings} tab-switching warning(s).
              </p>
            )}

            <button 
              onClick={() => {
                setActiveTest(null);
                setSubmitted(false);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Return to Exams
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}