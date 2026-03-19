from rest_framework import serializers
from .models import Resume, Company, Job, Application


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'user', 'file', 'is_encrypted', 'uploaded_at', 'digital_signature']
        read_only_fields = ['user', 'is_encrypted']


class CompanySerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Company
        fields = ['id', 'owner', 'owner_username', 'name', 'description', 'location', 'website', 'created_at']
        read_only_fields = ['owner']


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')

    class Meta:
        model = Job
        fields = [
            'id', 'company', 'company_name', 'title', 'description',
            'required_skills', 'location', 'job_type',
            'salary_min', 'salary_max', 'deadline', 'created_at', 'is_active'
        ]
        read_only_fields = ['created_at']


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_username = serializers.ReadOnlyField(source='applicant.username')
    job_title = serializers.ReadOnlyField(source='job.title')

    class Meta:
        model = Application
        fields = [
            'id', 'applicant', 'applicant_username', 'job', 'job_title',
            'resume', 'cover_note', 'status', 'recruiter_notes', 'applied_at', 'updated_at'
        ]
        read_only_fields = ['applicant', 'applied_at', 'updated_at']