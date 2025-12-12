Auto Job Uploader (Node.js)
This project automatically logs into an API, downloads small random videos from **Pexels**, and uploads them as **Job Posts** to your backend API with randomized title, budget, description, and address.

It is designed for generating **bulk test data (up to 100,000 jobs)** safely with delay control so the server does not overload.

---

🚀 Features
- 🔐 Auto Login (token based)
- 🎥 Fetch small videos from Pexels API
- ⬇ Auto download smallest video file
- ⬆ Upload jobs with:
  - category_id
  - title (randomized)
  - description (randomized)
  - budget (randomized)
  - address (randomized)
  - uploaded video
- 🕒 Delay added between jobs to prevent server overload
- 📦 Generate **thousands of jobs** automatically
- 🗂 Organized temp folder for video handling

---

🛠 Requirements
- Node.js 18+
- Pexels API key
- Your backend API credentials
- Stable internet (video download required)


