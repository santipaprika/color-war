from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator 

class User(AbstractUser):
    team = models.ForeignKey("Team", on_delete=models.PROTECT, related_name="members", blank=True, null=True)
    
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "team": self.team.name,
            "warriors": self.warriors.all().count(),
            "contributions": self.contributions.all().count()
        }

    def __str__(self):
        return f"{self.id}: {self.username} | Team: {'---' if self.team == None else self.team.name} | Warriors: {self.warriors.all().count()}"

class Team(models.Model):
    name = models.CharField(max_length=32, null=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "members": self.members.all().count(),
            "warriors": self.warriors.all().count(),
        }

    def __str__(self):
        return f"{self.id}: {self.name} | Warriors: {self.warriors.all().count()} | Members: {self.members.all().count()}"

class Warrior(models.Model):
    name = models.CharField(max_length=32, default='warrior');
    strength = models.PositiveIntegerField(default=1, validators=[MinValueValidator(0), MaxValueValidator(100)])
    hp = models.PositiveIntegerField(default=100, validators=[MinValueValidator(0), MaxValueValidator(100)])
    age = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    team = models.ForeignKey("Team", on_delete=models.CASCADE, related_name="warriors")
    creator = models.ForeignKey("User", on_delete=models.SET_NULL, related_name="warriors", null=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "strength": self.strength,
            "hp": self.hp,
            "age": self.age,
            "team": self.team.serialize(),
            "creator": 'null' if self.creator == None else self.creator.serialize(),
            "contributions": self.contributions.all().count()
        }

    def __str__(self):
        return f"{self.id}: {self.team.name}: {self.name} by {'null' if self.creator == None else self.creator.username} | STR: {self.strength} | HP: {self.hp} | AGE: {self.age}"

class Contribution(models.Model):
    CHOICES = [
        ('HEAL', 'Heal'),
        ('STR', 'Strengthen')
        ]

    action = models.CharField(max_length=4, choices=CHOICES)
    contributor = models.ForeignKey("User", on_delete=models.SET_NULL, related_name="contributions", null=True)
    warrior = models.ForeignKey("Warrior", on_delete=models.SET_NULL, related_name="contributions", null=True)

    def serialize(self):
        return {
            "id": self.id,
            "action": self.action,
            "warrior": 'null' if self.warrior == None else self.warrior.serialize(),
            "contributor": 'null' if self.contributor == None else self.contributor.serialize(),
            "contributor_id": 'null' if self.contributor == None else self.contributor.id,
            "warrior_id": 'null' if self.warrior == None else self.warrior.id
        }

    def __str__(self):
        return f"{self.id}: {self.action} {'null' if self.warrior is None else self.warrior.name} by {'null' if self.contributor == None else self.contributor.username}"

class Battle(models.Model):
    winner = models.ForeignKey("Team", on_delete=models.CASCADE, related_name="wins")
    timestamp = models.DateTimeField(auto_now_add=True)


    def serialize(self):
        return {
            "id": self.id,
            "winner": self.winner.serialize(),
            "timestamp": self.timestamp
        }

    def __str__(self):
        return f"BATTLE {self.id} - WINNER: {self.winner.name} - On {self.timestamp}"