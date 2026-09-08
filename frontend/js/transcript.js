/**
 * MeetMind Meeting Analysis & Interactive Transcript Workspace
 */

window.initTranscriptWorkspace = function() {
  // Load analysis data from localStorage or sessionStorage or fallback mock
  const rawData = localStorage.getItem('current_meeting_analysis') || sessionStorage.getItem('current_meeting_analysis');
  const meetingData = rawData ? JSON.parse(rawData) : MeetMindAPI.generateMockAnalysis("Q3_Product_Sprint_Sync.mp3");

  renderHeaderInfo(meetingData);
  renderSummary(meetingData);
  renderKeyTakeaways(meetingData);
  renderActionItems(meetingData);
  renderTranscript(meetingData);
  initAudioPlayer(meetingData);
  initSearchAndFilter(meetingData);
  initExportActions(meetingData);
  initDeleteMeeting(meetingData);

  // Auto-jump to timestamp if redirected from AI Assistant
  const jumpTs = sessionStorage.getItem('jump_timestamp');
  if (jumpTs) {
    sessionStorage.removeItem('jump_timestamp');
    setTimeout(() => {
      if (typeof window.seekAudioTo === 'function') {
        window.seekAudioTo(jumpTs);
      }
    }, 350);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.initTranscriptWorkspace === 'function') window.initTranscriptWorkspace();
});

/**
 * Render Header Information
 */
function renderHeaderInfo(data) {
  const titleEl = document.getElementById('meeting-title');
  const dateEl = document.getElementById('meeting-date');
  const durationEl = document.getElementById('meeting-duration');
  const fileNameEl = document.getElementById('meeting-file-name');

  if (titleEl) titleEl.textContent = data.title;
  if (dateEl) dateEl.textContent = data.meetingDate;
  if (durationEl) durationEl.textContent = data.duration;
  if (fileNameEl) fileNameEl.textContent = data.fileName;
}

/**
 * Render Executive Summary
 */
function renderSummary(data) {
  const summaryEl = document.getElementById('executive-summary-text');
  if (summaryEl) summaryEl.textContent = data.summary;
}

/**
 * Render Key Takeaways
 */
function renderKeyTakeaways(data) {
  const container = document.getElementById('key-takeaways-list');
  if (!container) return;

  const points = data.importantPoints || data.keyTakeaways || [];
  const decisions = data.decisions || [];
  const deadlines = data.deadlines || [];
  const questions = data.unresolvedQuestions || [];

  let html = '';

  if (points.length > 0) {
    html += points.map(point => `
      <li class="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container transition-colors">
        <span class="material-symbols-outlined text-primary text-[20px] mt-0.5" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        <span class="font-body-md text-on-surface text-sm leading-relaxed">${point}</span>
      </li>
    `).join('');
  }

  if (decisions.length > 0) {
    html += `<li class="font-bold text-xs uppercase tracking-wider text-primary pt-2 pb-1">Decisions Made</li>`;
    html += decisions.map(d => `
      <li class="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-on-surface">
        <span class="material-symbols-outlined text-emerald-500 text-[20px] mt-0.5">verified</span>
        <span class="font-body-md text-sm leading-relaxed">${d}</span>
      </li>
    `).join('');
  }

  if (deadlines.length > 0) {
    html += `<li class="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 pt-2 pb-1">Deadlines</li>`;
    html += deadlines.map(dl => `
      <li class="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-on-surface">
        <span class="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">event</span>
        <span class="font-body-md text-sm leading-relaxed">${dl}</span>
      </li>
    `).join('');
  }

  if (questions.length > 0) {
    html += `<li class="font-bold text-xs uppercase tracking-wider text-tertiary pt-2 pb-1">Unresolved Questions</li>`;
    html += questions.map(q => `
      <li class="flex items-start gap-3 p-3 rounded-xl bg-tertiary/10 border border-tertiary/20 text-on-surface">
        <span class="material-symbols-outlined text-tertiary text-[20px] mt-0.5">help_outline</span>
        <span class="font-body-md text-sm leading-relaxed">${q}</span>
      </li>
    `).join('');
  }

  container.innerHTML = html;
}

/**
 * Render Action Items with Checkboxes
 */
function renderActionItems(data) {
  const container = document.getElementById('action-items-list');
  const countEl = document.getElementById('action-items-count');

  if (!container || !data.actionItems) return;

  if (countEl) countEl.textContent = `${data.actionItems.filter(i => i.completed).length}/${data.actionItems.length}`;

  container.innerHTML = data.actionItems.map((item, idx) => `
    <div class="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 transition-all group">
      <div class="flex items-center gap-3">
        <input type="checkbox" id="action-item-${idx}" ${item.completed ? 'checked' : ''} onchange="toggleActionItem(${idx})" class="w-4 h-4 rounded text-primary border-outline focus:ring-primary cursor-pointer">
        <label for="action-item-${idx}" class="font-body-md text-sm text-on-surface cursor-pointer ${item.completed ? 'line-through opacity-60' : ''}">${item.text}</label>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-full text-xs font-label-sm ${item.priority === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-surface-container text-on-surface-variant'}">${item.assignee || 'Unassigned'}</span>
      </div>
    </div>
  `).join('');
}

window.toggleActionItem = function(index) {
  const rawData = localStorage.getItem('current_meeting_analysis') || sessionStorage.getItem('current_meeting_analysis');
  if (!rawData) return;
  const data = JSON.parse(rawData);

  if (data.actionItems && data.actionItems[index]) {
    data.actionItems[index].completed = !data.actionItems[index].completed;
    const updated = JSON.stringify(data);
    localStorage.setItem('current_meeting_analysis', updated);
    sessionStorage.setItem('current_meeting_analysis', updated);
    renderActionItems(data);
    showToast(`Action item updated!`, 'success');
  }
};

/**
 * Render Full Interactive Transcript
 */
function renderTranscript(data, filterKeyword = "", selectedSpeaker = "all") {
  const container = document.getElementById('transcript-container');
  if (!container) return;

  let items = data.transcript || [];

  if (selectedSpeaker !== 'all') {
    items = items.filter(t => t.speaker.toLowerCase() === selectedSpeaker.toLowerCase());
  }

  if (filterKeyword.trim() !== '') {
    const k = filterKeyword.toLowerCase();
    items = items.filter(t => t.text.toLowerCase().includes(k) || t.speaker.toLowerCase().includes(k));
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-[40px] mb-2 text-outline">search_off</span>
        <p class="font-body-md text-sm">No matching transcript lines found.</p>
      </div>
    `;
    return;
  }

  const speakerColors = {
    "Sarah Jenkins": "speaker-badge-sarah",
    "Alex Rivera": "speaker-badge-alex",
    "David Chen": "speaker-badge-david"
  };

  container.innerHTML = items.map(line => `
    <div class="transcript-line group flex gap-4 p-3.5 rounded-xl transition-colors cursor-pointer" onclick="seekAudioTo('${line.timestamp}')">
      <div class="flex flex-col items-center pt-0.5">
        <span class="font-code-sm text-xs font-mono timestamp-badge px-2 py-0.5 rounded-md">${line.timestamp}</span>
      </div>
      <div class="flex-1 flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="font-label-md text-xs font-semibold px-2 py-0.5 rounded-md ${speakerColors[line.speaker] || 'bg-surface-container text-on-surface'}">${line.speaker}</span>
        </div>
        <p class="font-body-md text-sm text-on-surface leading-relaxed">${highlightKeyword(line.text, filterKeyword)}</p>
      </div>
    </div>
  `).join('');
}

function highlightKeyword(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, `<mark class="bg-amber-200 dark:bg-amber-900/60 dark:text-amber-100 rounded px-1">$1</mark>`);
}

/**
 * Interactive Audio Player & Wide Waveform Seeking
 */
function initAudioPlayer(data) {
  const playBtn = document.getElementById('btn-play-pause');
  const pulseRing = document.getElementById('player-pulse-ring');
  const statusDot = document.getElementById('player-status-dot');
  const currentTimeEl = document.getElementById('player-current-time');
  const totalTimeEl = document.getElementById('player-total-time');
  const waveContainer = document.getElementById('waveform-bar-container');
  const waveArea = document.getElementById('waveform-interactive-area');
  const playhead = document.getElementById('waveform-playhead');
  const tooltip = document.getElementById('waveform-tooltip');

  let isPlaying = false;
  let currentSeconds = 0;
  let isDragging = false;

  // Initialize Singleton HTML5 Audio Instance
  if (!window.meetmindAudio) {
    window.meetmindAudio = new Audio();
  }
  const audio = window.meetmindAudio;

  const audioSrc = data.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  if (audio.src !== audioSrc) {
    audio.src = audioSrc;
  }

  // Calculate total seconds from duration string e.g. "42 mins" or "42:00"
  let totalSeconds = 42 * 60; // Default 42 mins
  if (data.duration) {
    if (data.duration.includes('min')) {
      const parsedMins = parseInt(data.duration);
      if (!isNaN(parsedMins)) totalSeconds = parsedMins * 60;
    } else if (data.duration.includes(':')) {
      const parts = data.duration.split(':');
      totalSeconds = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
    }
  }

  if (totalTimeEl) totalTimeEl.textContent = formatTime(totalSeconds);

  audio.onloadedmetadata = () => {
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      totalSeconds = audio.duration;
      if (totalTimeEl) totalTimeEl.textContent = formatTime(totalSeconds);
    }
  };

  audio.ontimeupdate = () => {
    currentSeconds = audio.currentTime;
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      totalSeconds = audio.duration;
    }
    updatePlayerUI();
  };

  audio.onended = () => {
    setPlayState(false);
    currentSeconds = 0;
    updatePlayerUI();
  };

  // Generate 52 dynamic waveform bars with organic speech volume curve profile
  const NUM_BARS = 52;
  const barHeights = [];
  if (waveContainer) {
    waveContainer.innerHTML = '';
    for (let i = 0; i < NUM_BARS; i++) {
      const baseHeight = Math.floor(20 + Math.abs(Math.sin(i * 0.45) * 65) + (i % 3 === 0 ? 15 : -10));
      const clampedHeight = Math.max(15, Math.min(95, baseHeight));
      barHeights.push(clampedHeight);

      const bar = document.createElement('div');
      bar.className = 'waveform-bar';
      bar.style.height = `${clampedHeight}%`;
      bar.dataset.index = i;
      waveContainer.appendChild(bar);
    }
  }

  const bars = waveContainer ? Array.from(waveContainer.children) : [];

  // Helper: Format seconds to MM:SS or HH:MM:SS
  function formatTime(secs) {
    const s = Math.floor(Math.max(0, secs));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const remainingSecs = s % 60;

    const formattedS = remainingSecs < 10 ? `0${remainingSecs}` : `${remainingSecs}`;

    if (h > 0) {
      const formattedM = m < 10 ? `0${m}` : `${m}`;
      return `${h}:${formattedM}:${formattedS}`;
    }
    return `${m < 10 ? '0' + m : m}:${formattedS}`;
  }

  // Update Player UI state (currentTime text, playhead position, played bars styling)
  function updatePlayerUI() {
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentSeconds);

    const pct = Math.max(0, Math.min(100, (currentSeconds / totalSeconds) * 100));

    if (playhead) {
      playhead.style.left = `${pct}%`;
    }

    const playedIndex = Math.floor((pct / 100) * NUM_BARS);
    bars.forEach((bar, idx) => {
      if (idx <= playedIndex) {
        bar.classList.add('played');
      } else {
        bar.classList.remove('played');
      }
    });
  }

  function setPlayState(active) {
    isPlaying = active;
    const icon = playBtn ? playBtn.querySelector('.material-symbols-outlined') : null;
    if (active) {
      if (icon) icon.textContent = 'pause';
      if (pulseRing) pulseRing.classList.remove('hidden');
      if (statusDot) {
        statusDot.classList.remove('bg-primary/40');
        statusDot.classList.add('bg-emerald-500', 'animate-pulse');
      }
    } else {
      if (icon) icon.textContent = 'play_arrow';
      if (pulseRing) pulseRing.classList.add('hidden');
      if (statusDot) {
        statusDot.classList.add('bg-primary/40');
        statusDot.classList.remove('bg-emerald-500', 'animate-pulse');
      }
    }
  }

  // Seek Audio to given seconds
  function seekToSeconds(seconds, silent = false) {
    currentSeconds = Math.max(0, Math.min(seconds, totalSeconds));
    if (!isNaN(currentSeconds) && isFinite(currentSeconds)) {
      try {
        audio.currentTime = currentSeconds;
      } catch (e) {}
    }
    updatePlayerUI();
    if (!silent) {
      showToast(`Jumped audio to ${formatTime(currentSeconds)}`, 'info', 2000);
    }
  }

  // Global Timestamp Seeker from transcript line clicks
  window.seekAudioTo = function(timestampStr) {
    const parts = timestampStr.split(':');
    let secs = 0;
    if (parts.length === 2) {
      secs = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
    } else if (parts.length === 3) {
      secs = (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
    }
    seekToSeconds(secs);
  };

  // Playback Control (Play / Pause)
  function togglePlay() {
    if (audio.paused) {
      audio.play().then(() => {
        setPlayState(true);
        showToast('Playback started', 'info', 1800);
      }).catch(err => {
        console.warn("Audio playback issue:", err);
        setPlayState(true);
      });
    } else {
      audio.pause();
      setPlayState(false);
      showToast('Playback paused', 'info', 1800);
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', togglePlay);
  }

  // Interactive Waveform Mouse & Drag Controls
  if (waveArea) {
    function getSecondsFromMouseEvent(e) {
      const rect = waveArea.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const pct = clickX / rect.width;
      return { pct, seconds: Math.floor(pct * totalSeconds), clickX, rectWidth: rect.width };
    }

    waveArea.addEventListener('mousemove', (e) => {
      const { seconds, clickX } = getSecondsFromMouseEvent(e);

      if (tooltip) {
        tooltip.textContent = formatTime(seconds);
        tooltip.style.left = `${clickX}px`;
        tooltip.classList.remove('opacity-0');
      }

      if (isDragging) {
        seekToSeconds(seconds, true);
      }
    });

    waveArea.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.add('opacity-0');
      isDragging = false;
    });

    waveArea.addEventListener('mousedown', (e) => {
      isDragging = true;
      const { seconds } = getSecondsFromMouseEvent(e);
      seekToSeconds(seconds);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
      }
    });
  }

  // Initial render of timeline UI
  updatePlayerUI();
}

/**
 * Transcript Search & Speaker Filter
 */
function initSearchAndFilter(data) {
  const searchInput = document.getElementById('transcript-search-input');
  const speakerSelect = document.getElementById('transcript-speaker-select');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderTranscript(data, e.target.value, speakerSelect ? speakerSelect.value : 'all');
    });
  }

  if (speakerSelect) {
    speakerSelect.addEventListener('change', (e) => {
      renderTranscript(data, searchInput ? searchInput.value : '', e.target.value);
    });
  }
}

/**
 * Export Notes & Action Items
 */
function initExportActions(data) {
  const exportBtn = document.getElementById('btn-export-notes');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    const content = `MeetMind Report: ${data.title} (${data.meetingDate})
--------------------------------------------------
Summary:
${data.summary}

Key Takeaways:
${data.keyTakeaways.map(t => `- ${t}`).join('\n')}

Action Items:
${data.actionItems.map(a => `[${a.completed ? 'X' : ' '}] ${a.text} (${a.assignee})`).join('\n')}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '_')}_Notes.txt`;
    a.click();
    showToast('Meeting notes exported!', 'success');
  });
}

/**
 * Delete Active Meeting Analysis
 */
function initDeleteMeeting(data) {
  const deleteBtn = document.getElementById('btn-delete-meeting');
  if (!deleteBtn) return;

  deleteBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    localStorage.removeItem('current_meeting_analysis');
    sessionStorage.removeItem('current_meeting_analysis');
    if (window.showToast) {
      window.showToast('Meeting deleted successfully. Ready for a new upload.', 'success', 3000);
    }
    setTimeout(() => {
      window.location.href = 'upload.html';
    }, 400);
  };
}
