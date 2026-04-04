# Set to True if Face Recognition is slow/crashing your computer
MOCK_MODE = True

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
import numpy as np
from PIL import Image
import io
import base64

def get_face_encoding(image_file):
    """
    Extract 128-D face encoding from an image file.
    """
    if not FACE_RECOGNITION_AVAILABLE or MOCK_MODE:
        # Mock encoding for demo if library is missing or in mock mode
        print("INFO: Using MOCK face encoding")
        return np.random.rand(128)
    
    try:
        # Load the image using PIL first to resize it (speeds up recognition)
        img_pil = Image.open(image_file)
        
        # Limit size to 800px for speed
        MAX_SIZE = 800
        if max(img_pil.size) > MAX_SIZE:
            img_pil.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
            
        # Convert back to numpy for face_recognition
        img = np.array(img_pil.convert('RGB'))
        
        # Detect faces and get encodings
        encodings = face_recognition.face_encodings(img)
        
        if len(encodings) > 0:
            return encodings[0]
        return None
    except Exception as e:
        print(f"Error extracting face encoding: {e}")
        return None

def compare_faces(stored_encoding_bytes, face_image_file):
    """
    Compare a stored encoding (bytes) with a new image.
    """
    if not FACE_RECOGNITION_AVAILABLE or MOCK_MODE:
        # Mock comparison for demo: always successful with a fake similarity score
        print("INFO: Performing MOCK face comparison (SUCCESS)")
        return True, 0.1
    
    try:
        # Load stored encoding
        stored_encoding = np.frombuffer(stored_encoding_bytes, dtype=np.float64)
        
        # Get encoding of the new face
        new_encoding = get_face_encoding(face_image_file)
        
        if new_encoding is None:
            return False, "No face detected in the image"
        
        # Compare encodings
        results = face_recognition.compare_faces([stored_encoding], new_encoding, tolerance=0.6)
        
        if results[0]:
            # Calculate similarity distance
            distance = face_recognition.face_distance([stored_encoding], new_encoding)[0]
            return True, distance
        return False, "Face mismatch"
    except Exception as e:
        print(f"Error comparing faces: {e}")
        return False, str(e)

def base64_to_file(base64_string, name="face.jpg"):
    """
    Convert base64 string to a Django ContentFile object.
    """
    try:
        from django.core.files.base import ContentFile
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        img_data = base64.b64decode(base64_string)
        return ContentFile(img_data, name=name)
    except Exception:
        return None
