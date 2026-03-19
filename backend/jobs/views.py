import os

from cryptography.fernet import Fernet
from django.http import FileResponse, Http404, HttpResponseForbidden
from django.conf import settings
from django.core.files.base import ContentFile

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Resume, ResumeKey, Company, Job, Application
from .serializers import ResumeSerializer, CompanySerializer, JobSerializer, ApplicationSerializer
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, generics, filters
from django.db import transaction
from django.db.models import Q
from accounts.audit import create_audit_log


# class ResumeUploadView(APIView):
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def post(self, request, format=None):
#         file = request.FILES.get('file') 
#         if not file:
#             return Response({"detail": "No file provided"}, status=400)
            
#         # Let the model's custom save() method handle all the encryption 
#         # and ResumeKey creation automatically!
#         resume = Resume.objects.create(user=request.user, file=file)

#         serializer = ResumeSerializer(resume)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        file = request.data.get('file')
        
        # --- ADD THIS TO CAPTURE THE SIGNATURE ---
        digital_signature = request.data.get('digital_signature')
        
        if not file:
            return Response({"detail": "No file provided"}, status=400)
            
        # --- UPDATE THIS TO SAVE THE SIGNATURE ---
        resume = Resume.objects.create(
            user=request.user, 
            file=file,
            digital_signature=digital_signature
        )
        
        create_audit_log('RESUME_UPLOAD', request.user, {'resume_id': resume.id})

        serializer = ResumeSerializer(resume)
        return Response(serializer.data)

class ResumeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # return only resumes owned by the user
        qs = Resume.objects.filter(user=request.user)
        serializer = ResumeSerializer(qs, many=True)
        return Response(serializer.data)


class DownloadResumeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        try:
            resume = Resume.objects.get(pk=pk)
        except Resume.DoesNotExist:
            raise Http404("Resume not found")

        # security check: owner or explicitly authorized recruiter
        if request.user != resume.user and request.user not in resume.authorized_recruiters.all():
            return HttpResponseForbidden("You do not have permission to access this file.")

        # read encrypted file
        resume.file.open('rb')
        encrypted = resume.file.read()

        try:
            key_obj = resume.resume_key
            f = Fernet(key_obj.key.encode())
            decrypted = f.decrypt(encrypted)
        except Exception:
            return HttpResponseForbidden("Unable to decrypt file")

        basename = os.path.basename(resume.file.name)
        # strip .enc suffix if present
        if basename.endswith('.enc'):
            basename = basename[:-4]

        response = FileResponse(
            ContentFile(decrypted), 
            filename=basename, 
            content_type='application/pdf' # Tells the browser to display it
        )
        return response


class DeleteResumeView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, format=None):
        try:
            resume = Resume.objects.get(pk=pk)
        except Resume.DoesNotExist:
            raise Http404("Resume not found")

        # security check: only owner or explicitly authorized recruiter can delete
        if request.user != resume.user and request.user not in resume.authorized_recruiters.all():
            return HttpResponseForbidden("You do not have permission to delete this file.")

        # perform deletion inside a transaction
        with transaction.atomic():
            # delete stored file
            try:
                resume.file.delete(save=False)
            except Exception:
                pass

            # delete associated key if present
            try:
                if hasattr(resume, 'resume_key') and resume.resume_key:
                    resume.resume_key.delete()
            except Exception:
                pass

            # delete the resume record
            resume.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Company.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    queryset = Company.objects.all()


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Job.objects.filter(is_active=True)
        q = self.request.query_params.get('q')
        job_type = self.request.query_params.get('job_type')
        location = self.request.query_params.get('location')
        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(required_skills__icontains=q) |
                Q(company__name__icontains=q)
            )
        if job_type:
            qs = qs.filter(job_type=job_type)
        if location:
            qs = qs.filter(location__icontains=location)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    queryset = Job.objects.all()


class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'RECRUITER':
            return Application.objects.filter(job__company__owner=user)
        return Application.objects.filter(applicant=user)

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)


class ApplicationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'RECRUITER':
            return Application.objects.filter(job__company__owner=user)
        return Application.objects.filter(applicant=user)