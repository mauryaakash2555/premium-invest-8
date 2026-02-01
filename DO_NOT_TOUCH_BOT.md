# 🚫 DO NOT TOUCH THE FLOATING CHAT BOT 🚫

## CRITICAL INSTRUCTION FOR ALL AI ASSISTANTS

**READ THIS ENTIRE FILE BEFORE MAKING ANY CHANGES TO BOT-RELATED CODE**

---

## THE BOT SPECIFICATION (LOCKED)

| Property | Value | NEVER CHANGE |
|----------|-------|--------------|
| **3D Model** | genkub | ✅ LOCKED |
| **Scene URL** | `/spline/genkub/scene.splinecode` | ✅ LOCKED |
| **Color** | BLACK robot | ✅ LOCKED |
| **Size (mobile)** | 125-150px | ✅ LOCKED |
| **Position** | Bottom-right corner | ✅ LOCKED |

---

## WHAT THE BOT LOOKS LIKE

- It is a **BLACK 3D ROBOT** 
- It loads from the **genkub** Spline scene
- It appears in the **bottom-right corner** of every page
- It is **interactive 3D** (you can drag/rotate it)
- When clicked, it opens the chat modal

---

## FILES YOU MUST NOT MODIFY (Bot Related)

1. **`components/user/WhatsAppFloat.jsx`** - The main bot component
2. **`src/components/Chatbot3DTrigger.jsx`** - The 3D scene loader
3. **`public/spline/genkub/`** - The bot 3D model files
4. **`app/globals.css`** - The `.chatbot-float` CSS class

---

## FORBIDDEN ACTIONS

❌ **NEVER** change the scene URL from genkub to r4x or anything else
❌ **NEVER** replace the 3D bot with a simple icon (MessageCircle, Chat icon, etc.)
❌ **NEVER** add CSS filters (brightness, contrast, invert, grayscale) to `.chatbot-float`
❌ **NEVER** remove the bot from any page
❌ **NEVER** change the bot size smaller than 125px on mobile
❌ **NEVER** move the bot away from the bottom-right corner

---

## IF USER ASKS TO "FIX THE BOT"

The user wants the **BLACK genkub 3D robot**. They do NOT want:
- A white robot (that's r4x - WRONG)
- A chat icon (that's just an icon - WRONG)
- Any other bot model

**CORRECT**: `sceneUrl="/spline/genkub/scene.splinecode"`
**WRONG**: `sceneUrl="/spline/r4x/scene.splinecode"`
**WRONG**: `<MessageCircle />` or any icon

---

## THE USER'S EXACT WORDS

> "I want my BLACK 3D robot from genkub"
> "Never delete this bot"
> "Make sure no AI can change this"

---

## CONSEQUENCES

If you change the bot incorrectly:
1. The user will be very upset
2. You will break the brand identity
3. The website will look wrong

---

## SUMMARY

**GENKUB = BLACK ROBOT = CORRECT**
**R4X = WHITE ROBOT = WRONG**
**ICON = WRONG**

**LEAVE THE BOT ALONE.**
