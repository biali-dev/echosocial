from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Follow
from .serializers import FollowSerializer, UserSimpleSerializer

User = get_user_model()

class FollowUserView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        user_to_follow = get_object_or_404(User, id=user_id)

        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=user_to_follow
        )

        if not created:
            return Response(
                {"detail": "Você já segue este usuário"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)

    def delete(self, request, user_id):
        user_to_unfollow = get_object_or_404(User, id=user_id)

        deleted, _ = Follow.objects.filter(
            follower=request.user,
            following=user_to_unfollow
        ).delete()

        if not deleted:
            return Response(
                {"detail": "Você não segue este usuário"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class FollowersListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSimpleSerializer

    def get_queryset(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        return User.objects.filter(following__following=user)


class FollowingListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSimpleSerializer

    def get_queryset(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        return User.objects.filter(followers__follower=user)

class MyFollowingIdsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ids = list(
            Follow.objects.filter(follower=request.user)
            .values_list("following_id", flat=True)
        )
        return Response({"following_ids": ids})
