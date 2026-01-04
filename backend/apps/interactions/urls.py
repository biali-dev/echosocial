from django.urls import path
from .views import LikeToggleView
from .comments_views import CommentListCreateView

urlpatterns = [
    path("posts/<int:post_id>/like", LikeToggleView.as_view(), name="post_like"),
    path("posts/<int:post_id>/comments", CommentListCreateView.as_view()),
]
