
import React, { useState, useRef } from 'react';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BufferMemory } from "langchain/memory";
import { useEffect } from 'react';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';


export default function Workspace({ apiKey, candidateName }) {
    const [chatWidth, setChatWidth] = useState(300);
    const isDragging = useRef(false);
    const chainRef = useRef(null);
    const [messages, setMessages] = useState([]);


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

        const llm = new ChatGoogleGenerativeAI({
            apiKey: apiKey,
            model: 'gemini-1.5-pro',
            temperature: 0.2
        });

        const memory = new BufferMemory({
            memoryKey: "history",
            inputKey: "input",
            outputKey: "response",
            returnMessages: true,
        });

        const prompt = new PromptTemplate({
            inputVariables: ["input", "history", "workspace", "candidateName", "transcript"],
            template: `
            You are an **AI Technical Interviewer**.  
You are currently interviewing the candidate: {candidateName}.

🕒 Elapsed interview time: {elapsed_time} minutes  
📝 Conversation so far: {history}  
🎤 Latest transcript from candidate: {transcript}  
💻 Candidate's workspace/code: {workspace}  
📥 Latest input from system/user: {input}  

---        
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
- End the interview gracefully at 45 minutes.  

📊 Evaluation Rules:
- After every candidate response, evaluate them on **5 metrics (out of 10 each):**
  1. DSA / Problem-Solving Ability  
  2. Logical Reasoning  
  3. Communication Skills  
  4. Testing Ability (writing diverse test cases)  
  5. Code Cleanliness & Readability  
          
  
- Always return scores in the following JSON format:
json
{
  "metrics": {
    "dsa": <score_out_of_10>,
    "logic": <score_out_of_10>,
    "communication": <score_out_of_10>,
    "testing": <score_out_of_10>,
    "code_cleanliness": <score_out_of_10>
  },
  "feedback": "<short constructive feedback>"
}
      `
        });

        chainRef.current = new LLMChain({
            llm,
            prompt,
            memory,
        });

    }, []);

    
    const handleSendMessage = async (input) => {
        if (!chainRef.current) return;
        setMessages((prev) => [...prev, { sender: 'user', text: input }]);

        try {
            const response = await chainRef.current.call({ input });
            setMessages((prev) => [...prev, { sender: 'ai', text: response.text }]);
        } catch (err) {
            console.error('Error calling Gemini:', err);
        }
    };


    return (
        <div className='flex h-screen w-screen'>

            <div className='flex-grow bg-white  flex items-center justify-center'>
                WhiteBoard Area
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