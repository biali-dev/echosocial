from django.urls import path
from .views import PostListCreateView, FeedView, UserPostsView

urlpatterns = [
    path("posts", PostListCreateView.as_view(), name="posts"),
    path("feed", FeedView.as_view(), name="feed"),
    path("users/<int:user_id>/posts", UserPostsView.as_view(), name="user_posts"),
]
