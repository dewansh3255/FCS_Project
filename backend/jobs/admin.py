from django.contrib import admin

from .models import Resume, ResumeKey


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_encrypted', 'uploaded_at')
    readonly_fields = ('is_encrypted', 'uploaded_at')


@admin.register(ResumeKey)
class ResumeKeyAdmin(admin.ModelAdmin):
    list_display = ('id', 'resume', 'created_at')
    readonly_fields = ('key', 'created_at')
