/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// LevelUp: Element to show the last question above the response
// (Make sure <div id="lastQuestion" class="last-question-display"></div> is in your HTML)
const lastQuestionDisplay = document.getElementById("lastQuestion");

/* 🔗 YOUR CLOUDFLARE WORKER URL */
const workerUrl = "https://mute-math-5738.dtshibam.workers.dev";

/* 🧠 LevelUp: Maintain Conversation History */
// This array stores the context so the AI remembers previous parts of the chat.
let history = [
  { 
    role: "system", 
    content: "You are a L'Oréal Beauty Consultant. Only answer questions related to L'Oréal products, skincare, makeup, haircare, and fragrances. If the user asks an unrelated question, politely refuse and redirect them to beauty topics." 
  }
];

/* Initial greeting */
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
  
  // Clear input field for the next message
  userInput.value = "";

  // Show a temporary "Thinking..." message
  const thinkingId = appendMessage("L'Oréal Advisor is thinking...", "ai");

  try {
    // POST request to your Cloudflare Worker
    const res = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: history // Sending the full history for context
      })
    });

    const data = await res.json();
    
    // Remove the "Thinking..." bubble before showing the real answer
    const thinkingElement = document.getElementById(thinkingId);
    if (thinkingElement) thinkingElement.remove();

    if (data.choices && data.choices[0]) {
      const aiResponse = data.choices[0].message.content;
      
      // Add AI reply to UI and history
      appendMessage(aiResponse, "ai");
      history.push({ role: "assistant", content: aiResponse });
    } else {
      throw new Error("Invalid Response from Worker");
    }

  } catch (error) {
    console.error("Connection Error:", error);
    // Remove thinking message and show error
    const thinkingElement = document.getElementById(thinkingId);
    if (thinkingElement) thinkingElement.remove();
    
    appendMessage("I'm sorry, I'm having trouble connecting to my database. Please try again.", "ai");
  }
});

/**
 * Helper function to create chat bubbles
 * This handles the LevelUp for "Chat Conversation UI"
 * sender: 'user' or 'ai'
 */
function appendMessage(text, sender) {
  const msgDiv = document.createElement("div");
  const msgId = "msg-" + Date.now();
  
  msgDiv.id = msgId;
  // This matches the .msg.user and .msg.ai classes in your CSS
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  
  chatWindow.appendChild(msgDiv);
  
  // Auto-scroll the window so the newest message is always visible
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  return msgId;
}
