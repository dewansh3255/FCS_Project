from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from rest_framework.test import APIClient

from .models import Resume, ResumeKey

User = get_user_model()


class ResumeEncryptionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cand', password='pass123')
        self.recruiter = User.objects.create_user(username='recr', password='pass123', role=User.Roles.RECRUITER)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_resume_save_encrypts_and_creates_key(self):
        content = b"hello resume"
        uploaded = SimpleUploadedFile("test.txt", content)
        resume = Resume.objects.create(user=self.user, file=uploaded)
        resume.refresh_from_db()
        # file should be encrypted and extension changed
        self.assertTrue(resume.is_encrypted)
        self.assertTrue(resume.file.name.endswith('.enc'))
        # key record exists
        key_obj = ResumeKey.objects.get(resume=resume)
        self.assertIsNotNone(key_obj.key)

    def test_authorized_download(self):
        content = b"secret"
        uploaded = SimpleUploadedFile("un.txt", content)
        resume = Resume.objects.create(user=self.user, file=uploaded)
        # allow recruiter
        resume.authorized_recruiters.add(self.recruiter)
        resume.save()

        # try download as unauthorized user
        url = reverse('download_resume', kwargs={'pk': resume.pk})
        self.client.force_authenticate(user=self.recruiter)
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.content, content)

        # unauthorized other user
        other = User.objects.create_user(username='other', password='a')
        self.client.force_authenticate(user=other)
        resp2 = self.client.get(url)
        self.assertEqual(resp2.status_code, 403)

    def test_upload_endpoint(self):
        # log back in as original user
        self.client.force_authenticate(user=self.user)
        url = reverse('upload_resume')
        content = b"filecontent"
        uploaded = SimpleUploadedFile("foo.txt", content)
        resp = self.client.post(url, {'file': uploaded}, format='multipart')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('id', data)
        # resume should exist and file encrypted
        resume = Resume.objects.get(pk=data['id'])
        self.assertTrue(resume.is_encrypted)
