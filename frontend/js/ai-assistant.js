/**
 * MeetMind AI Assistant Interactive Q&A
 */

window.initAIAssistantPage = function() {
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const chatMessages = document.getElementById('ai-chat-messages');
  const promptPills = document.querySelectorAll('.ai-prompt-pill');

  // Load active transcript context if available, otherwise use default active meeting context
  const rawData = sessionStorage.getItem('current_meeting_analysis') || localStorage.getItem('current_meeting_analysis');
  const meetingData = rawData ? JSON.parse(rawData) : MeetMindAPI.generateMockAnalysis("Q3_Product_Sprint_Sync.mp3");

  if (promptPills.length > 0) {
    promptPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const text = pill.dataset.prompt || pill.innerText.trim();
        if (chatInput) {
          chatInput.value = text;
          submitQuestion(text);
        }
      });
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const question = chatInput ? chatInput.value.trim() : '';
      if (question) {
        submitQuestion(question);
      }
    });
  }

  async function submitQuestion(question) {
    if (!question || !chatMessages) return;

    // Clear input
    if (chatInput) chatInput.value = '';

    // Append User Message Bubble
    appendUserMessage(question);

    // Append Typing Indicator
    const typingBubble = appendTypingIndicator();
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      // Query API / Gemini Backend Service
      const aiResponse = await MeetMindAPI.askAI(question, meetingData ? (meetingData.transcript || []) : []);

      // Remove typing bubble and append AI response with typing effect
      typingBubble.remove();
      appendAIMessage(aiResponse.answer || "I parsed your transcript context but could not form a detailed answer.", aiResponse.citations || []);
    } catch (err) {
      typingBubble.remove();
      appendAIMessage("Sorry, I encountered an issue processing your query. Please try again.", []);
    }
  }

  function appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start justify-end gap-3 mb-4';
    msgDiv.innerHTML = `
      <div class="max-w-xl p-4 rounded-2xl rounded-tr-sm bg-primary text-on-primary font-body-md text-sm shadow-sm">
        ${escapeHTML(text)}
      </div>
      <div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
        <span class="material-symbols-outlined text-[18px]">person</span>
      </div>
    `;
    chatMessages.appendChild(msgDiv);
  }

  function appendTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'flex items-start gap-3 mb-4';
    typingDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
      </div>
      <div class="p-4 rounded-2xl rounded-tl-sm bg-surface-container-high text-on-surface font-body-md text-sm shadow-sm flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-primary typing-dot-1"></span>
        <span class="w-2 h-2 rounded-full bg-primary typing-dot-2"></span>
        <span class="w-2 h-2 rounded-full bg-primary typing-dot-3"></span>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    return typingDiv;
  }

  function appendAIMessage(answerText, citations = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start gap-3 mb-4';

    const citationHTML = (citations && citations.length > 0) ? `
      <div class="mt-3 pt-3 border-t border-outline-variant/30 flex items-center gap-2 flex-wrap">
        <span class="font-label-sm text-xs text-on-surface-variant font-medium">Source Timestamps:</span>
        ${citations.map(c => `
          <button onclick="jumpToTimestamp('${c}')" class="px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-code-sm text-xs font-semibold transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">schedule</span>
            ${c}
          </button>
        `).join('')}
      </div>
    ` : '';

    let formattedAnswer = (answerText || "")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\* /g, '• ');

    msgDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 mt-1 shadow-sm">
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
      </div>
      <div class="max-w-2xl p-4 rounded-2xl rounded-tl-sm bg-surface-container-high text-on-surface font-body-md text-sm shadow-sm leading-relaxed">
        ${formattedAnswer}
        ${citationHTML}
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  window.jumpToTimestamp = function(ts) {
    sessionStorage.setItem('jump_timestamp', ts);
    window.location.href = 'transcript.html';
  };

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.initAIAssistantPage === 'function') window.initAIAssistantPage();
});
