from rest_framework import serializers

from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'user', 'file', 'is_encrypted', 'uploaded_at']
        read_only_fields = ['id', 'user', 'is_encrypted', 'uploaded_at']
