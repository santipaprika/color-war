from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("logout", views.logout_view, name="logout"),

    path("create_warrior_page", views.create_warrior_page, name="create_warrior_page"),
    path("user_profile/<int:user_id>", views.user_profile, name="user_profile"),
    path("warrior/<int:warrior_id>", views.warrior, name="warrior"),
    path("<str:type>/<int:id>/contributions", views.contributions, name="contributions"),
    path("team_users/<str:team_name>", views.team_users, name="team_users"),

    #API URLS
    path("set_to_team/<str:team_name>", views.setToTeam, name="set_to_team"),
    path("warriors/<str:team_name>", views.warriors, name="warriors"),
    path("create_warrior", views.create_warrior, name="create_warrior"),
    path("user_warriors/<int:user_id>", views.get_user_warriors, name="user_warriors"),
    path("get_warrior/<int:warrior_id>", views.get_warrior, name="get_warrior"),
    path("get_contributions/<str:type>/<int:id>", views.get_contributions, name="get_contributions"),
    path("add_contribution", views.add_contribution, name="add_contribution"),
    path("get_team_users/<str:team_name>", views.get_team_users, name="get_team_users"),
    path("get_battles", views.get_battles, name="get_battles")

]