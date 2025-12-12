import fetch from "node-fetch";
import axios from "axios";
import FormData from "form-data";
import fs from "fs-extra";

// ======================
// SETTINGS
// ======================
const LOGIN_API = "Ypur_login_Endpoint";
const JOB_API = "Your_Create_API_Where_you_create";
const PEXELS_API_KEY = "PEXEL_API";

const CATEGORY_ID = "CATEGORY_ID_LIKE_PLUMBER_ID";
const TOTAL = 300;   // jitna chaho badha do
const DELAY = 5000;  // 2 second delay (server overload nahi hoga)

// Random data
const addresses = [
  "Gulshan-e-Iqbal Karachi", "Gulistan-e-Jauhar Karachi",
  "Nazimabad Karachi", "North Karachi",
  "DHA Phase 6 Karachi", "Clifton Block 5 Karachi"
];

const titles = [
  "Professional Plumber Needed Today",
  "Urgent Bathroom Leakage Repair Required",
  "Experienced Plumber For Kitchen Pipe Fix",
  "Water Pipe Repair Needed ASAP",
  "Plumbing Issue — Need Fix Urgently"
];

const descriptions = [
  "Looking for a skilled plumber for pipe leakage repair.",
  "Bathroom drain blocked, need urgent repair service.",
  "Kitchen water pipeline leaking, need quick fix.",
  "Need reliable plumber for washroom repair.",
  "Tap leakage issue, need plumber immediately."
];

// ======================
// 1. LOGIN
// ======================
async function login() {
  const res = await fetch(LOGIN_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone_number: "LOGIN_EMAIL",
      password: "LOGIN_PASSWORD"
    })
  });

  const data = await res.json();
  console.log("✅ Login successful");
  return data.tokens.access_token;
}

// ======================
// 2. GET SMALL VIDEO FROM PEXELS
// ======================
async function getVideoURL() {
  const res = await fetch(
    `https://api.pexels.com/videos/search?query=plumber&per_page=10`,
    { headers: { Authorization: PEXELS_API_KEY } }
  );

  const data = await res.json();
  if (!data.videos || data.videos.length === 0) return getVideoURL();

  // sabse chota video choose karna
  const random = data.videos[Math.floor(Math.random() * data.videos.length)];
  const smallest = random.video_files.sort((a, b) => a.width - b.width)[0];

  return smallest.link;
}

// ======================
// 3. DOWNLOAD VIDEO
// ======================
async function downloadVideo(url, filePath) {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({ url, method: "GET", responseType: "stream" });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// ======================
// 4. UPLOAD JOB
// ======================
async function uploadJob(token, filePath) {
  const form = new FormData();
  form.append("category_id", CATEGORY_ID);
  form.append("title", titles[Math.floor(Math.random() * titles.length)]);
  form.append("description", descriptions[Math.floor(Math.random() * descriptions.length)]);
  form.append("budget", Math.floor(Math.random() * 2000) + 2000);
  form.append("address", addresses[Math.floor(Math.random() * addresses.length)]);
  form.append("open_budget", "true");
  form.append("media", fs.createReadStream(filePath));

  try {
    const res = await axios.post(JOB_API, form, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000,
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });

    console.log("✔ Upload done");
    return res.data;
  } catch (err) {
    console.log("❌ Upload failed:", err.response?.status, err.response?.data);
    return null;
  }
}

// ======================
// 5. PROCESS JOB
// ======================
async function processJob(token) {
  try {
    const videoURL = await getVideoURL();
    const filePath = `./temp/${Date.now()}.mp4`;

    console.log("⬇ Downloading video...");
    await downloadVideo(videoURL, filePath);

    console.log("⬆ Uploading job...");
    await uploadJob(token, filePath);

    fs.removeSync(filePath);
    console.log("✅ Job complete\n");

  } catch (err) {
    console.log("❌ Job error", err);
  }
}

// ======================
// Sleep function (delay)
// ======================
function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// ======================
// 6. RUN ALL JOBS
// ======================
async function runAll() {
  fs.ensureDirSync("./temp");

  const token = await login();

  for (let i = 0; i < TOTAL; i++) {
    console.log(`▶ Job ${i + 1}/${TOTAL}`);

    await processJob(token);
    await sleep(DELAY);  // IMPORTANT: Server overload nahi hoga
  }

  console.log("🎉 All jobs completed");
}

runAll();

