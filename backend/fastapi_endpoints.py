"""
FastAPI Endpoints for Story Submission System

Add these endpoints to your existing server.py or create a new FastAPI app.
Requires: pip install fastapi pydantic motor (for MongoDB async)

Usage:
1. Copy these endpoints to your server.py
2. Configure MongoDB connection
3. Set FASTAPI_URL in your Next.js .env file
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from bson import ObjectId

# ============================================
# MODELS
# ============================================

class StorySubmission(BaseModel):
    """Model for incoming story submissions"""
    # Common fields
    title: str
    type: str  # 'impact' or 'guest'
    author_name: str
    author_email: EmailStr
    author_phone: str
    submitted_at: str
    
    # Impact-specific fields
    incident_description: Optional[str] = None
    date_occurred: Optional[str] = None
    location: Optional[str] = None
    people_affected: Optional[str] = None
    evidence: Optional[str] = None
    impact_result: Optional[str] = None
    proposed_solution: Optional[str] = None
    publish_anonymously: Optional[bool] = False
    visual_keywords: Optional[str] = None
    
    # Guest-specific fields
    article_content: Optional[str] = None
    expertise_area: Optional[str] = None
    author_credentials: Optional[str] = None
    author_bio: Optional[str] = None
    author_linkedin: Optional[str] = None
    sources_references: Optional[str] = None


class ApprovalData(BaseModel):
    """Model for approval data from admin"""
    content_enhanced: Optional[str] = None
    image_url: Optional[str] = None
    affiliate_link: Optional[str] = None
    sponsored_by: Optional[str] = None
    tags_to_add: Optional[List[str]] = []


class RejectionData(BaseModel):
    """Model for rejection data"""
    reason: str


# ============================================
# ENDPOINTS - Add to your server.py
# ============================================

# Assuming you have:
# app = FastAPI()
# db = motor_asyncio.AsyncIOMotorClient(MONGO_URI)["your_database"]

"""
@app.post("/api/submit-post")
async def submit_post(submission: StorySubmission):
    '''
    Public endpoint for story submissions
    '''
    try:
        # Build document
        doc = submission.dict()
        doc["status"] = "PENDING"
        doc["created_at"] = datetime.utcnow()
        doc["views"] = 0
        doc["likes"] = 0
        doc["shares"] = 0
        
        # Insert to MongoDB
        result = await db["submissions"].insert_one(doc)
        
        # TODO: Send confirmation email to author
        # await send_confirmation_email(submission.author_email, submission.title)
        
        # TODO: Send notification to admin
        # await notify_admin_new_submission(submission.title, submission.type)
        
        return {
            "success": True,
            "id": str(result.inserted_id),
            "message": "Submission received. We'll review within 48 hours."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")


@app.get("/api/admin/queue")
async def get_admin_queue():
    '''
    Get all pending submissions for admin review
    TODO: Add authentication middleware to protect this endpoint
    '''
    try:
        pending = await db["submissions"].find({
            "status": "PENDING"
        }).sort("submitted_at", -1).to_list(100)
        
        # Convert ObjectId to string for JSON serialization
        for post in pending:
            post["_id"] = str(post["_id"])
        
        return pending
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch queue: {str(e)}")


@app.post("/api/admin/approve/{post_id}")
async def approve_post(post_id: str, approval_data: ApprovalData):
    '''
    Approve and publish a submission
    TODO: Add authentication middleware
    '''
    try:
        update = {
            "$set": {
                "content_enhanced": approval_data.content_enhanced,
                "image_url": approval_data.image_url,
                "affiliate_link": approval_data.affiliate_link,
                "sponsored_by": approval_data.sponsored_by,
                "tags": approval_data.tags_to_add or [],
                "status": "APPROVED",
                "approved_at": datetime.utcnow(),
                "published_at": datetime.utcnow()
            }
        }
        
        result = await db["submissions"].update_one(
            {"_id": ObjectId(post_id)},
            update
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Get the approved post for notifications
        approved_post = await db["submissions"].find_one({"_id": ObjectId(post_id)})
        
        # TODO: Send approval email to author
        # await send_approval_email(approved_post["author_email"], approved_post["title"])
        
        # TODO: Post to social media if configured
        # if approval_data.tags_to_add:
        #     await post_to_twitter(approved_post, approval_data.tags_to_add)
        
        return {"message": "Approved and published", "id": post_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")


@app.post("/api/admin/reject/{post_id}")
async def reject_post(post_id: str, rejection: RejectionData):
    '''
    Reject a submission with reason
    TODO: Add authentication middleware
    '''
    try:
        result = await db["submissions"].update_one(
            {"_id": ObjectId(post_id)},
            {
                "$set": {
                    "status": "REJECTED",
                    "rejection_reason": rejection.reason,
                    "rejected_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Get the rejected post for email
        rejected_post = await db["submissions"].find_one({"_id": ObjectId(post_id)})
        
        # TODO: Send rejection email to author with reason
        # await send_rejection_email(
        #     rejected_post["author_email"], 
        #     rejected_post["title"],
        #     rejection.reason
        # )
        
        return {"message": "Rejected", "id": post_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rejection failed: {str(e)}")


@app.get("/api/published/{post_type}")
async def get_published_posts(post_type: str, limit: int = 20, skip: int = 0):
    '''
    Get published posts by type (impact/guest)
    '''
    try:
        posts = await db["submissions"].find({
            "status": "APPROVED",
            "type": post_type
        }).sort("published_at", -1).skip(skip).limit(limit).to_list(limit)
        
        for post in posts:
            post["_id"] = str(post["_id"])
            # Hide author details if anonymous
            if post.get("publish_anonymously"):
                post["author_name"] = "A Mumbai Resident"
                del post["author_email"]
                del post["author_phone"]
        
        return posts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")
"""

# ============================================
# HELPER FUNCTIONS (implement as needed)
# ============================================

"""
async def send_confirmation_email(email: str, title: str):
    '''Send confirmation email to author after submission'''
    # Use your email service (SendGrid, AWS SES, etc.)
    pass


async def send_approval_email(email: str, title: str):
    '''Send approval notification to author'''
    pass


async def send_rejection_email(email: str, title: str, reason: str):
    '''Send rejection email with reason'''
    pass


async def notify_admin_new_submission(title: str, submission_type: str):
    '''Notify admin of new submission (email, Slack, etc.)'''
    pass


async def post_to_twitter(post: dict, tags: List[str]):
    '''Auto-post approved story to Twitter'''
    pass
"""

print("""
============================================
FASTAPI ENDPOINTS FOR STORY SUBMISSION SYSTEM
============================================

To use these endpoints:

1. Copy the endpoint code (inside triple quotes) to your server.py

2. Install dependencies:
   pip install fastapi pydantic motor

3. Set up MongoDB connection:
   from motor.motor_asyncio import AsyncIOMotorClient
   client = AsyncIOMotorClient("mongodb://localhost:27017")
   db = client["premium_invest"]

4. Add to your Next.js .env:
   FASTAPI_URL=http://localhost:8000

5. Implement email notifications (optional):
   - SendGrid
   - AWS SES
   - Nodemailer

============================================
""")
