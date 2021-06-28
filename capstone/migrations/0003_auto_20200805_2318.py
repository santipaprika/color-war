# Generated by Django 3.0.3 on 2020-08-05 21:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('capstone', '0002_auto_20200805_1903'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='name',
            field=models.CharField(max_length=32, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='team',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='members', to='capstone.Team'),
        ),
    ]
