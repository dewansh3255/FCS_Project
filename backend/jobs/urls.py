from django.urls import path

from .views import DownloadResumeView, ResumeUploadView, ResumeListView

urlpatterns = [
    path('resume/upload/', ResumeUploadView.as_view(), name='upload_resume'),
    path('resume/', ResumeListView.as_view(), name='list_resumes'),
    path('resume/<int:pk>/download/', DownloadResumeView.as_view(), name='download_resume'),
]
