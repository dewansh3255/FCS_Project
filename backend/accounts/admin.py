from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserKeys, Profile


# ── User ──────────────────────────────────────────────────────────────────────
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ['username', 'email', 'role', 'is_verified', 'phone_number', 'is_active', 'date_joined']
    list_filter   = ['role', 'is_verified', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'phone_number']
    ordering      = ['-date_joined']

    # Add our custom fields to the existing UserAdmin fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('role', 'phone_number', 'is_verified', 'totp_secret')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {
            'fields': ('role', 'phone_number', 'is_verified')
        }),
    )


# ── UserKeys ──────────────────────────────────────────────────────────────────
@admin.register(UserKeys)
class UserKeysAdmin(admin.ModelAdmin):
    list_display  = ['user', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'public_key', 'encrypted_private_key']  # prevent accidental edits

    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Keys (Read-Only)', {'fields': ('public_key', 'encrypted_private_key')}),
        ('Meta', {'fields': ('created_at',)}),
    )


# ── Profile ───────────────────────────────────────────────────────────────────
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'headline', 'location', 'is_headline_public', 'is_bio_public', 'is_location_public', 'is_skills_public']
    list_filter   = ['is_headline_public', 'is_bio_public', 'is_location_public', 'is_skills_public']
    search_fields = ['user__username', 'user__email', 'headline', 'location', 'skills']

    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Profile Info', {'fields': ('headline', 'bio', 'location', 'skills')}),
        ('Privacy Settings', {'fields': ('is_headline_public', 'is_bio_public', 'is_location_public', 'is_skills_public')}),
    )