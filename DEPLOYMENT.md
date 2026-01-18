# 🚀 How to Deploy KMAX Cinema

Since your app uses a Database, it needs a real server. **Render.com** is the best free option.

## Step 1: Open Render
1.  Go to **[https://dashboard.render.com](https://dashboard.render.com)**.
2.  **Sign Up / Log In** (Use your **GitHub** account for the easiest setup).

## Step 2: Create Web Service
1.  Click the **"New +"** button (top right).
2.  Select **"Web Service"**.
3.  Under "Connect a repository", click **"Connect"** next to `amaleswarsanu/KMAX`.
    *   *If you don't see it, click "Configure account" to give Render permission to see your repos.*

## Step 3: Configure (The Important Part)
Fill in these settings exactly:

| Setting | Value |
| :--- | :--- |
| **Name** | `kmax-cinema` (or any unique name) |
| **Region** | `Oregon (US West)` (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | *(Leave Blank)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

## Step 4: Go Live!
1.  Click **"Create Web Service"**.
2.  Wait about 2-3 minutes.
3.  Render will give you a link (like `https://kmax-cinema.onrender.com`).
4.  **Click it** and buy a ticket! 🍿
