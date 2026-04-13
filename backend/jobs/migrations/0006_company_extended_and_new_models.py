# Generated migration for Company extended fields and new models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('jobs', '0005_systemannouncement_company_employees_and_more'),
    ]

    operations = [
        # Extend Company model
        migrations.AddField(
            model_name='company',
            name='logo',
            field=models.ImageField(
                blank=True, null=True, upload_to='company_logos/'),
        ),
        migrations.AddField(
            model_name='company',
            name='industry',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='company',
            name='employee_count',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='company',
            name='social_links',
            field=models.JSONField(
                blank=True, default=dict, help_text='JSON object with linkedin, twitter, facebook, etc.'),
        ),
        migrations.AddField(
            model_name='company',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterModelOptions(
            name='company',
            options={'ordering': ['-created_at']},
        ),
        # Create CompanyPost model
        migrations.CreateModel(
            name='CompanyPost',
            fields=[
                ('id', models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='company_posts', to=settings.AUTH_USER_MODEL)),
                ('company', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, related_name='posts', to='jobs.company')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        # Create CompanyAccess model
        migrations.CreateModel(
            name='CompanyAccess',
            fields=[
                ('id', models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name='ID')),
                ('access_type', models.CharField(
                    choices=[
                        ('FULL', 'Full Access - Can edit company and post jobs'),
                        ('POST_ONLY', 'Post Only - Can only post jobs and updates'),
                        ('VIEW', 'View Only - Can only view company details')
                    ],
                    default='VIEW',
                    max_length=20
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='access_permissions', to='jobs.company')),
                ('recruiter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='company_access', to=settings.AUTH_USER_MODEL)),
                ('granted_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL,
                 related_name='company_access_granted', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('company', 'recruiter')},
            },
        ),
        # Create CompanySave model
        migrations.CreateModel(
            name='CompanySave',
            fields=[
                ('id', models.BigAutoField(auto_created=True,
                 primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='saved_by', to='jobs.company')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                 related_name='saved_companies', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('company', 'user')},
            },
        ),
    ]
