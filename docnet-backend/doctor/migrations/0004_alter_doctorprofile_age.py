# Generated by Django 5.0.3 on 2025-05-10 03:37

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('doctor', '0003_remove_doctorschedule_doctor_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctorprofile',
            name='age',
            field=models.PositiveIntegerField(null=True, validators=[django.core.validators.MinValueValidator(21), django.core.validators.MaxValueValidator(80)]),
        ),
    ]
