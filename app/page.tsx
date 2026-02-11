"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [commandStarted, setCommandStarted] = useState(false);

  const sendMessage = async () => {
    const formData = new FormData();
    formData.append("message", input);
    formData.append("commandStarted", commandStarted.toString());

    if (file) {
      formData.append("image", file);
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setMessages([
      ...messages,
      { role: "user", content: input || "📷 Image uploaded" },
      { role: "bot", content: data.reply },
    ]);

    if (input === "/belfood") {
      setCommandStarted(true);
    }

    setInput("");
    setFile(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-xs ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-white"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="p-3 bg-white flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
