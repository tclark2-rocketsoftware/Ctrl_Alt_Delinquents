# Image upload routes
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
import jwt
import os
import uuid
import logging
from pathlib import Path
import shutil
from PIL import Image
import io

router = APIRouter(prefix="/api/upload", tags=["uploads"])

# Initialize logger
logger = logging.getLogger(__name__)

# JWT Secret key (should match auth.py)
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

# Upload directory
UPLOAD_DIR = Path("uploads/profile_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Maximum file size (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def process_image(file_content: bytes, max_size: tuple = (800, 800)) -> bytes:
    """Process and resize image"""
    try:
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Resize image if it's too large
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        return output.getvalue()
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@router.post("/profile-image")
async def upload_profile_image(
    token: str,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process profile image"""
    
    logger.info(f"Profile image upload attempt - filename: {image.filename}, content_type: {image.content_type}")
    
    # Verify authentication
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logger.warning("Profile image upload failed - invalid token payload")
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError as e:
        logger.warning(f"Profile image upload failed - JWT error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        logger.error(f"Profile image upload failed - user not found: {username}")
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.info(f"Profile image upload for user: {user.username} (ID: {user.id})")
    
    # Validate file
    if not image.content_type or not image.content_type.startswith('image/'):
        logger.warning(f"Profile image upload failed - invalid content type: {image.content_type}")
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Get file extension
    file_extension = Path(image.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        logger.warning(f"Profile image upload failed - invalid extension: {file_extension}")
        raise HTTPException(
            status_code=400, 
            detail=f"File extension {file_extension} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Read file content
        file_content = await image.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            logger.warning(f"Profile image upload failed - file too large: {len(file_content)} bytes")
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
        
        logger.info(f"Processing image - size: {len(file_content)} bytes")
        
        # Process image
        processed_content = process_image(file_content)
        
        # Generate unique filename
        filename = f"{user.id}_{uuid.uuid4().hex}.jpg"
        file_path = UPLOAD_DIR / filename
        
        logger.info(f"Saving profile image to: {file_path}")
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(processed_content)
        
        # Create URL (in production, this would be a proper URL)
        image_url = f"/uploads/profile_images/{filename}"
        
        # Update user's profile image URL
        user.profile_image_url = image_url
        db.commit()
        
        logger.info(f"Profile image uploaded successfully for user {user.username}: {image_url}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Image uploaded successfully",
                "image_url": image_url,
                "filename": filename
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading profile image for user {user.username}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.delete("/profile-image")
async def delete_profile_image(
    token: str,
    db: Session = Depends(get_db)
):
    """Delete user's profile image"""
    
    # Verify authentication
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove file if it exists
    if user.profile_image_url:
        try:
            filename = Path(user.profile_image_url).name
            file_path = UPLOAD_DIR / filename
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    # Update user
    user.profile_image_url = None
    db.commit()
    
    return JSONResponse(
        status_code=200,
        content={"message": "Profile image deleted successfully"}
    )

@router.post("/personality-image")
async def upload_personality_image(
    token: str,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process personality outcome image"""
    
    # Verify authentication
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Get file extension
    file_extension = Path(image.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File extension {file_extension} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Read file content
        file_content = await image.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        
        # Process image
        processed_content = process_image(file_content, max_size=(400, 400))
        
        # Create unique filename
        unique_filename = f"personality_{uuid.uuid4()}{file_extension}"
        
        # Create personality images directory
        personality_dir = UPLOAD_DIR.parent / "personality_images"
        personality_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = personality_dir / unique_filename
        
        # Save processed image
        with open(file_path, "wb") as f:
            f.write(processed_content)
        
        # Return the image URL
        image_url = f"/uploads/personality_images/{unique_filename}"
        
        return JSONResponse(content={"image_url": image_url})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")