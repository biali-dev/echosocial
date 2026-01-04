from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response

from .serializers import PublicProfileSerializer

User = get_user_model()

class PublicProfileView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        target = get_object_or_404(User, id=user_id)
        data = PublicProfileSerializer(target, context={"request": request}).data
        return Response(data)
