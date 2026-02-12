from django.test import TestCase

from rest_framework import serializers
from .models import UserKeys

class UserKeysSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserKeys
        fields = ['public_key', 'encrypted_private_key']

# Create your tests here.
