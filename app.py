from flask import Flask, request, jsonify, render_template, send_from_directory
import os
from werkzeug.utils import secure_filename
from deepfake_model import analyze_media
import time
from datetime import datetime

app = Flask(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB limit
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'mp4', 'mov', 'avi'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if file is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Save the file
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Start timer
    start_time = time.time()
    
    try:
        # Analyze the media file
        result = analyze_media(filepath)
        
        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)  # in ms
        
        # Prepare response
        response = {
            'success': True,
            'filename': filename,
            'confidence': result['confidence'],
            'is_real': result['is_real'],
            'processing_time': processing_time,
            'breakdown': {
                'facial_micromovements': result['breakdown']['facial_micromovements'],
                'texture_consistency': result['breakdown']['texture_consistency'],
                'blink_patterns': result['breakdown']['blink_patterns']
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Clean up - remove the uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route('/api/live_analysis', methods=['POST'])
def live_analysis():
    # This would handle frames from live camera
    # For now, we'll just simulate it
    if 'frame' not in request.files:
        return jsonify({'error': 'No frame data'}), 400
    
    frame = request.files['frame']
    
    # Simulate analysis
    confidence = 85 + (10 * (time.time() % 1) - 5)  # Random value between 80-90
    is_real = confidence > 85
    
    return jsonify({
        'success': True,
        'confidence': confidence,
        'is_real': is_real,
        'processing_time': 150,
        'breakdown':
        {
            'facial_micromovements': 80 + (10 * (time.time() % 1) - 5),
            'texture_consistency': 75 + (10 * (time.time() % 1) - 5),
            'blink_patterns': 90 + (5 * (time.time() % 1) - 2.5)
        }
    }
)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    