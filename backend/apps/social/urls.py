from django.urls import path
from .views import FollowUserView, FollowersListView, FollowingListView, MyFollowingIdsView

urlpatterns = [
    path("me/following-ids", MyFollowingIdsView.as_view()),
    path("users/<int:user_id>/follow", FollowUserView.as_view()),
    path("users/<int:user_id>/followers", FollowersListView.as_view()),
    path("users/<int:user_id>/following", FollowingListView.as_view()),
]
