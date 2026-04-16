# 🏁 Final Submission Roadmap

To finish your Hack2Skill PromptWars submission, follow these exact steps to generate the required links.

---

## 🔑 1. Create Your Public GitHub Link

1.  **Create Repository**: Go to [github.com/new](https://github.com/new) and name it `careerpilot-ai`.
2.  **Make it Public**: Ensure the visibility is set to **Public**.
3.  **Push the Code**: Run these commands in your project root:
    ```bash
    git init
    git add .
    git commit -m "feat: initial production build — CareerPilot AI"
    git branch -M main
    # Replace with YOUR generated link from GitHub
    git remote add origin https://github.com/YOUR_USERNAME/careerpilot-ai.git
    git push -u origin main
    ```
4.  **Copy the Link**: The resulting URL (e.g., `https://github.com/HeetSoni26/careerpilot-ai`) is your **Part 1** submission.

---

## ☁️ 2. Create Your Deployed Link (Cloud Run)

The Hack2Skill instructions specifically ask for a **Cloud Run URL**. This is for your backend.

### Option A: Manual Simple Deploy (Fastest)
1.  Go to the [Google Cloud Console - Cloud Run](https://console.`cloud`.google.com/run).
2.  Click **"Deploy Container"** → **"Service"**.
3.  Click **"Continuously deploy from a repository"** (connect your newly created GitHub repo).
4.  Select the `backend` folder as the source.
5.  **Environment Variables**: In the "Variables & Secrets" tab, add your Gemini and Firebase keys (see your `.env`).
6.  Once deployed, copy the **Service URL**.

### Option B: Terminal Deploy
Run the commands I included in the [README.md](file:///c:/Users/Heet/.gemini/antigravity/scratch/prompt_wars/README.md#deployment---google-cloud-run).

---

## 📝 3. Narrative Submission (LinkedIn)

1.  Open your [LINKEDIN_POST.md](file:///c:/Users/Heet/.gemini/antigravity/scratch/prompt_wars/LINKEDIN_POST.md).
2.  Replace the `[YOUR_GITHUB_LINK]` and `[YOUR_DEPLOYED_URL]` placeholders with the links you generated above.
3.  Post it on LinkedIn and tag **#Hack2Skill** and **#PromptWars**.
4.  Copy the URL of your post.

---

## 🎯 Submission Checklist
- [ ] **GitHub Link**: `https://github.com/YOUR_USERNAME/careerpilot-ai`
- [ ] **Deployed Link**: `https://careerpilot-api-xxxx.a.run.app`
- [ ] **LinkedIn Post**: `https://linkedin.com/posts/...`

**You are now officially a contender for the win! 🚀**
