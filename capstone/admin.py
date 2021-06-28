from django.contrib import admin
from .models import User, Team, Warrior, Contribution, Battle


admin.site.register(User)
admin.site.register(Team)
admin.site.register(Warrior)
admin.site.register(Contribution)
admin.site.register(Battle)
