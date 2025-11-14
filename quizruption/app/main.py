# FastAPI entry point
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routes import quizzes, answers, results, auth, chat, uploads
from app.routes import jokes
import logging
from logging.handlers import RotatingFileHandler
import os

# Load environment variables from .env file
load_dotenv()

"""Configure application logging to file and create DB tables."""
# Ensure logs directory (optional); write in app root by default
log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app.log')
log_path = os.path.normpath(log_path)

root_logger = logging.getLogger()
if not any(isinstance(h, RotatingFileHandler) for h in root_logger.handlers):
    root_logger.setLevel(logging.INFO)
    file_handler = RotatingFileHandler(log_path, maxBytes=1_048_576, backupCount=3)
    file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s'))
    root_logger.addHandler(file_handler)
    root_logger.info(f"Logging initialized. Writing to {log_path}")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Quizruption API", description="Interactive Quiz Web App API", version="1.0.0")

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)  # auth router now carries its own /api/auth prefix
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(results.router, prefix="/api/results", tags=["results"])
app.include_router(jokes.router, prefix="/api/jokes", tags=["jokes"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(uploads.router)  # uploads router carries its own /api/upload prefix

# Serve uploaded files statically
upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Serve personality images statically
personality_images_dir = os.path.join(upload_dir, 'personality_images')
os.makedirs(personality_images_dir, exist_ok=True)

# Immediate route enumeration for debugging (before startup event)
for route in app.routes:
    logging.getLogger().info(f"(early) Route registered: {getattr(route, 'path', 'unknown')} -> {getattr(route, 'name', '')}")

@app.on_event("startup")
async def _setup_logging_after_startup():
    root_logger = logging.getLogger()
    if not any(isinstance(h, RotatingFileHandler) for h in root_logger.handlers):
        file_handler = RotatingFileHandler(log_path, maxBytes=1_048_576, backupCount=3)
        file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s'))
        root_logger.addHandler(file_handler)
    root_logger.setLevel(logging.INFO)
    root_logger.info("Logging configured after startup.")
    # Log registered routes for debugging router inclusion issues
    try:
        for route in app.routes:
            root_logger.info(f"Route registered: {getattr(route, 'path', 'unknown')} -> {getattr(route, 'name', '')}")
    except Exception as e:
        root_logger.warning(f"Failed to list routes: {e}")

@app.get("/")
async def root():
    return {"message": "Welcome to Quizruption API"}

@app.get("/demo", response_class=HTMLResponse)
async def demo():
    """Serve the authentication demo page"""
    demo_path = os.path.join(os.path.dirname(__file__), '..', '..', 'demo.html')
    try:
        with open(demo_path, 'r', encoding='utf-8') as f:
            return HTMLResponse(content=f.read(), status_code=200)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Demo page not found</h1>", status_code=404)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
