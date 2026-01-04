from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter

from .serializers import PublicUserSerializer

User = get_user_model()


class UsersListView(generics.ListAPIView):
    """
    Lista usuários para a tela de 'seguir'.
    Permite buscar por username.
    Exclui o usuário logado.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PublicUserSerializer
    filter_backends = [SearchFilter]
    search_fields = ["username"]

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id).order_by("username")
