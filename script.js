/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// LevelUp: Element to show the last question (Make sure this ID is in your HTML)
const lastQuestionDisplay = document.getElementById("lastQuestion");

// LevelUp: Maintain Conversation History (context awareness)
let history = [
  { 
    role: "system", 
    content: "You are a L'Oréal Beauty Consultant. Only answer questions related to L'Oréal products, skincare, makeup, haircare, and fragrances. If the user asks an unrelated question, politely refuse and redirect them to beauty topics." 
  }
];

/* Initial message */
appendMessage("👋 Hello! I am your L'Oréal Beauty Advisor. How can I help you today?", "ai");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // LevelUp: Display user question above response
  if (lastQuestionDisplay) {
    lastQuestionDisplay.textContent = `You asked: "${message}"`;
  }

  // Add user message to UI and history
  appendMessage(message, "user");
  history.push({ role: "user", content: message });
  
  // Clear input field
  userInput.value = "";

  // Show thinking state
  const thinkingId = appendMessage("Thinking...", "ai");

  try {
    // API Call to OpenAI (Using your secrets.js key)
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${api_key}` // Pulls from your secrets.js
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: history
      })
    });

    const data = await res.json();
    
    // Remove "Thinking..." message
    document.getElementById(thinkingId).remove();

    if (data.choices && data.choices[0]) {
      const aiResponse = data.choices[0].message.content;
      
      // Add AI reply to UI and history
      appendMessage(aiResponse, "ai");
      history.push({ role: "assistant", content: aiResponse });
    } else {
      throw new Error("Invalid API Response");
    }

  } catch (error) {
    console.error("Error:", error);
    document.getElementById(thinkingId).remove();
    appendMessage("I'm sorry, I encountered a connection error. Please try again later.", "ai");
  }
});

/**
 * Helper function to create chat bubbles
 * Matches the CSS classes: .msg.user and .msg.ai
 */
function appendMessage(text, sender) {
  const msgDiv = document.createElement("div");
  const msgId = "msg-" + Date.now();
  
  msgDiv.id = msgId;
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  
  chatWindow.appendChild(msgDiv);
  
  // Auto-scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  return msgId;
}
