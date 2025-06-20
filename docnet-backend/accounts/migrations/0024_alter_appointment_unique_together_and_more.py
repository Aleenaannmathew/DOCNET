# Generated by Django 5.2.1 on 2025-06-12 16:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0023_payment_razorpay_payment_id_and_more'),
        ('doctor', '0027_wallet_wallethistory'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='appointment',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='payment',
            name='appointment',
        ),
        migrations.AddField(
            model_name='appointment',
            name='payment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='accounts.payment'),
        ),
        migrations.AddField(
            model_name='payment',
            name='slot',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='doctor.doctorslot'),
        ),
        migrations.RemoveField(
            model_name='appointment',
            name='doctor',
        ),
        migrations.RemoveField(
            model_name='appointment',
            name='notes',
        ),
        migrations.RemoveField(
            model_name='appointment',
            name='patient',
        ),
        migrations.RemoveField(
            model_name='appointment',
            name='slot',
        ),
    ]
