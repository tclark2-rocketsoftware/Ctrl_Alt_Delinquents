# FastAPI entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import quizzes, answers, results

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
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(results.router, prefix="/api/results", tags=["results"])

@app.get("/")
async def root():
    return {"message": "Welcome to Quizruption API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
