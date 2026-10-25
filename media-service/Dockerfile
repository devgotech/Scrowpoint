FROM python:3.11-slim

WORKDIR /app

# Install system utilities needed for image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

ENV PORT=8000
ENV STORAGE_BACKEND=local
ENV LOCAL_STORAGE_DIR=/tmp/scrowpoint_media
ENV CDN_BASE_URL=http://localhost:8000/media

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
