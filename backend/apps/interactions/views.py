from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.posts.models import Post
from .models import Like

class LikeToggleView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)

        if created:
            return Response({"liked": True}, status=status.HTTP_201_CREATED)
        return Response({"liked": True}, status=status.HTTP_200_OK)

    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        deleted, _ = Like.objects.filter(user=request.user, post=post).delete()
        return Response({"liked": False}, status=status.HTTP_200_OK)
