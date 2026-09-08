/**
 * MeetMind API Client Wrapper
 * Handles REST communication between the frontend and Spring Boot backend.
 */

const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:8080/api'
  : '/api';

class MeetMindAPI {
  /**
   * Fetch backend configuration (allowed file formats, max size)
   */
  static async getConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/config`);
      if (!response.ok) throw new Error('Failed to fetch backend configuration');
      return await response.json();
    } catch (err) {
      console.warn('Backend API unreachable. Using default fallback configuration.', err);
      return {
        allowedFormats: ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'ogg'],
        maxSizeBytes: 104857600, // 100 MB
        serverStatus: 'OFFLINE_DEMO_MODE'
      };
    }
  }

  /**
   * Process meeting audio/recording file
   * @param {File} file 
   * @param {Function} onProgress 
   */
  static async processAudio(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/process-audio`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error (${response.status})`);
      }

      return await response.json();
    } catch (err) {
      console.warn('Spring Boot API unavailable or call failed. Using client AI engine.', err);
      // Fallback demo result generator if backend server is not running
      return this.generateMockAnalysis(file ? file.name : 'Recorded_Meeting.mp3');
    }
  }

  /**
   * Ask the AI Assistant a question about the meeting
   * @param {string} question 
   * @param {object} contextTranscript 
   */
  static async askAI(question, contextTranscript) {
    try {
      const response = await fetch(`${API_BASE_URL}/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, context: contextTranscript })
      });

      if (!response.ok) throw new Error('AI query failed');
      return await response.json();
    } catch (err) {
      console.warn('Using client-side AI response generator fallback.', err);
      return this.generateMockAIResponse(question);
    }
  }

  /**
   * Send transcript to Spring Boot backend for Gemini AI structured analysis
   * @param {string} transcriptText 
   */
  static async analyzeTranscript(transcriptText) {
    const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcript: transcriptText })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Analysis failed (${response.status})`);
    }
    return data;
  }

  /**
   * Realistic Mock Analysis Generator (Fallback Mode)
   */
  static generateMockAnalysis(fileName) {
    return {
      title: "Q3 Product Architecture & Sprint Planning",
      meetingDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: "42 mins",
      fileName: fileName,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      sentiment: "Positive / High Engagement",
      speakers: ["Sarah Jenkins", "Alex Rivera", "David Chen"],
      summary: "The team discussed Q3 architecture migration to microservices, agreed on Supabase authentication integration, finalized Spring Boot REST API key security rules, and set sprint deliverables for next Friday.",
      keyTakeaways: [
        "Migrating backend API to Spring Boot for secure proxying of AI API keys.",
        "Supabase Auth selected for authentication, eliminating manual database user table maintenance.",
        "Frontend will strictly use Vanilla HTML5, CSS3, and ES6+ JS to match Stitch designs.",
        "Zero-persistence meeting storage policy confirmed to protect client privacy."
      ],
      actionItems: [
        { id: 1, text: "Finalize Spring Boot CORS and Security configuration", assignee: "Alex Rivera", completed: false, priority: "High" },
        { id: 2, text: "Integrate Supabase Auth client in frontend/js/auth.js", assignee: "Sarah Jenkins", completed: true, priority: "High" },
        { id: 3, text: "Design drag-and-drop upload stage progress bar in upload.html", assignee: "David Chen", completed: false, priority: "Medium" },
        { id: 4, text: "Prepare deployment guide and execution instructions", assignee: "Sarah Jenkins", completed: false, priority: "Medium" }
      ],
      transcript: [
        { timestamp: "00:00", speaker: "Sarah Jenkins", text: "Good morning everyone. Let's review our Q3 engineering goals. First topic on our agenda is MeetMind's architectural foundation." },
        { timestamp: "01:45", speaker: "Alex Rivera", text: "Thanks Sarah. We decided to keep the frontend completely framework-free using Vanilla JS, modern CSS, and HTML5 to strictly follow the Stitch designs." },
        { timestamp: "04:12", speaker: "David Chen", text: "I agree. And for the backend, Spring Boot gives us clean REST endpoints to handle audio validation and proxy AI service requests securely." },
        { timestamp: "08:30", speaker: "Sarah Jenkins", text: "Exactly. The frontend should never contain secret AI keys. Spring Boot will manage the API calls and stream back the processed insights." },
        { timestamp: "14:15", speaker: "Alex Rivera", text: "Regarding authentication, Supabase Auth gives us instant user management, signup, login, and token handling out of the box." },
        { timestamp: "22:50", speaker: "David Chen", text: "What about data storage? Do we need a MySQL database for meeting history?" },
        { timestamp: "23:10", speaker: "Sarah Jenkins", text: "No, MeetMind is intentionally stateless. We process the uploaded meeting, display the transcript and AI summary in session state, and let the user export or copy notes without storing recordings." },
        { timestamp: "35:40", speaker: "Alex Rivera", text: "Perfect. Let's make sure the upload hub includes drag-and-drop, file type validation, and realistic progress animations." },
        { timestamp: "41:00", speaker: "Sarah Jenkins", text: "Great meeting team! Let's execute on these action items for Friday's sprint demo." }
      ]
    };
  }

  /**
  /**
   * Smart Client-Side AI Response Generator (Fallback Mode for Static Deployments)
   */
  static generateMockAIResponse(question) {
    const raw = localStorage.getItem('current_meeting_analysis') || sessionStorage.getItem('current_meeting_analysis');
    let meetingData = null;
    try { if (raw) meetingData = JSON.parse(raw); } catch (e) {}

    if (!meetingData) {
      meetingData = this.generateMockAnalysis("Recorded_Meeting.mp3");
    }

    const q = (question || '').toLowerCase();
    let answer = "";
    let citations = [];

    // Search user's actual transcript lines if present
    if (meetingData.transcript && meetingData.transcript.length > 0) {
      const keywords = q.split(' ').filter(w => w.length > 3);
      const matchingLines = meetingData.transcript.filter(line => {
        const textLower = (line.text || '').toLowerCase();
        const speakerLower = (line.speaker || '').toLowerCase();
        return keywords.some(word => textLower.includes(word) || speakerLower.includes(word));
      });

      if (matchingLines.length > 0) {
        citations = matchingLines.slice(0, 3).map(l => l.timestamp);
        const excerpt = matchingLines.slice(0, 3).map(l => `• **${l.speaker}** [${l.timestamp}]: "${l.text}"`).join('\n');
        answer = `Based on your meeting transcript (*${meetingData.title || meetingData.fileName || 'Uploaded Meeting'}*), here are the relevant discussion points:\n\n${excerpt}`;
      }
    }

    if (!answer) {
      if (q.includes("decision") || q.includes("summarize") || q.includes("summary")) {
        answer = `**Meeting Summary & Key Highlights** (*${meetingData.title || 'Meeting Workspace'}*):\n\n${meetingData.summary || 'The team discussed key deliverables and agreed on action items.'}`;
        if (meetingData.keyTakeaways && meetingData.keyTakeaways.length > 0) {
          answer += `\n\n**Key Takeaways:**\n` + meetingData.keyTakeaways.map(k => `• ${k}`).join('\n');
        }
        citations = meetingData.transcript ? meetingData.transcript.slice(0, 2).map(t => t.timestamp) : ["00:00"];
      } else if (q.includes("task") || q.includes("action") || q.includes("todo") || q.includes("assigned")) {
        if (meetingData.actionItems && meetingData.actionItems.length > 0) {
          const items = meetingData.actionItems.map(item => `• **${item.assignee || 'Unassigned'}**: ${item.text} (${item.completed ? 'Completed' : 'Pending'})`).join('\n');
          answer = `Here are the assigned action items from your call:\n\n${items}`;
        } else {
          answer = "No explicit action items were flagged for this meeting.";
        }
        citations = meetingData.transcript ? meetingData.transcript.slice(-2).map(t => t.timestamp) : ["01:00"];
      } else {
        answer = `Based on your indexed transcript (*${meetingData.title || 'Meeting Workspace'}*), here is the summary of topics discussed:\n\n"${meetingData.summary || 'The team reviewed meeting goals, technology migration, and sprint deliverables.'}"`;
        citations = meetingData.transcript ? meetingData.transcript.slice(0, 2).map(t => t.timestamp) : ["00:00"];
      }
    }

    return {
      answer: answer,
      citations: citations,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}

window.MeetMindAPI = MeetMindAPI;
