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
    slug: Optional[str] = None
    tags: Optional[List[str]] = []
    read_time: Optional[str] = None


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


@api_router.get("/blog/slug/{slug}", response_model=BlogPost)
async def get_blog_post_by_slug(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})

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


async def seed_blog_data():
    """Seed Blog #1 into database if it doesn't exist"""
    try:
        # Check if Blog #1 already exists
        existing_blog = await db.blog_posts.find_one({"slug": "he-lost-47-lakh-following-expert-advice"})
        
        if existing_blog:
            logger.info("Blog #1 already exists, skipping seed")
            return
        
        blog_1_content = """
        <div style="background: #0A0A1A; color: #E5E5E5; font-family: 'Inter', sans-serif; line-height: 1.8;">
            <article style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
                <header style="margin-bottom: 40px;">
                    <h1 style="color: #DAA520; font-size: clamp(32px, 5vw, 48px); margin-bottom: 20px; line-height: 1.2;">
                        He Lost ₹47 Lakh Following "Expert" Advice
                    </h1>
                    <div style="color: #C0A062; font-size: 16px; margin-bottom: 20px;">
                        A cautionary tale about blind trust in financial advice
                    </div>
                </header>

                <section style="margin-bottom: 40px;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Rajesh Kumar (name changed), a 42-year-old software engineer from Mumbai, thought he was making the smartest financial move of his life. He had ₹50 lakh in savings, and his "financial advisor" promised 18% annual returns through a "guaranteed" investment scheme.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Two years later, Rajesh had lost ₹47 lakh. The advisor had disappeared, and the scheme turned out to be unregistered and illegal.
                    </p>
                </section>

                <section style="margin-bottom: 40px;">
                    <h2 style="color: #C0A062; font-size: clamp(24px, 4vw, 32px); margin-bottom: 20px;">
                        The Warning Signs He Missed
                    </h2>
                    <div style="background: rgba(218, 165, 32, 0.1); border-left: 4px solid #DAA520; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
                        <p style="margin-bottom: 15px;"><strong style="color: #DAA520;">Red Flag #1:</strong> The advisor wasn't registered with SEBI</p>
                        <p style="margin-bottom: 15px;"><strong style="color: #DAA520;">Red Flag #2:</strong> Promised "guaranteed" returns of 18%</p>
                        <p style="margin-bottom: 15px;"><strong style="color: #DAA520;">Red Flag #3:</strong> No proper documentation or regulatory compliance</p>
                        <p><strong style="color: #DAA520;">Red Flag #4:</strong> Pressure to invest quickly without due diligence</p>
                    </div>
                </section>

                <section style="margin-bottom: 40px;">
                    <h2 style="color: #C0A062; font-size: clamp(24px, 4vw, 32px); margin-bottom: 20px;">
                        How to Protect Yourself
                    </h2>
                    <ol style="padding-left: 20px; margin-bottom: 20px;">
                        <li style="margin-bottom: 15px; font-size: 16px;">
                            <strong style="color: #DAA520;">Verify Registration:</strong> Always check if your advisor is registered with SEBI. Visit <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" style="color: #C0A062; text-decoration: underline;">sebi.gov.in</a> to verify credentials.
                        </li>
                        <li style="margin-bottom: 15px; font-size: 16px;">
                            <strong style="color: #DAA520;">Be Skeptical of High Returns:</strong> If someone promises guaranteed returns above 12-15%, it's likely a scam. No legitimate investment can guarantee high returns.
                        </li>
                        <li style="margin-bottom: 15px; font-size: 16px;">
                            <strong style="color: #DAA520;">Demand Documentation:</strong> Legitimate advisors provide proper agreements, disclosure documents, and follow regulatory guidelines.
                        </li>
                        <li style="margin-bottom: 15px; font-size: 16px;">
                            <strong style="color: #DAA520;">Never Rush:</strong> Take time to research and understand any investment. Legitimate opportunities don't require immediate action.
                        </li>
                    </ol>
                </section>

                <section style="margin-bottom: 40px;">
                    <h2 style="color: #C0A062; font-size: clamp(24px, 4vw, 32px); margin-bottom: 20px;">
                        The Right Way to Invest
                    </h2>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        At BM Wealth, we believe in transparency and education. Our SEBI-registered advisors (ARN: 90008) work with you to create personalized investment strategies based on your goals, risk tolerance, and time horizon.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        We focus on:
                    </p>
                    <ul style="padding-left: 20px; margin-bottom: 20px;">
                        <li style="margin-bottom: 10px; font-size: 16px;">SEBI-regulated mutual funds and securities</li>
                        <li style="margin-bottom: 10px; font-size: 16px;">Transparent fee structures with no hidden charges</li>
                        <li style="margin-bottom: 10px; font-size: 16px;">Regular portfolio reviews and rebalancing</li>
                        <li style="margin-bottom: 10px; font-size: 16px;">Education and empowerment of our clients</li>
                    </ul>
                </section>

                <section style="background: rgba(218, 165, 32, 0.1); border-radius: 8px; padding: 30px; margin-bottom: 40px;">
                    <h2 style="color: #DAA520; font-size: clamp(20px, 3vw, 28px); margin-bottom: 20px; text-align: center;">
                        Don't Make the Same Mistake as Rajesh
                    </h2>
                    <p style="font-size: 18px; margin-bottom: 30px; text-align: center;">
                        Talk to a SEBI-registered investment advisor and protect your financial future.
                    </p>
                    <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                        <a href="https://wa.me/919324436399" target="_blank" rel="noopener noreferrer" 
                           style="background: linear-gradient(135deg, #DAA520 0%, #C0A062 100%); color: #000000; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; transition: transform 0.3s ease;">
                            WhatsApp Us
                        </a>
                        <a href="/contact" 
                           style="background: transparent; border: 2px solid #DAA520; color: #DAA520; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; transition: all 0.3s ease;">
                            Schedule Consultation
                        </a>
                    </div>
                </section>

                <section style="background: rgba(192, 160, 98, 0.05); border-radius: 8px; padding: 30px; margin-bottom: 40px;">
                    <h3 style="color: #C0A062; font-size: 18px; margin-bottom: 15px; font-weight: 600;">
                        📋 Regulatory Compliance & Disclaimers
                    </h3>
                    
                    <div style="font-size: 14px; color: #CCCCCC; line-height: 1.8; margin-bottom: 20px;">
                        <p style="margin-bottom: 15px;">
                            <strong style="color: #DAA520;">1. SEBI Registration Disclosure:</strong> BM Wealth is a SEBI Registered Investment Advisor with ARN: 90008. This registration does not imply endorsement by SEBI, nor does it guarantee investment returns or protect against losses.
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: #DAA520;">2. Investment Risk Warning:</strong> All investments in mutual funds and securities are subject to market risks. Past performance is not indicative of future results. The value of investments can go up or down, and you may receive less than your original investment. Please read all scheme-related documents carefully before investing.
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: #DAA520;">3. No Guaranteed Returns:</strong> We do not promise or guarantee any specific returns on investments. All investment decisions should be based on your individual financial goals, risk appetite, and investment horizon. Returns are subject to market volatility and various economic factors beyond our control.
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: #DAA520;">4. Educational Content Only:</strong> This blog post is for educational purposes only and does not constitute financial advice, investment recommendations, or an offer to buy or sell any securities. The case study presented is illustrative and based on common scenarios in the financial advisory industry. Individual circumstances vary, and you should consult with a qualified SEBI-registered investment advisor before making investment decisions.
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: #DAA520;">5. Due Diligence Required:</strong> Before investing, please verify the registration status of your financial advisor with SEBI, understand all fees and charges, read offer documents carefully, and assess whether the investment aligns with your risk profile and financial objectives.
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: #DAA520;">6. Liability Disclaimer:</strong> BM Wealth and its advisors shall not be liable for any losses, damages, or claims arising from investment decisions made by readers. This content is based on information believed to be reliable but is not guaranteed to be accurate or complete.
                        </p>
                        
                        <p>
                            <strong style="color: #DAA520;">7. Professional Advice Required:</strong> This article does not replace professional financial advice. Each investor's situation is unique, and we strongly recommend consulting with a SEBI-registered investment advisor who can assess your specific circumstances before making any investment decisions.
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid rgba(218, 165, 32, 0.2); padding-top: 20px; margin-top: 20px;">
                        <p style="font-size: 13px; color: #999999; text-align: center;">
                            For more information about our regulatory compliance, visit our <a href="/compliance" style="color: #C0A062; text-decoration: underline;">Compliance Page</a>.
                        </p>
                    </div>
                </section>

                <footer style="border-top: 1px solid rgba(218, 165, 32, 0.2); padding-top: 30px; text-align: center; color: #999999; font-size: 14px;">
                    <p>Written by the BM Wealth Editorial Team</p>
                    <p style="margin-top: 10px;">SEBI Registered Investment Advisor • ARN: 90008</p>
                </footer>
            </article>
        </div>
        """
        
        blog_1 = {
            "id": str(uuid.uuid4()),
            "title": "He Lost ₹47 Lakh Following Expert Advice",
            "slug": "he-lost-47-lakh-following-expert-advice",
            "excerpt": "A cautionary tale about a software engineer who lost his life savings to an unregistered financial advisor. Learn the warning signs and how to protect yourself from fraudulent investment schemes.",
            "content": blog_1_content.strip(),
            "author": "BM Wealth Editorial Team",
            "category": "Investor Protection",
            "image_url": "https://images.unsplash.com/photo-1554224311-beee460c201f?w=600&h=400&fit=crop&auto=format&fm=webp&q=75",
            "published_date": datetime.now(timezone.utc).isoformat(),
            "tags": ["investor-protection", "sebi-registration", "fraud-prevention", "financial-safety"],
            "read_time": "5 min read"
        }
        
        await db.blog_posts.insert_one(blog_1)
        logger.info("Blog #1 seeded successfully")
        
    except Exception as e:
        logger.error(f"Error seeding blog data: {e}")


@app.on_event("startup")
async def startup_db_indexes():
    """Create database indexes on startup for optimized queries"""
    try:
        # Index for contacts - sort by timestamp
        await db.contacts.create_index([("timestamp", -1)])

        # Index for newsletter - unique email and sort by timestamp
        await db.newsletter.create_index("email", unique=True)
        await db.newsletter.create_index([("timestamp", -1)])

        # Index for blog posts - unique id, slug and sort by published_date
        await db.blog_posts.create_index("id", unique=True)
        await db.blog_posts.create_index("slug", unique=True)
        await db.blog_posts.create_index([("published_date", -1)])

        logger.info("Database indexes created successfully")
        
        # Seed blog data
        await seed_blog_data()
        
    except Exception as e:
        logger.warning(f"Index creation warning (may already exist): {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
