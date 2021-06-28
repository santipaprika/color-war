from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.db import IntegrityError
from django.db.models import Count
import json
import random

from .models import User, Team, Warrior, Contribution, Battle

def index(request):
    return render(request, "capstone/index.html")

# -------------------------------------------------------------------------------------

def login_view(request):
    if request.method == "POST":

        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("index")
        else:
            return render(request, "capstone/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "capstone/login.html")
    
# -------------------------------------------------------------------------------------

def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "capstone/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "capstone/register.html", {
                "message": "Username already exists."
            })
        login(request, user)
        return redirect("index")
    else:
        return render(request, "capstone/register.html")

# -------------------------------------------------------------------------------------

def logout_view(request):
    logout(request)
    return redirect("index")

# -------------------------------------------------------------------------------------

@login_required
def setToTeam(request, team_name):

    if (request.method == 'PUT'):
        try:
            team = Team.objects.get(name=team_name)
        except Team.DoesNotExist:
            return JsonResponse({"error": "Team not found."}, status=404)

        user = User.objects.get(id=request.user.id)
        user.team = team
        user.save()
        return HttpResponse(status=204)

    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)

# -------------------------------------------------------------------------------------

def warriors(request, team_name):
    try:
        team_req = Team.objects.get(name=team_name)
    except Team.DoesNotExist:
            return JsonResponse({"error": "Team not found."}, status=404)

    warriors = Warrior.objects.filter(team=team_req)
    warriors = warriors.order_by("-strength").all()
    return JsonResponse([warrior.serialize() for warrior in warriors], safe=False)

# -------------------------------------------------------------------------------------

def create_warrior_page(request):
    return render(request, "capstone/createWarrior.html")

# -------------------------------------------------------------------------------------

@login_required
def create_warrior(request):
    if request.method != 'PUT':
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)
    if data.get("name") is not None:
        warrior = Warrior(name=data['name'], team=request.user.team, creator=request.user)
        warrior.save()
    else:
        return JsonResponse({"error": "Name not valid"}, status=400)

    return render(request, "capstone/createWarrior.html")

# -------------------------------------------------------------------------------------

def user_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    return render(request, "capstone/userWarriors.html", {'dest_user': user, 'view': 'warrior'})

# -------------------------------------------------------------------------------------

def get_user_warriors(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    warriors = user.warriors.all()
    warriors = warriors.order_by("-strength").all()
    return JsonResponse([warrior.serialize() for warrior in warriors], safe=False)

# -------------------------------------------------------------------------------------

def warrior(request, warrior_id):
    try:
        Warrior.objects.get(id=warrior_id)
    except Warrior.DoesNotExist:
        return JsonResponse({"error": "Warrior not found."}, status=404)
    return render(request, "capstone/warrior.html", {'warrior_id': warrior_id, 'view': 'warrior'})

# -------------------------------------------------------------------------------------

def get_warrior(request, warrior_id):
    try:
        warrior = Warrior.objects.get(id=warrior_id)
    except Warrior.DoesNotExist:
        return JsonResponse({"error": "Warrior not found."}, status=404)

    return JsonResponse(warrior.serialize(), safe=False)

# -------------------------------------------------------------------------------------

def contributions(request, type, id):
    if type == 'warrior':
        try:
            Warrior.objects.get(id=id)
        except Warrior.DoesNotExist:
            return JsonResponse({"error": "Warrior not found."}, status=404)
        return render(request, "capstone/warrior.html", {'warrior_id': id, 'view': 'contributions'})

    elif type == 'user':
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
        return render(request, "capstone/userWarriors.html", {'dest_user': user, 'view': 'contributions'})

    else:
        return JsonResponse({"error": "Contribution type not valid."}, status=404)

def get_contributions(request, type, id):
    if type == 'warrior':
        try:
            warrior = Warrior.objects.get(id=id)
        except Warrior.DoesNotExist:
            return JsonResponse({"error": "Warrior not found."}, status=404)

        contributions = warrior.contributions.all()

    elif type == 'user': 
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

        contributions = user.contributions.all()

    else:
        return JsonResponse({"error": "Contribution type not valid."}, status=404)

    return JsonResponse([contribution.serialize() for contribution in contributions], safe=False)

# -------------------------------------------------------------------------------------

@login_required
def add_contribution(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    if data.get("warrior_id") is not None and data.get("action") is not None:
        try:
            warrior = Warrior.objects.get(id=data['warrior_id'])
        except Warrior.DoesNotExist:
            return JsonResponse({"error": "Warrior not found."}, status=404)

        contribution = Contribution(action=data['action'], warrior=warrior, contributor=User.objects.get(id=request.user.id))
        print(data['action'])
        if (data['action'] == 'STR'):
            warrior.strength = warrior.strength + 1
        elif (data['action'] == 'HEAL'):
            warrior.hp = warrior.hp + 1
        else:
            return JsonResponse({"error": "Action type not valid."}, status=404)
        
        warrior.save()
        contribution.save()

    else:
        return JsonResponse({"error": "Request data not valid"}, status=404)

    return JsonResponse({"message": "Contribution added successfully."}, status=201)

# -------------------------------------------------------------------------------------

def team_users(request, team_name):
    try:
        team = Team.objects.get(name=team_name)
    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found."}, status=404)
    return render(request, "capstone/teamUsers.html", {'team_name': team.name})

# -------------------------------------------------------------------------------------

def get_team_users(request, team_name):
    try:
        team = Team.objects.get(name=team_name)
    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found."}, status=404)
    
    users = team.members
    users = users.annotate(count=Count('contributions')).order_by('-count')
    print(users);
    return JsonResponse([user.serialize() for user in users], safe=False)

# -------------------------------------------------------------------------------------

def get_battles(request):
    if (request.method == 'POST'):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "User must be logged to perform this action."}, status=404)

        # SIMULATE BATTLE
        teams = ['Red', 'Blue']
        strength = {'Red': 0, 'Blue': 0}

        for team_name in teams:
            team_warriors = Warrior.objects.filter(team=Team.objects.get(name=team_name))

            for warrior in team_warriors:
                warrior.hp -= 20
                warrior.age += 10
                strength[team_name] += warrior.strength
                if warrior.hp <= 0 or warrior.age >= 100:
                    warrior.delete()
                else:
                    warrior.save()

        if strength['Red'] is 0 and strength['Blue'] is 0:
            return JsonResponse({"error": "Battle not done because of absence of warriors."}, status=404)

        if (random.randint(0, strength['Red']) > random.randint(0, strength['Blue'])):
            winner = 'Red'
        else:
            winner = 'Blue'

        battle = Battle(winner=Team.objects.get(name=winner))
        battle.save()
        return JsonResponse({"message": "Battle created successfully."}, status=201)

    elif (request.method == 'GET'):
        battles = Battle.objects.all().order_by("-timestamp").all()
        return JsonResponse([battle.serialize() for battle in battles], safe=False)

    else:
        return JsonResponse({"error": "Request method must be GET or POST."}, status=404)
