from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Profile
from apps.social.models import Follow

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
        )
        user.set_password(validated_data["password"])
        user.save()
        return user

class MeSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source="profile.display_name", required=False, allow_blank=True)
    avatar = serializers.ImageField(source="profile.avatar", required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "display_name", "avatar", "avatar_url", "followers_count", "following_count")

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        avatar = getattr(obj.profile, "avatar", None)
        if not avatar:
            return None
        if request:
            return request.build_absolute_uri(avatar.url)
        return avatar.url

    def get_followers_count(self, obj):
        return Follow.objects.filter(following=obj).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj).count()

class MeUpdateSerializer(serializers.Serializer):
    # tudo opcional (seu requisito)
    display_name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, write_only=True, min_length=6)
    avatar = serializers.ImageField(required=False, allow_null=True)

    def update(self, instance, validated_data):
        profile = instance.profile

        if "display_name" in validated_data:
            profile.display_name = validated_data["display_name"]

        if "avatar" in validated_data:
            profile.avatar = validated_data["avatar"]

        if "password" in validated_data:
            instance.set_password(validated_data["password"])
            instance.save()

        profile.save()
        return instance

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")

class PublicProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source="profile.display_name", read_only=True)
    avatar_url = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "display_name",
            "avatar_url",
            "followers_count",
            "following_count",
            "is_following",
        )

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        avatar = getattr(obj.profile, "avatar", None)
        if not avatar:
            return None
        if request:
            return request.build_absolute_uri(avatar.url)
        return avatar.url

    def get_followers_count(self, obj):
        return Follow.objects.filter(following=obj).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj).count()

    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=request.user, following=obj).exists()
