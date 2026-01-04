from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView
from .users_views import UsersListView
from .public_profile_views import PublicProfileView

urlpatterns = [
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/token", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("me", MeView.as_view(), name="me"),
    path("users", UsersListView.as_view(), name="users_list"),
    path("users/<int:user_id>", PublicProfileView.as_view(), name="public_profile"),
]
