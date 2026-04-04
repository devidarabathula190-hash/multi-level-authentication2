from rest_framework import status, permissions, generics
from rest_framework.response import Response
from .models import FaceData
from .utils import compare_faces, base64_to_file

class FaceVerificationView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Expect either face_image as file or face_image_base64
        image_file = request.FILES.get('face_image')
        base64_image = request.data.get('face_image_base64')
        
        if not image_file and base64_image:
            image_file = base64_to_file(base64_image)
            
        if not image_file:
            return Response({'error': 'Face image not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            face_data = FaceData.objects.get(user=request.user)
            match, result = compare_faces(face_data.face_encoding, image_file)
            
            if match:
                return Response({
                    'success': True,
                    'message': 'Face verified successfully',
                    'similarity': float(result) # result is distance, so lower is better
                })
            else:
                return Response({
                    'success': False,
                    'message': result or 'Face mismatch'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except FaceData.DoesNotExist:
            return Response({'error': 'Face data not found for this user. Please register your face.'}, 
                             status=status.HTTP_404_NOT_FOUND)
