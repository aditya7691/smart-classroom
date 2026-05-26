import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { FileQuestion, Plus, Save, Trash2, CheckCircle, Loader2 } from 'lucide-react';

export default function CreateTestPage() {
  const [testTitle, setTestTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  
  // State for the current question being drafted
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState({ A: '', B: '', C: '', D: '' });
  const [correctOption, setCorrectOption] = useState('A');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Add the currently drafted question to the test list
  const handleAddQuestion = () => {
    if (!qText || !options.A || !options.B || !options.C || !options.D) {
      setMessage('Please fill in the question and all 4 options.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newQuestion = {
      id: Date.now(),
      question: qText,
      options: options,
      correctAnswer: correctOption
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset the draft form
    setQText('');
    setOptions({ A: '', B: '', C: '', D: '' });
    setCorrectOption('A');
  };

  // Remove a question from the list
  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Publish the entire test to Firebase
  const handlePublishTest = async () => {
    if (!testTitle || !subject || questions.length === 0) {
      setMessage('Please add a Title, Subject, and at least 1 question.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'tests'), {
        title: testTitle,
        subject: subject,
        questions: questions, // Saves the entire array of objects
        professorId: auth.currentUser.uid,
        professorName: auth.currentUser.displayName || 'Professor',
        createdAt: serverTimestamp(),
        isActive: true // Can be toggled later to hide the test
      });

      setMessage('Test published successfully!');
      setTestTitle('');
      setSubject('');
      setQuestions([]);
      
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error("Error saving test:", error);
      setMessage('Failed to publish test. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="professor">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Create Online Test</h2>
            <p className="text-gray-600 mt-1">Build multiple-choice tests for your students.</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-center space-x-2 font-medium ${
            message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {message.includes('successfully') && <CheckCircle className="w-5 h-5" />}
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Test Details & Question Draft Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Basic Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">1. Test Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="e.g., Midterm Exam 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Digital Logic"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Add Question Draft */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">2. Draft a Question</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Type your question here..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none h-24 resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <span className="font-bold text-gray-500">{opt}.</span>
                      <input
                        type="text"
                        value={options[opt]}
                        onChange={(e) => setOptions({...options, [opt]: e.target.value})}
                        placeholder={`Option ${opt}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Correct Answer:</label>
                    <select
                      value={correctOption}
                      onChange={(e) => setCorrectOption(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold transition-colors border border-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Test</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Question List & Publish Button */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-gray-900">3. Test Preview</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                {questions.length} Qs
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-6">
              {questions.length === 0 ? (
                <div className="text-center text-gray-400 mt-10 text-sm">
                  No questions added yet.<br/>Draft a question and click 'Add to Test'.
                </div>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg relative group">
                    <p className="font-bold text-gray-800 text-sm mb-1">Q{index + 1}: {q.question}</p>
                    <p className="text-xs text-gray-500">Ans: Option {q.correctAnswer}</p>
                    <button 
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handlePublishTest}
              disabled={saving || questions.length === 0}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-white font-bold bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 mt-auto"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{saving ? 'Publishing...' : 'Publish Test to Students'}</span>
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}