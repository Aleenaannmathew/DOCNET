# Generated by Django 5.2.1 on 2025-06-04 09:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('doctor', '0013_doctorprofile_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctorprofile',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, unique=True),
        ),
    ]
