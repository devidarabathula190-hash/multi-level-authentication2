# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies for dlib, opencv and psycopg2
# dlib needs cmake and build-essential
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libgl1-mesa-glx \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the core project code
COPY . .

# Build step: Collect static files (whitenoise will serve them)
RUN python manage.py collectstatic --no-input

# Expose the port (Render or Railway will provide the $PORT env var)
EXPOSE 8000

# Run the application using gunicorn
CMD gunicorn --bind 0.0.0.0:${PORT:-8000} project.wsgi
