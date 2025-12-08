from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class ContactForm(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactFormCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str
    recaptcha_token: str


class Newsletter(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NewsletterCreate(BaseModel):
    email: EmailStr


class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    image_url: Optional[str] = None
    published_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    image_url: Optional[str] = None


# Routes
@api_router.get("/")
async def root():
    return {"message": "BM Wealth API - ARN 90008"}


@api_router.post("/contact", response_model=ContactForm)
async def create_contact(input: ContactFormCreate):
    # Verify reCAPTCHA token
    recaptcha_token = input.recaptcha_token
    secret_key = os.environ.get("RECAPTCHA_SECRET_KEY")

    if not secret_key:
        logger.warning("RECAPTCHA_SECRET_KEY not configured")
        raise HTTPException(status_code=500, detail="reCAPTCHA configuration error")

    # Verify token with Google - configurable timeout for faster response
    verify_url = "https://www.google.com/recaptcha/api/siteverify"
    verify_data = {"secret": secret_key, "response": recaptcha_token}
    recaptcha_timeout = int(os.environ.get("RECAPTCHA_TIMEOUT", "3"))

    try:
        verify_response = requests.post(verify_url, data=verify_data, timeout=recaptcha_timeout).json()

        if not verify_response.get("success") or verify_response.get("score", 0) < 0.5:
            logger.warning(f"reCAPTCHA verification failed: {verify_response}")
            raise HTTPException(status_code=400, detail="reCAPTCHA verification failed")
    except requests.Timeout:
        logger.error("reCAPTCHA verification timeout")
        raise HTTPException(status_code=500, detail="Verification service timeout. Please try again.")
    except requests.RequestException as e:
        logger.error(f"reCAPTCHA verification request failed: {e}")
        raise HTTPException(status_code=500, detail="Verification error. Please try again.")

    # Remove recaptcha_token before saving to database
    contact_dict = input.model_dump(exclude={"recaptcha_token"})
    contact_obj = ContactForm(**contact_dict)

    doc = contact_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()

    try:
        _ = await db.contacts.insert_one(doc)
    except Exception as e:
        logger.error(f"Database insert failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to save contact information. Please try again.")
    
    return contact_obj


@api_router.get("/contact", response_model=List[ContactForm])
async def get_contacts(skip: int = 0, limit: int = 50):
    contacts = (
        await db.contacts.find({}, {"_id": 0})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )

    for contact in contacts:
        if isinstance(contact["timestamp"], str):
            contact["timestamp"] = datetime.fromisoformat(contact["timestamp"])

    return contacts


@api_router.post("/newsletter", response_model=Newsletter)
async def subscribe_newsletter(input: NewsletterCreate):
    newsletter_dict = input.model_dump()
    newsletter_obj = Newsletter(**newsletter_dict)

    doc = newsletter_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()

    try:
        _ = await db.newsletter.insert_one(doc)
        return newsletter_obj
    except Exception as e:
        # Handle duplicate email error from unique index
        if "duplicate key error" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email already subscribed")
        raise HTTPException(status_code=500, detail="Failed to subscribe")


@api_router.get("/newsletter", response_model=List[Newsletter])
async def get_newsletter_subscribers(skip: int = 0, limit: int = 50):
    subscribers = (
        await db.newsletter.find({}, {"_id": 0})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )

    for sub in subscribers:
        if isinstance(sub["timestamp"], str):
            sub["timestamp"] = datetime.fromisoformat(sub["timestamp"])

    return subscribers


@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(input: BlogPostCreate):
    blog_dict = input.model_dump()
    blog_obj = BlogPost(**blog_dict)

    doc = blog_obj.model_dump()
    doc["published_date"] = doc["published_date"].isoformat()

    _ = await db.blog_posts.insert_one(doc)
    return blog_obj


@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(skip: int = 0, limit: int = 50):
    posts = (
        await db.blog_posts.find({}, {"_id": 0})
        .sort("published_date", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )

    for post in posts:
        if isinstance(post["published_date"], str):
            post["published_date"] = datetime.fromisoformat(post["published_date"])

    return posts


@api_router.get("/blog/{blog_id}", response_model=BlogPost)
async def get_blog_post(blog_id: str):
    post = await db.blog_posts.find_one({"id": blog_id}, {"_id": 0})

    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    if isinstance(post["published_date"], str):
        post["published_date"] = datetime.fromisoformat(post["published_date"])

    return post


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db_indexes():
    """Create database indexes on startup for optimized queries"""
    try:
        # Index for contacts - sort by timestamp
        await db.contacts.create_index([("timestamp", -1)])

        # Index for newsletter - unique email and sort by timestamp
        await db.newsletter.create_index("email", unique=True)
        await db.newsletter.create_index([("timestamp", -1)])

        # Index for blog posts - unique id and sort by published_date
        await db.blog_posts.create_index("id", unique=True)
        await db.blog_posts.create_index([("published_date", -1)])

        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning (may already exist): {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
