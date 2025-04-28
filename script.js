document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const tabs = document.querySelectorAll('.cyber-tab');
    const tabButtons = document.querySelectorAll('.cyber-button[data-tab]');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab') + '-tab';
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show selected tab
            tabs.forEach(tab => {
                tab.style.display = 'none';
                if (tab.id === tabId) {
                    tab.style.display = 'block';
                }
            });
            
            // Log to terminal
            addTerminalLine(`> NAVIGATED TO ${button.textContent.toUpperCase()} SECTION`);
        });
    });
    
    // Input Selector
    const inputOptions = document.querySelectorAll('.cyber-option');
    const uploadSection = document.getElementById('upload-section');
    const cameraSection = document.getElementById('camera-section');
    
    inputOptions.forEach(option => {
        option.addEventListener('click', () => {
            const inputType = option.getAttribute('data-input');
            
            // Update active option
            inputOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Show selected section
            uploadSection.style.display = inputType === 'upload' ? 'block' : 'none';
            cameraSection.style.display = inputType === 'camera' ? 'block' : 'none';
            
            // Log to terminal
            addTerminalLine(`> SELECTED ${inputType.toUpperCase()} INPUT METHOD`);
        });
    });
    
    // File Upload Handling
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const analyzeButton = document.getElementById('analyzeButton');
    let uploadedFiles = [];
    
    // Click to open file dialog
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', handleFiles);
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('active');
    }
    
    function unhighlight() {
        dropZone.classList.remove('active');
    }
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    function handleFiles(e) {
        const files = e.target.files;
        uploadedFiles = Array.from(files);
        updateFilePreview();
        
        if (uploadedFiles.length > 0) {
            analyzeButton.disabled = false;
            addTerminalLine(`> ${uploadedFiles.length} FILE(S) UPLOADED FOR ANALYSIS`);
        }
    }
    
    function updateFilePreview() {
        filePreview.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = 'X';
            removeBtn.addEventListener('click', () => removeFile(index));
            
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.controls = true;
                previewItem.appendChild(video);
                previewItem.appendChild(removeBtn);
            }
            
            filePreview.appendChild(previewItem);
        });
    }
    
    function removeFile(index) {
        uploadedFiles.splice(index, 1);
        updateFilePreview();
        
        if (uploadedFiles.length === 0) {
            analyzeButton.disabled = true;
        }
        
        addTerminalLine(`> FILE REMOVED FROM QUEUE`);
    }
    
    // Camera Handling
    const startCameraBtn = document.getElementById('startCamera');
    const captureFrameBtn = document.getElementById('captureFrame');
    const analyzeLiveBtn = document.getElementById('analyzeLive');
    const cameraFeed = document.getElementById('cameraFeed');
    const cameraCanvas = document.getElementById('cameraCanvas');
    let stream = null;
    let isAnalyzingLive = false;
    let liveAnalysisInterval = null;
    
    startCameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraFeed.srcObject = stream;
            startCameraBtn.disabled = true;
            captureFrameBtn.disabled = false;
            analyzeLiveBtn.disabled = false;
            
            addTerminalLine(`> CAMERA FEED ACTIVATED`);
        } catch (err) {
            addTerminalLine(`> CAMERA ERROR: ${err.message}`);
            console.error('Camera error:', err);
        }
    });
    
    captureFrameBtn.addEventListener('click', () => {
        if (!stream) return;
        
        const context = cameraCanvas.getContext('2d');
        cameraCanvas.width = cameraFeed.videoWidth;
        cameraCanvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        // For demo purposes, we'll just simulate analysis
        simulateAnalysis();
        
        addTerminalLine(`> FRAME CAPTURED FOR ANALYSIS`);
    });
    
    analyzeLiveBtn.addEventListener('click', () => {
        if (!stream) return;
        
        isAnalyzingLive = !isAnalyzingLive;
        
        if (isAnalyzingLive) {
            analyzeLiveBtn.textContent = 'STOP ANALYSIS';
            liveAnalysisInterval = setInterval(() => {
                const context = cameraCanvas.getContext('2d');
                cameraCanvas.width = cameraFeed.videoWidth;
                cameraCanvas.height = cameraFeed.videoHeight;
                context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);
                
                // For demo purposes, we'll just simulate analysis
                simulateAnalysis();
                
                addTerminalLine(`> LIVE ANALYSIS FRAME PROCESSED`);
            }, 2000);
            
            addTerminalLine(`> LIVE ANALYSIS INITIATED`);
        } else {
            analyzeLiveBtn.textContent = 'ANALYZE LIVE';
            clearInterval(liveAnalysisInterval);
            addTerminalLine(`> LIVE ANALYSIS TERMINATED`);
        }
    });
    
    // Stop camera when leaving camera tab
    document.querySelector('.cyber-button[data-tab="about"]').addEventListener('click', () => {
        if (stream) {
            stopCamera();
        }
    });
    
    document.querySelector('.cyber-button[data-tab="contact"]').addEventListener('click', () => {
        if (stream) {
            stopCamera();
        }
    });
    
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            cameraFeed.srcObject = null;
            stream = null;
            startCameraBtn.disabled = false;
            captureFrameBtn.disabled = true;
            analyzeLiveBtn.disabled = true;
            isAnalyzingLive = false;
            if (liveAnalysisInterval) clearInterval(liveAnalysisInterval);
            analyzeLiveBtn.textContent = 'ANALYZE LIVE';
            
            addTerminalLine(`> CAMERA FEED DEACTIVATED`);
        }
    }
    
    async function analyzeFiles() {
        // Show loading state
        analyzeButton.disabled = true;
        analyzeButton.innerHTML = '<span class="cyber-symbol">&#x231B;</span> ANALYZING...';
        
        try {
            const formData = new FormData();
            
            // Add all uploaded files to FormData
            for (const file of uploadedFiles) {
                formData.append('file', file);
            }
            
            // Make API request to Flask backend
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Analysis failed');
            }
            
            // Show results section
            document.getElementById('results-section').style.display = 'block';
            
            // Update UI with results
            document.getElementById('confidenceValue').textContent = `${result.confidence.toFixed(1)}%`;
            document.getElementById('timeValue').textContent = `${result.processing_time}ms`;
            
            // Update meter
            const meterFill = document.getElementById('meterFill');
            meterFill.style.clipPath = `circle(${result.confidence}% at 50% 50%)`;
            
            // Update progress bars
            document.getElementById('micromoveProgress').value = result.breakdown.facial_micromovements;
            document.getElementById('textureProgress').value = result.breakdown.texture_consistency;
            document.getElementById('blinkProgress').value = result.breakdown.blink_patterns;
            
            // Log to terminal
            addTerminalLine(`> ANALYSIS COMPLETE: ${result.confidence.toFixed(1)}% CONFIDENCE`);
            addTerminalLine(`> VERDICT: ${result.is_real ? 'AUTHENTIC' : 'DEEPFAKE DETECTED'}`);
            
        } catch (error) {
            addTerminalLine(`> ANALYSIS ERROR: ${error.message}`);
            alert(`Analysis failed: ${error.message}`);
        } finally {
            // Reset button state
            analyzeButton.disabled = false;
            analyzeButton.innerHTML = '<span class="cyber-symbol">&#x2699;</span> ANALYZE MEDIA';
        }
    }
    
    // Update the analyze button event listener
    analyzeButton.addEventListener('click', analyzeFiles);
    
    // Terminal Functionality
    const terminalToggle = document.getElementById('terminalToggle');
    const terminal = document.getElementById('terminal');
    
    terminalToggle.addEventListener('click', () => {
        terminal.classList.toggle('collapsed');
        terminalToggle.textContent = terminal.classList.contains('collapsed') ? '+' : '_';
    });
    
    function addTerminalLine(text) {
        const terminalContent = document.getElementById('terminalContent');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = text;
        terminalContent.appendChild(line);
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }
    
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, options);
    
    // Initial terminal messages
    addTerminalLine('> SYSTEM BOOT SEQUENCE INITIATED');
    addTerminalLine('> LSTM-CNN MODEL LOADED');
    addTerminalLine('> DEFENDFACE READY');
});