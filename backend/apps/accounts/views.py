from rest_framework import generics, permissions
from rest_framework.response import Response

from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, MeSerializer, MeUpdateSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/register/
    Cria um usuário novo usando RegisterSerializer.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(generics.GenericAPIView):
    """
    GET /api/me/      -> retorna dados do usuário logado
    PATCH /api/me/    -> atualiza parcialmente (nome/foto/senha etc, conforme serializer)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        # ✅ forma correta: passa a instância + partial=True
        serializer = MeUpdateSerializer(
            instance=request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(MeSerializer(user, context={"request": request}).data)
