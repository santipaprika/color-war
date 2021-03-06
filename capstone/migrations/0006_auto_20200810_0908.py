# Generated by Django 3.0.3 on 2020-08-10 07:08

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('capstone', '0005_warrior_creator'),
    ]

    operations = [
        migrations.AlterField(
            model_name='warrior',
            name='hp',
            field=models.PositiveIntegerField(default=100, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)]),
        ),
        migrations.CreateModel(
            name='Contribution',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year_in_school', models.CharField(choices=[('HEAL', 'Heal'), ('STR', 'Strengthen')], max_length=4)),
                ('contributor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='contributions', to=settings.AUTH_USER_MODEL)),
                ('warrior', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='contributions', to='capstone.Warrior')),
            ],
        ),
    ]
