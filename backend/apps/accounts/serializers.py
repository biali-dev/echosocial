from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Profile

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

    class Meta:
        model = User
        fields = ("id", "username", "email", "display_name", "avatar")

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
