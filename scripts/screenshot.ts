import { chromium } from "playwright";
import QRCode from "qrcode";
import path from "path";

async function main() {
  const browser = await chromium.launch();

  const page = await browser.newPage({
    viewport: {
      width: 1200,
      height: 1200,
    },
    deviceScaleFactor: 1,
  });

  // VirtualToLet homepage
  const websiteUrl = "https://virtualtolet.com";

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(websiteUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />

<style>
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 1200px;
  height: 1200px;
  overflow: hidden;
  background: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
}

.post {
  position: relative;
  width: 1200px;
  height: 1200px;
  overflow: hidden;
  background: #ffffff;
}

/* Decorative elements */

.green-bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 22px;
  height: 100%;
  background: #006A4E;
}

.red-bar {
  position: absolute;
  right: 0;
  top: 0;
  width: 22px;
  height: 100%;
  background: #F42A41;
}

.green-shape {
  position: absolute;
  right: -170px;
  top: -170px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: #006A4E;
}

.red-shape {
  position: absolute;
  left: -180px;
  bottom: -180px;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: #F42A41;
}

/* Main content */

.content {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
  padding: 65px 70px;
  display: flex;
  flex-direction: column;
}

/* Logo */

.logo {
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo svg {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
}

.logo-name {
  font-size: 43px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2.5px;
  color: #000000;
}

.logo-tagline {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #006A4E;
}

/* Hero */

.hero {
  margin-top: 85px;
}

.label {
  display: inline-block;
  padding: 12px 18px;
  background: #F42A41;
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.hero-title {
  margin-top: 28px;
  font-size: 76px;
  line-height: 0.94;
  font-weight: 950;
  letter-spacing: -5px;
  color: #000000;
}

.hero-title span {
  color: #006A4E;
}

.hero-text {
  margin-top: 25px;
  max-width: 650px;
  font-size: 26px;
  line-height: 1.35;
  font-weight: 500;
  color: #333333;
}

/* Main marketing area */

.marketing {
  margin-top: 55px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 45px;
  align-items: center;
}

/* Categories */

.categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.category {
  padding: 25px;
  border: 2px solid #E3E3E3;
  background: #ffffff;
}

.category-name {
  font-size: 23px;
  font-weight: 900;
  color: #000000;
}

.category-desc {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #777777;
}

/* Free message */

.free-box {
  margin-top: 28px;
  padding: 27px 30px;
  background: #006A4E;
  color: #ffffff;
}

.free-title {
  font-size: 34px;
  font-weight: 950;
  letter-spacing: -1px;
}

.free-subtitle {
  margin-top: 7px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255,255,255,0.88);
}

/* QR */

.qr-card {
  width: 380px;
  padding: 30px;
  background: #ffffff;
  border: 3px solid #000000;
  text-align: center;
}

.qr-title {
  font-size: 23px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #000000;
}

.qr-image {
  display: block;
  width: 270px;
  height: 270px;
  margin: 22px auto 18px;
}

.qr-scan {
  font-size: 15px;
  font-weight: 800;
  color: #006A4E;
}

.qr-url {
  margin-top: 7px;
  font-size: 15px;
  font-weight: 700;
  color: #555555;
}

/* Bottom */

.bottom {
  margin-top: auto;
  padding-top: 28px;
  border-top: 2px solid #E5E5E5;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.bottom-text {
  font-size: 22px;
  font-weight: 900;
  color: #000000;
}

.bottom-text span {
  color: #F42A41;
}

.website {
  text-align: right;
}

.website-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #777777;
}

.website-url {
  margin-top: 5px;
  font-size: 25px;
  font-weight: 950;
  color: #000000;
}
</style>
</head>

<body>

<div class="post">

  <div class="green-bar"></div>
  <div class="red-bar"></div>

  <div class="green-shape"></div>
  <div class="red-shape"></div>

  <div class="content">

    <!-- Logo -->

    <div class="logo">

      <svg
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="26"
          cy="26"
          r="22"
          stroke="#006A4E"
          stroke-width="4"
        />

        <path
          d="M11 31C15 41 26 45 36 39C44 34 47 24 42 15"
          stroke="#F42A41"
          stroke-width="4"
          stroke-linecap="round"
        />

        <circle
          cx="26"
          cy="26"
          r="6"
          fill="#006A4E"
        />

        <circle
          cx="26"
          cy="26"
          r="2.5"
          fill="#F42A41"
        />
      </svg>

      <div>
        <div class="logo-name">
          Virtual To-let
        </div>

        <div class="logo-tagline">
          Find it. List it. Rent it.
        </div>
      </div>

    </div>


    <!-- Hero -->

    <div class="hero">

      <div class="label">
        Bangladesh Rental Platform
      </div>

      <div class="hero-title">
        Looking for a<br />
        <span>place to rent?</span>
      </div>

      <div class="hero-text">
        Find homes, rooms, seats and garages
        <br />
        on VirtualToLet.
      </div>

    </div>


    <!-- Marketing + QR -->

    <div class="marketing">

      <div>

        <div class="categories">

          <div class="category">
            <div class="category-name">
              Basha
            </div>

            <div class="category-desc">
              Apartments
            </div>
          </div>

          <div class="category">
            <div class="category-name">
              Room
            </div>

            <div class="category-desc">
              Private rooms
            </div>
          </div>

          <div class="category">
            <div class="category-name">
              Seat
            </div>

            <div class="category-desc">
              Hostel seats
            </div>
          </div>

          <div class="category">
            <div class="category-name">
              Garage
            </div>

            <div class="category-desc">
              Parking
            </div>
          </div>

        </div>


        <div class="free-box">

          <div class="free-title">
            LIST FREE. BROWSE FREE.
          </div>

          <div class="free-subtitle">
            No listing fee. No browsing fee.
          </div>

        </div>

      </div>


      <!-- QR Code -->

      <div class="qr-card">

        <div class="qr-title">
          Scan & Visit
        </div>

        <img
          class="qr-image"
          src="${qrCodeDataUrl}"
          alt="QR code for VirtualToLet"
        />

        <div class="qr-scan">
          Scan to visit VirtualToLet
        </div>

        <div class="qr-url">
          virtualtolet.com
        </div>

      </div>

    </div>


    <!-- Bottom -->

    <div class="bottom">

      <div class="bottom-text">
        Your next place is
        <span>one scan away.</span>
      </div>

      <div class="website">

        <div class="website-label">
          Find it. List it. Rent it.
        </div>

        <div class="website-url">
          virtualtolet.com
        </div>

      </div>

    </div>

  </div>

</div>

</body>
</html>
`;

  try {
    console.log("Creating VirtualToLet comment marketing image...");

    await page.setContent(html, {
      waitUntil: "load",
    });

    await page.waitForTimeout(300);

    const outputPath = path.resolve(process.cwd(), "virtualtolet-comment-marketing.png");

    await page.screenshot({
      path: outputPath,
      type: "png",
      fullPage: false,
      animations: "disabled",
      scale: "css",
    });

    console.log("");
    console.log("✅ Comment marketing image created!");
    console.log(`📁 ${outputPath}`);
    console.log("📐 1200 × 1200 px");
    console.log(`🔗 QR destination: ${websiteUrl}`);
  } catch (error) {
    console.error("❌ Failed to create image.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
