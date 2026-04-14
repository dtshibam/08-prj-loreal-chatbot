/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const lastQuestionDisplay = document.getElementById("lastQuestion");

/* 🔗 CLOUDFLARE WORKER CONFIGURATION */
const workerUrl = "https://mute-math-5738.dtshibam.workers.dev";

/* 🧠 LevelUp: Conversation History (Context Awareness) */
let history = [
  { 
    role: "system", 
    content: "You are a L'Oréal Beauty Consultant. Only answer questions related to L'Oréal products, skincare, makeup, haircare, and fragrances. If the user asks an unrelated question, politely refuse and redirect them to beauty topics." 
  }
];

// Initial greeting
appendMessage("👋 Hello! I am your L'Oréal Beauty Advisor. How can I help you find the perfect routine today?", "ai");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // LevelUp: Display user question above response
  if (lastQuestionDisplay) {
    lastQuestionDisplay.textContent = `You asked: "${message}"`;
  }

  // Add user message to UI and history array
  appendMessage(message, "user");
  history.push({ role: "user", content: message });
  
  // Clear input
  userInput.value = "";

  // Show thinking state
  const thinkingId = appendMessage("L'Oréal Advisor is thinking...", "ai");

  try {
    const res = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });

    const data = await res.json();
    
    // Remove "Thinking..." message
    const thinkingElement = document.getElementById(thinkingId);
    if (thinkingElement) thinkingElement.remove();

    if (data.choices && data.choices[0]) {
      const aiResponse = data.choices[0].message.content;
      
      // Add AI reply to UI and history
      appendMessage(aiResponse, "ai");
      history.push({ role: "assistant", content: aiResponse });
    } else {
      throw new Error("Invalid Response");
    }

  } catch (error) {
    console.error("Error:", error);
    const thinkingElement = document.getElementById(thinkingId);
    if (thinkingElement) thinkingElement.remove();
    appendMessage("I'm sorry, I'm having trouble connecting to my beauty database.", "ai");
  }
});

/**
 * Helper function to create chat bubbles
 * Matches CSS classes: .msg.user and .msg.ai (or .user-message/.ai-message)
 */
function appendMessage(text, sender) {
  const msgDiv = document.createElement("div");
  const msgId = "msg-" + Date.now();
  
  msgDiv.id = msgId;
  // This uses 'user' or 'ai' to apply the correct CSS styling
  msgDiv.className = `message ${sender}-message`;
  msgDiv.textContent = text;
  
  chatWindow.appendChild(msgDiv);
  
  // Auto-scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  return msgId;
}
