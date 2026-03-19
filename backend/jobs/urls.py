from django.urls import path
from .views import (
    DownloadResumeView, ResumeUploadView, ResumeListView, DeleteResumeView,
    CompanyListCreateView, CompanyDetailView,
    JobListCreateView, JobDetailView,
    ApplicationListCreateView, ApplicationDetailView,
)

urlpatterns = [
    # Resume
    path('resume/upload/', ResumeUploadView.as_view(), name='upload_resume'),
    path('resume/', ResumeListView.as_view(), name='list_resumes'),
    path('resume/<int:pk>/download/', DownloadResumeView.as_view(), name='download_resume'),
    path('resume/<int:pk>/', DeleteResumeView.as_view(), name='delete_resume'),

    # Companies
    path('companies/', CompanyListCreateView.as_view(), name='company_list'),
    path('companies/<int:pk>/', CompanyDetailView.as_view(), name='company_detail'),

    # Jobs
    path('jobs/', JobListCreateView.as_view(), name='job_list'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job_detail'),

    # Applications
    path('applications/', ApplicationListCreateView.as_view(), name='application_list'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application_detail'),
]