# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install basic system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (from backend folder)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code directly (everything inside backend/)
COPY backend/ .

# Build step: Collect static files (whitenoise will serve them)
RUN python manage.py collectstatic --no-input

# Expose the port (Render or Railway will provide the $PORT env var)
EXPOSE 8000

# Run migrations and start gunicorn
# Run migrations, create an admin user (if doesn't exist), and start gunicorn
CMD python manage.py migrate && \
    python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(login_id='admin').exists() or User.objects.create_superuser(login_id='admin', email='admin@example.com', name='Admin User', mobile='0000000000', password='admin')" && \
    gunicorn --bind 0.0.0.0:${PORT:-8000} project.wsgi
