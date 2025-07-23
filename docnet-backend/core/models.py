from django.db import models

# Create your models here.
#FOR TEST MODE
class SiteSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.key}: {self.value}"

    @staticmethod
    def get(key, default=None):
        try:
            return SiteSetting.objects.get(key=key).value
        except SiteSetting.DoesNotExist:
            return default

    @staticmethod
    def is_test_mode():
        return SiteSetting.get("TEST_MODE", "false").lower() == "true"
