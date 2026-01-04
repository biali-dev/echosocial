from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from django.db.models import Q, Count
from rest_framework import generics, permissions

from .models import Post
from .serializers import PostSerializer
from apps.social.models import Follow

User = get_user_model()

class PostListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        # Lista somente meus posts (útil para debug e perfil futuramente)
        return (
            Post.objects
            .filter(author=self.request.user)
            .select_related("author")
            .annotate(
                likes_count=Count("likes", distinct=True),
                comments_count=Count("comments", distinct=True),
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class FeedView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        user = self.request.user

        following_ids = Follow.objects.filter(
            follower=user
        ).values_list("following_id", flat=True)

        # Feed = posts de quem eu sigo + meus posts
        return (
            Post.objects
            .filter(Q(author_id__in=following_ids) | Q(author=user))
            .select_related("author")
            .annotate(
                likes_count=Count("likes", distinct=True),
                comments_count=Count("comments", distinct=True),
            )
            .order_by("-created_at")
        )

    def get_serializer_context(self):
        # Mantém o request no context para o PostSerializer calcular liked_by_me
        return super().get_serializer_context()

class UserPostsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        target = get_object_or_404(User, id=self.kwargs["user_id"])
        return (
            Post.objects.filter(author=target)
            .select_related("author")
            .annotate(
                likes_count=Count("likes", distinct=True),
                comments_count=Count("comments", distinct=True),
            )
            .order_by("-created_at")
        )
