import React, { useState } from 'react'
import { useEffect } from 'react';
import Workspace from './Workspace';

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);

  const [name,setName] = useState('')
  const [modelType, setModelType] = useState('gemini') // 'gemini' or 'groq'
  const [apikey,setApikey] = useState('')
  const [questionTitle,setQuestionTitle]=useState('')
  const [questiondesc,setQuestionDesc]=useState('')
  const [questionEditorial,setQuestionEditorial]=useState('')
  const [questionCode,setQuestionCode]=useState('')
  const [showInterview, setShowInterview]=useState(false)
  const [chatWidth, setChatWidth]=useState(300)

  const handleSubmit = (e) => {
  
    e.preventDefault();
    const data = {
      name,
      modelType,
      apikey,
      questionTitle,
      questiondesc,
      questionEditorial,
      questionCode
    };
    console.log(data);
    setShowInterview(true);
  }

  return (
    <div>

      {!showInterview && (
    <div className={
      `min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ` +
      (darkMode
        ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800'
        : 'bg-gradient-to-br from-gray-50 to-blue-100')
    }>
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className={
            `px-4 py-2 rounded-lg font-semibold shadow ` +
            (darkMode
              ? 'bg-gray-800 text-gray-100 border border-gray-700 hover:bg-gray-700'
              : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-200')
          }
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className={
          `shadow-xl rounded-xl p-8 w-full max-w-xl space-y-6 border transition-colors duration-300 ` +
          (darkMode
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200')
        }
      >
        <h1 className={
          `text-3xl font-bold mb-2 text-center transition-colors duration-300 ` +
          (darkMode ? 'text-blue-400' : 'text-blue-700')
        }>PrepPal Mock Interview Platform</h1>
        <p className={
          `text-center mb-4 transition-colors duration-300 ` +
          (darkMode ? 'text-gray-300' : 'text-gray-600')
        }>Prepare, practice, and excel in your interviews!</p>

        <div className="space-y-4">
          <div>
            <label className={
              `block text-sm font-medium mb-1 transition-colors duration-300 ` +
              (darkMode ? 'text-gray-200' : 'text-gray-700')
            }>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={
                `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ` +
                (darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400')
              }
            />
          </div>

          <div>
            <label className={
              `block text-sm font-medium mb-1 transition-colors duration-300 ` +
              (darkMode ? 'text-gray-200' : 'text-gray-700')
            }>Model Selection</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className={
                `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ` +
                (darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-100'
                  : 'border-gray-300 bg-white text-gray-900')
              }
            >
              <option value="gemini">Gemini 2.5 Flash</option>
              <option value="groq">Groq (Mixtral/Llama)</option>
            </select>
          </div>

          <div>
            <label className={
              `block text-sm font-medium mb-1 transition-colors duration-300 ` +
              (darkMode ? 'text-gray-200' : 'text-gray-700')
            }>{modelType === 'gemini' ? 'Gemini API Key' : 'Groq API Key'}</label>
            <input
              type="text"
              value={apikey}
              onChange={(e) => setApikey(e.target.value)}
              placeholder={modelType === 'gemini' ? 'Enter your Gemini API key' : 'Enter your Groq API key'}
              className={
                `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ` +
                (darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400')
              }
            />
          </div>

          <div>
            <label className={
              `block text-sm font-medium mb-1 transition-colors duration-300 ` +
              (darkMode ? 'text-gray-200' : 'text-gray-700')
            }>Question Title</label>
            <input
              type="text"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              placeholder="Enter question title"
              className={
                `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ` +
                (darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400')
              }
            />
          </div>

          <div>
            <label className={
              `block text-sm font-medium mb-1 transition-colors duration-300 ` +
              (darkMode ? 'text-gray-200' : 'text-gray-700')
            }>Question Description</label>
            <textarea
              value={questiondesc}
              onChange={(e) => setQuestionDesc(e.target.value)}
              placeholder="Enter question description"
              className={
                `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px] transition-colors duration-300 ` +
                (darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400')
              }
            />
          </div>

          <div>
            <label className={
              `block text-sm font-medium mb-1 transition-colors duration-300 ` +
              (darkMode ? 'text-gray-200' : 'text-gray-700')
            }>Question Editorial</label>
            <textarea
              value={questionEditorial}
              onChange={(e) => setQuestionEditorial(e.target.value)}
              placeholder="Enter question editorial"
              className={
                `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px] transition-colors duration-300 ` +
                (darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400')
              }
            />
          </div>

          <div>
            <label className={
              `block text-sm font-medium mb-1 transition-colors duration-300 ` +
              (darkMode ? 'text-gray-200' : 'text-gray-700')
            }>Question Code</label>
            <textarea
              value={questionCode}
              onChange={(e) => setQuestionCode(e.target.value)}
              placeholder="Enter question code"
              className={
                `w-full px-4 py-2 font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px] transition-colors duration-300 ` +
                (darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400')
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className={
            `w-full py-3 mt-4 font-semibold rounded-lg shadow transition-colors duration-150 ` +
            (darkMode
              ? 'bg-blue-700 text-white hover:bg-blue-800'
              : 'bg-blue-700 text-white hover:bg-blue-800')
          }
        >
          Submit
        </button>
      </form>
    </div>
      )}

      {showInterview && (
      <Workspace apiKey={apikey} modelType={modelType} candidateName={name} questionTitle={questionTitle}/>
      )}
    </div>
  );
}

export default Home
