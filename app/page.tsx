'use client';

import { useState, useRef } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (text: string, imageData?: string) => {
    const newMessages = [...messages, { role: 'user', content: text || "Uploaded an image" }];
    setMessages(newMessages);

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages, data: { image: imageData } }),
    });

    const result = await response.json();
    setMessages((prev) => [...prev, result]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        sendMessage('', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white self-end ml-10' : 'bg-white text-black self-start mr-10 shadow'}`}>
            {m.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2 bg-white p-2 rounded-xl shadow">
        <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-200 rounded-lg">📷</button>
        <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept="image/*" />
        <input 
          className="flex-1 outline-none" 
          placeholder="Type /ping or /belfood..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (sendMessage(input), setInput(''))}
        />
        <button onClick={() => { sendMessage(input); setInput(''); }} className="text-blue-500 font-bold">Send</button>
      </div>
    </div>
  );
}