# Docker Setup for LectureMind AI

This guide explains how to build and run the LectureMind AI application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the container:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:3001`

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker Commands

1. **Build the Docker image:**
   ```bash
   docker build -t lecturemind-ai .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name lecturemind-ai \
     -p 3001:3001 \
     -e PORT=3001 \
     -e NODE_ENV=production \
     lecturemind-ai
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3001`

4. **View logs:**
   ```bash
   docker logs -f lecturemind-ai
   ```

5. **Stop the container:**
   ```bash
   docker stop lecturemind-ai
   docker rm lecturemind-ai
   ```

## Google Cloud Speech-to-Text Setup (Optional)

If you want to use the speech-to-text transcription feature:

1. **Create a Google Cloud Project** and enable the Speech-to-Text API

2. **Create a service account** and download the credentials JSON file

3. **Mount the credentials file** when running the container:
   ```bash
   docker run -d \
     --name lecturemind-ai \
     -p 3001:3001 \
     -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
     -e GOOGLE_CLOUD_PROJECT=your-project-id \
     -v /path/to/your/credentials.json:/app/credentials.json:ro \
     lecturemind-ai
   ```

   Or update `docker-compose.yml` with the credentials path.

## Environment Variables

- `PORT`: Port number for the server (default: 3001)
- `NODE_ENV`: Environment mode (production/development)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to Google Cloud credentials file (optional)
- `GOOGLE_CLOUD_PROJECT`: Google Cloud project ID (optional)

## Health Check

The container includes a health check endpoint at `/health`. You can verify the container is running:

```bash
curl http://localhost:3001/health
```

## Troubleshooting

### Container won't start
- Check logs: `docker logs lecturemind-ai`
- Verify port 3001 is not already in use
- Ensure Docker has enough resources allocated

### Speech-to-text not working
- Verify Google Cloud credentials are properly mounted
- Check that the Speech-to-Text API is enabled in your Google Cloud project
- Review container logs for authentication errors

### Static files not loading
- Ensure all files are copied to the container (check Dockerfile COPY commands)
- Verify the server.js is serving static files correctly

## Production Deployment

For production deployment:

1. Use a reverse proxy (nginx, Traefik) in front of the container
2. Set up proper SSL/TLS certificates
3. Configure environment variables securely
4. Use Docker secrets or environment variable management
5. Set up monitoring and logging
6. Configure resource limits in docker-compose.yml

## Building for Different Platforms

To build for a specific platform (e.g., ARM64):

```bash
docker build --platform linux/arm64 -t lecturemind-ai .
```


