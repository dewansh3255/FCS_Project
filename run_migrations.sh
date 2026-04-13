#!/bin/bash
cd /app
python manage.py makemigrations jobs
python manage.py migrate
