from rest_framework import serializers
from .models import Post
from apps.interactions.models import Like

class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    liked_by_me = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(read_only=True)
    author_id = serializers.IntegerField(source="author.id", read_only=True)

    class Meta:
        model = Post
        fields = (
            "id",
            "author_username",
            "content",
            "created_at",
            "likes_count",
            "liked_by_me",
            "comments_count",
            "author_id",
        )
        read_only_fields = ("id", "author_username", "created_at", "likes_count", "liked_by_me")

    def get_liked_by_me(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return Like.objects.filter(user=request.user, post=obj).exists()
