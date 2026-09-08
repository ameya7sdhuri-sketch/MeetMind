/**
 * MeetMind Upload Hub & Processing Logic
 */

window.initUploadPage = function() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('btn-browse-files');

  const viewUpload = document.getElementById('view-upload');
  const viewProcessing = document.getElementById('view-processing');
  const viewError = document.getElementById('view-error');

  const progressPercentText = document.getElementById('progress-percent');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const currentStageText = document.getElementById('current-stage-text');
  const currentFileNameText = document.getElementById('current-file-name');
  const errorMessageText = document.getElementById('error-message-text');

  // Check authentication state for upload page
  if (window.authManager) {
    window.authManager.getCurrentUser().then(user => {
      const authBanner = document.getElementById('auth-required-banner');
      if (!user && authBanner) {
        authBanner.classList.remove('hidden');
      } else if (authBanner) {
        authBanner.classList.add('hidden');
      }
    });
  }

  // Check for existing active meeting in localStorage or sessionStorage
  const activeBanner = document.getElementById('active-meeting-banner');
  const activeNameText = document.getElementById('active-meeting-name');
  const deleteActiveBtn = document.getElementById('btn-delete-active-meeting');

  const rawActiveData = localStorage.getItem('current_meeting_analysis') || sessionStorage.getItem('current_meeting_analysis');
  if (rawActiveData && activeBanner) {
    try {
      const activeData = JSON.parse(rawActiveData);
      if (activeNameText) activeNameText.textContent = `${activeData.title || activeData.fileName || 'Active Meeting'} (${activeData.duration || 'Analyzed'})`;
      activeBanner.classList.remove('hidden');
    } catch (e) {
      activeBanner.classList.add('hidden');
    }
  } else if (activeBanner) {
    activeBanner.classList.add('hidden');
  }

  if (deleteActiveBtn) {
    deleteActiveBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      localStorage.removeItem('current_meeting_analysis');
      sessionStorage.removeItem('current_meeting_analysis');
      if (activeBanner) activeBanner.classList.add('hidden');
      if (window.showToast) {
        window.showToast('Active meeting deleted. Ready to upload a new recording.', 'info', 3000);
      }
    };
  }

  // Click to browse file
  if (browseBtn) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  dropArea.addEventListener('click', () => {
    fileInput.click();
  });

  // Drag and drop event handlers
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add('dropzone-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('dropzone-active');
    }, false);
  });

  // Handle dropped file
  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  // Handle file picker selection
  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length > 0) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  /**
   * Main File Handler
   */
  async function handleFileSelected(file) {
    if (!file) return;

    hideDropzoneError();

    // Check authentication requirement
    const currentUser = window.authManager ? await window.authManager.getCurrentUser() : null;
    if (!currentUser) {
      fileInput.value = '';
      showDropzoneValidationError('Sign in required: Please sign in or create an account before uploading meeting recordings.');
      if (window.showToast) {
        window.showToast('Please sign in or create an account to upload meetings.', 'error', 4000);
      }
      const authBanner = document.getElementById('auth-required-banner');
      if (authBanner) authBanner.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      }, 1200);
      return;
    }

    const validExtensions = ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'ogg'];
    const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
    const mimeType = (file.type || '').toLowerCase();

    // Check for document files (PDF, DOCX, TXT, images, executables)
    const isDocumentOrInvalid = mimeType.includes('pdf') || 
                                mimeType.includes('document') || 
                                mimeType.includes('text') || 
                                mimeType.includes('image') || 
                                (mimeType.includes('application') && !mimeType.includes('ogg'));

    if (!validExtensions.includes(ext) || isDocumentOrInvalid || (mimeType !== '' && !mimeType.startsWith('audio/') && !mimeType.startsWith('video/'))) {
      fileInput.value = '';
      const displayType = ext ? `.${ext.toUpperCase()}` : 'document';
      showDropzoneValidationError(`File format restricted (${displayType}). Please upload an audio or video recording file (.mp3, .wav, .m4a, .mp4, .webm, .ogg). PDFs and documents are not accepted.`);
      return;
    }

    if (file.size > 150 * 1024 * 1024) { // 150MB
      fileInput.value = '';
      showDropzoneValidationError(`File size exceeds 150MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`);
      return;
    }

    // Display filename and switch view to processing state
    if (currentFileNameText) currentFileNameText.textContent = file.name;
    switchViewState('processing');

    // Simulate multi-stage pipeline progress
    const stages = [
      { pct: 15, text: 'Uploading audio file...' },
      { pct: 38, text: 'Extracting audio & noise cancellation...' },
      { pct: 65, text: 'Transcribing speech & identifying speakers...' },
      { pct: 88, text: 'Generating AI summary, decisions & action items...' },
      { pct: 100, text: 'Finalizing meeting intelligence report...' }
    ];

    let currentStageIndex = 0;

    const interval = setInterval(() => {
      if (currentStageIndex < stages.length) {
        const stage = stages[currentStageIndex];
        updateProgressUI(stage.pct, stage.text);
        currentStageIndex++;
      } else {
        clearInterval(interval);
        finishProcessing(file);
      }
    }, 1200);
  }

  function showDropzoneValidationError(msg) {
    const banner = document.getElementById('dropzone-error-banner');
    const textEl = document.getElementById('dropzone-error-text');
    if (banner && textEl) {
      textEl.textContent = msg;
      banner.classList.remove('hidden');
    }
    if (window.showToast) {
      showToast(msg, 'error', 4500);
    }
    if (dropArea) {
      dropArea.classList.add('border-red-500', 'bg-red-50/20');
      setTimeout(() => {
        dropArea.classList.remove('border-red-500', 'bg-red-50/20');
      }, 2000);
    }
  }

  function hideDropzoneError() {
    const banner = document.getElementById('dropzone-error-banner');
    if (banner) banner.classList.add('hidden');
  }

  function updateProgressUI(pct, stageText) {
    if (progressPercentText) progressPercentText.textContent = `${pct}%`;
    if (progressBarFill) progressBarFill.style.width = `${pct}%`;
    if (currentStageText) currentStageText.textContent = stageText;
  }

  async function finishProcessing(file) {
    try {
      const analysisResult = await MeetMindAPI.processAudio(file);

      // Create ObjectURL for instant HTML5 Audio playback if file is present
      if (file) {
        try {
          analysisResult.audioUrl = URL.createObjectURL(file);
        } catch (e) {}
      }

      const jsonStr = JSON.stringify(analysisResult);
      localStorage.setItem('current_meeting_analysis', jsonStr);
      sessionStorage.setItem('current_meeting_analysis', jsonStr);

      showToast('Meeting analysis complete!', 'success');
      setTimeout(() => {
        window.location.href = 'transcript.html';
      }, 500);
    } catch (err) {
      showErrorState(err.message || 'An error occurred while processing the meeting.');
    }
  }

  function showErrorState(msg) {
    if (errorMessageText) errorMessageText.textContent = msg;
    switchViewState('error');
    showToast(msg, 'error');
  }

  /**
   * Preview State Switcher (Exposed globally for demo inspector buttons)
   */
  window.switchViewState = function(state) {
    if (viewUpload) viewUpload.classList.add('hidden');
    if (viewProcessing) viewProcessing.classList.add('hidden');
    if (viewError) viewError.classList.add('hidden');

    const btnUpload = document.getElementById('btn-state-upload');
    const btnProcessing = document.getElementById('btn-state-processing');
    const btnError = document.getElementById('btn-state-error');

    [btnUpload, btnProcessing, btnError].forEach(btn => {
      if (btn) {
        btn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
        btn.classList.add('text-on-surface-variant');
      }
    });

    if (state === 'upload') {
      if (viewUpload) viewUpload.classList.remove('hidden');
      if (btnUpload) {
        btnUpload.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
        btnUpload.classList.remove('text-on-surface-variant');
      }
    } else if (state === 'processing') {
      if (viewProcessing) viewProcessing.classList.remove('hidden');
      if (btnProcessing) {
        btnProcessing.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
        btnProcessing.classList.remove('text-on-surface-variant');
      }
    } else if (state === 'error') {
      if (viewError) viewError.classList.remove('hidden');
      if (btnError) {
        btnError.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
        btnError.classList.remove('text-on-surface-variant');
      }
    }
  };
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.initUploadPage === 'function') window.initUploadPage();
});
