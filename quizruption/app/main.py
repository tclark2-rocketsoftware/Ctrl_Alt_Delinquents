# FastAPI entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from app.database import engine, Base
from app.routes import quizzes, answers, results, auth
from app.routes import jokes
import logging
from logging.handlers import RotatingFileHandler
import os

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
app.include_router(auth.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(results.router, prefix="/api/results", tags=["results"])
app.include_router(jokes.router, prefix="/api/jokes", tags=["jokes"])

@app.on_event("startup")
async def _setup_logging_after_startup():
    root_logger = logging.getLogger()
    if not any(isinstance(h, RotatingFileHandler) for h in root_logger.handlers):
        file_handler = RotatingFileHandler(log_path, maxBytes=1_048_576, backupCount=3)
        file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s'))
        root_logger.addHandler(file_handler)
    root_logger.setLevel(logging.INFO)
    root_logger.info("Logging configured after startup.")

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
