from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds last_used_totp field to User model for TOTP replay-attack protection.
    The field stores the last successfully used TOTP code (6 digits).
    If a code matches this value it is rejected as a replay attempt.
    """

    dependencies = [
        ('accounts', '0010_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_used_totp',
            field=models.CharField(
                blank=True,
                null=True,
                max_length=6,
                help_text='Last successfully used TOTP code. Used to prevent replay attacks within the 30s window.',
            ),
        ),
    ]
