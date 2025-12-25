import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"; // ✅ Correct Gemini module
import { ChatGroq } from "@langchain/groq"; // ✅ Groq module
import { ChatPromptTemplate } from "@langchain/core/prompts"; // ✅ Replaces old PromptTemplate
import { StringOutputParser } from "@langchain/core/output_parsers"; // ✅ Needed for final text output
import Editor from "@monaco-editor/react";

export default function Workspace({ apiKey, modelType, candidateName, questionTitle }) {
  const [chatWidth, setChatWidth] = useState(300);
  const isDragging = useRef(false);
  const [messages, setMessages] = useState([]);
  const [results, setresults] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  const [isCoding,setIsCoding]=useState(false);
  const transcriptBuffer = useRef([]);
  const summaryRef = useRef("");
  const conversationRef = useRef([]);
  const lastUsed = useRef(0);
  const lineCount=useRef(0);
  const isOn=useRef(false);
  const candidateWorkspace = useRef("");
  const chainRefs = useRef({
    summaryChain: null,
    interviewerChain: null,
    evaluatorChain: null
  });


  const handleMouseDown = () => {
    isDragging.current = true;
  }

  const handleMouseMove = (e) => {

    if (!isDragging.current)
      return;

    const newWidth = window.innerWidth - e.clientX; // from right side
    if (newWidth > 150 && newWidth < 600) {
      setChatWidth(newWidth);
    }

  }

  const handleMouseUp = () => {
    isDragging.current = false;
  }

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      alert("Sorry, your browser does not support text to speech.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // choose accent/language
    utterance.rate = 1;       // speed (0.1 - 10)
    utterance.pitch = 1;      // tone (0 - 2)
    utterance.volume = 1;     // volume (0 - 1)

    // Callback when speech ends - ensure full text is displayed
    utterance.onend = () => {
      console.log("Speech finished");
      setMessages(prev => {
        // Update with full text when speech finishes
        if (prev.length > 0 && prev[prev.length - 1].sender === "ai") {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "ai", text: text };
          return updated;
        }
        return prev;
      });
    };

    utterance.onboundary = (event) => {
      const currentText = text.substring(0, event.charIndex);
      setMessages(prev => {
        // if last message is from AI, update it
        if (prev.length > 0 && prev[prev.length - 1].sender === "ai") {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "ai", text: currentText };
          return updated;
        }

        // otherwise, add a new AI message
        return [...prev, { sender: "ai", text: currentText }];
      });
    };

    window.speechSynthesis.speak(utterance);
  };


  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {

    if (!apiKey) return;

    console.log(apiKey);
    console.log("Model Type:", modelType);

    // Initialize LLM based on model type
    let llm;
    
    if (modelType === 'gemini') {
      llm = new ChatGoogleGenerativeAI({
        apiKey,
        model: "gemini-2.5-flash", // newer model, faster for chat use
        temperature: 0.2,
      });
    } else if (modelType === 'groq') {
      llm = new ChatGroq({
        apiKey,
        model: "llama-3.3-70b-versatile", // Groq's faster model
        temperature: 0.2,
      });
    }

    const summaryPrompt = ChatPromptTemplate.fromTemplate(`
You are an AI assistant tasked with summarizing a technical interview.
The candidate has said the following recently:
{recent_history}

The existing summary of the interview so far is:
{existing_summary}

Update the summary with the new points, focusing on:
- Candidate's approach to coding problems
- Key mistakes or misunderstandings
- Hints already given
- Code changes
Keep the summary concise and relevant.
Return only the updated summary.
        `);
    chainRefs.current.summaryChain = summaryPrompt
      .pipe(llm)
      .pipe(new StringOutputParser());

    const interviewerPrompt = ChatPromptTemplate.fromTemplate(`
---        
            You are an AI Technical Interviewer.
You are currently interviewing {candidateName}.

🕒 Elapsed interview time: {elapsed_time} minutes
📝 Summary of the interview so far: {summary}
📝 Recent conversation: {recent_turns}
💻 Candidate's workspace/code: {workspace}
📥 Latest input from candidate: {input}
   Title of the question : {question_title}

      Your task is to conduct a 45-minute coding interview with the following flow:
1. Introduction phase – ask the candidate to introduce themselves.  
2. Problem statement phase – present the DSA problem and ask the candidate to explain their approach.  
3. Coding phase – let the candidate write the solution code, guide only if necessary.  
4. Review phase – review the solution, discuss edge cases, test cases, and optimizations.  
5. Follow-up phase – ask additional questions and give final feedback.  

⚡ Interview Rules:
- Total duration is **strictly 45 minutes**.  
- Use elapsed_time (minutes) provided with every input to pace the interview.  
- Respond **only when needed** (e.g., when the candidate is stuck, conceptually wrong, or finished a phase).  
- Provide **hints** instead of full solutions when the candidate struggles.  
- Respond in natural, human-like conversational style.
- End the interview gracefully at 45 minutes

Notes: -Right from your first response , send replies as if you are talking to the candidate , dont reply saying that you are follwoing my instruction or anyhting. 
       -Try to keep your replies short and to the point , not even too short, elaborate when needed like while explaining the question , or providing hints, try to save candidate time out of 45 minutes   
       -Dont necessarily reply to every thing the candidate says , you can sometimes return an empty response too escpecially when you think the candidate is trying to say 2-3 lines at once and has just said 1 line and is about to speak more , let him speak his mind and then respond 
        `);
    chainRefs.current.interviewerChain = interviewerPrompt
      .pipe(llm)
      .pipe(new StringOutputParser()); // ✅ replaces LLMChain

    const evaluatorPrompt = ChatPromptTemplate.fromTemplate(`
You are an AI Evaluator for a technical interview.
Candidate: {candidateName}

🕒 Elapsed interview time: {elapsed_time} minutes
📝 Summary of the interview so far: {summary}
💻 Candidate's workspace/code: {workspace}
📝 Recent conversation/changes: {recent_turns}
   Title of the leetcode question:{question_title}

Instructions:
- If elapsed_time is less than 45 minutes:
  - Evaluate the candidate **only based on the latest input and recent changes**.
  - Give **one short constructive suggestion** for improvement.
- If elapsed_time is 45 minutes or more:
  - Evaluate the candidate **based on the entire interview**, using the summary.
  - Give **2–3 major suggestions** addressing the whole interview.

Respond with only plain text feedback, no JSON or metrics.
`);
    chainRefs.current.evaluatorChain = evaluatorPrompt
      .pipe(llm)
      .pipe(new StringOutputParser());

  }, [modelType]);

  useEffect(() => {

    let count = 0;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) return; // not supported in this browser

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {

      window.speechSynthesis.cancel(); // stop any ongoing speech
      const lastResultObj = event.results[event.results.length - 1];

      console.log(lastResultObj[0].transcript);
      if (lastResultObj.isFinal) {
        console.log(-1);
        transcriptBuffer.current.push(lastResultObj[0].transcript);
      }
    };

    recognition.onstart = () => {
      console.log("🎧 onstart: listening...");
      count++;
      console.log(count);
    }

    recognition.onend = () => {
      console.warn("⚠️ Speech recognition stopped, restarting...");
      try {
        console.log("onend");
        if (count >= 1)
          setTimeout(() => recognition.start(), 500); // wait before restart 
        // 👈 automatically restart listening
      } catch (err) {
        console.error("Error restarting speech recognition:", err);
      }
    };


    try {
      recognition.start();
    } catch (err) {
      // ignore if already started
    }

    return () => {
      try { recognition.stop(); } catch (e) { }
    };
  }, []);

  // simple handler to send message from input box
  function handleSendMessage(text) {
    if (!text) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    conversationRef.current.push({ input: text, response: '' });
  }

  const processBatch = useCallback(async () => {

    if(isOn.current===true)
      return;

    
    isOn.current=true;
      
    if (transcriptBuffer.current.length === 0)
      {
        isOn.current=false; 
        return;
      }

      
    console.log("inside ");

    const batchInput = transcriptBuffer.current.join(' ');
    transcriptBuffer.current = [];

    const recentHistory = conversationRef.current.map(t => `Candidate: ${t.input}\nAI: ${t.response}`).join("\n");

    // ✅ Call summary chain
    const updatedSummary = await chainRefs.current.summaryChain.invoke({
      recent_history: recentHistory,
      existing_summary: summaryRef.current,
    });
    summaryRef.current = updatedSummary || '';

    // ✅ Call interviewer chain
    const aiResponse = await chainRefs.current.interviewerChain.invoke({
      input: batchInput,
      recent_turns: recentHistory,
      summary: summaryRef.current,
      workspace: candidateWorkspace.current,
      candidateName,
      elapsed_time: getElapsedTime(),
      question_title: questionTitle,
    });

    let elapsed = getElapsedTime()

    // ✅ Call evaluator chain
  
    if (lastUsed.current !== elapsed) {
      let result = await chainRefs.current.evaluatorChain.invoke({
        candidateName: candidateName,
        elapsed_time: getElapsedTime(),
        recent_turns: recentHistory,
        summary: summaryRef.current,
        workspace: candidateWorkspace.current,
        question_title: questionTitle,
      });

      console.log(result);
      setresults(result);
      console.log(result);
      lastUsed.current = elapsed;
    }

    conversationRef.current.push({ input: batchInput, response: aiResponse });
    setMessages(prev => [
      ...prev,
      { sender: "user", text: batchInput }
    ]);
    speakText(aiResponse);

    isOn.current=false;
  }, [getElapsedTime]);



  useEffect(() => {
    const interval = setInterval(processBatch, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(()=>{

    
    const newCount=code.split("\n").length;
    const difference=newCount-lineCount.current;

    if(difference>=3)
    {
      const newLines = code.split("\n").slice(-difference).join("\n");

    transcriptBuffer.current.push(newLines);

    lineCount.current = newCount;
    }
  },[code]);

  function getElapsedTime() {
    return Math.floor((Date.now() - startTimeRef.current) / 60000); // minutes
  }

  const startTimeRef = useRef(Date.now());

  return (
    <div className='flex h-screen w-screen'>
      <div className="flex-grow bg-white flex flex-col  p-4 space-y-4">
        
        <div className="flex justify-end mb-2">
  <button
    onClick={() => setIsCoding(prev => !prev)}
    className={`px-4 py-2 rounded font-medium ${
      isCoding ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
    }`}
  >
    {isCoding ? 'Coding Mode ON' : 'Enable Coding Mode'}
  </button>
</div>

        {/* Top: Code Editor */}
        {isCoding && (<div className="flex-1">
          <Editor
            height="100%"          // fills the top half
            defaultLanguage="javascript"
            defaultValue={code}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        </div>)}

        {!isCoding && (
          <div className="flex-1">Click on Enable Coding Button to enter the Code Area</div>
        )}

        {/* Bottom: Results */}
        <div className="h-64 w-full max-w-2xl mx-auto bg-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
            Live Evaluation Results
          </h2>

          {!results && (
            <p className="text-gray-500 text-lg text-center">Waiting for results...</p>
          )}

          {results && (
            <div className="p-3 bg-white rounded-lg border border-gray-300 text-gray-700">
              <strong>Feedback: </strong>
              {results}
            </div>
          )}
        </div>
      </div>


      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-gray-400 cursor-col-resize"
      ></div>

      <div className="bg-gray-100 border-l"
        style={{ width: `${chatWidth}px` }}
      >

        <div className="h-[85%] overflow-y-auto p-3 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg ${msg.sender === "user" ? "bg-blue-200" : "bg-green-200"
                }`}
            >
              <span className="font-bold">{msg.sender}:</span> {msg.text}
            </div>
          ))}
        </div>
        <div className="h-[15%] p-2 border-t flex items-center">
          <input
            type="text"
            placeholder="Type message here"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage(e.target.value);
                e.target.value = "";
              }
            }}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

    </div>
  );
}