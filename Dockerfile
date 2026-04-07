# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies for dlib, opencv and psycopg2
# - libgl1 and libglib2.0-0 are for OpenCV
# - build-essential and cmake are for dlib
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libgl1 \
    libglib2.0-0 \
    python3-dev \
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

# Run the application
CMD gunicorn --bind 0.0.0.0:${PORT:-8000} project.wsgi
