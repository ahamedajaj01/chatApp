from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('users/me/', views.CurrentUserView.as_view(), name='current-user'),
    path("users/<int:pk>/", views.UserDetailView.as_view(), name="user-detail"), # new user detail endpoint
    path('update/password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('conversations/', views.ConversationListCreateView.as_view(), name='conversations'),
    path('conversations/<int:pk>/messages/', views.ConversationMessageView.as_view(), name='conversation-messages'),
    path('conversations/<int:pk>/mark_read/', views.MarkReadView.as_view(), name='conversation-mark-read'),
    path("users/search/",views.UserSearchView.as_view(),name="user-search"),
    path("message/<int:pk>/delete-for-me/",views.MessageDeleteForMeView.as_view(),name="message-delete-for-me"),
    path("conversation/<int:pk>/hide-for-me/",views.ConversationHideView.as_view(),name="conversation-hide-for-me"),
]
