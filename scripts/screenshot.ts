import { chromium } from "playwright";
import QRCode from "qrcode";
import path from "path";

const WIDTH = 1498;
const HEIGHT = 1498;

const outputPath = path.join(process.cwd(), "virtualtolet-4.6-inch-sticker.png");

async function main() {
  const qrDataUrl = await QRCode.toDataURL("https://virtualtolet.com", {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 1200,
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
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  overflow: hidden;
  background: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
}

.sticker {
  position: relative;
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  background: #ffffff;
  overflow: hidden;
}

/* Brand */
.brand {
  position: absolute;
  top: 55px;
  left: 50px;
  right: 50px;
  text-align: center;

  font-size: 70px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -3px;

  color: #000000;
}

.brand span {
  color: #006A4E;
}

/* Main FREE message */
.free {
  position: absolute;
  top: 155px;
  left: 50px;
  right: 50px;

  text-align: center;

  font-size: 88px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -3px;

  color: #F42A41;
}

.free-sub {
  position: absolute;
  top: 255px;
  left: 50px;
  right: 50px;

  text-align: center;

  font-size: 42px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;

  color: #000000;
}

/* QR */
.qr-wrapper {
  position: absolute;

  top: 350px;
  left: 99px;

  width: 1300px;
  height: 950px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-box {
  width: 920px;
  height: 920px;

  padding: 32px;

  background: #ffffff;

  border: 9px solid #000000;
  border-radius: 36px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-box img {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: contain;
}

/* Scan instruction */
.scan {
  position: absolute;

  left: 50%;
  transform: translateX(-50%);

  bottom: 78px;

  padding: 20px 40px;

  background: #006A4E;
  color: #ffffff;

  border-radius: 18px;

  font-size: 42px;
  line-height: 1;
  font-weight: 900;

  white-space: nowrap;
}

/* Bottom URL */
.url {
  position: absolute;

  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);

  font-size: 25px;
  line-height: 1;
  font-weight: 800;

  color: #000000;

  white-space: nowrap;
}
</style>
</head>

<body>

<div class="sticker">

  <div class="brand">
    Virtual <span>To-let</span>
  </div>

  <div class="free">
    100% FREE
  </div>

  <div class="free-sub">
    LIST FREE • BROWSE FREE
  </div>

  <div class="qr-wrapper">

    <div class="qr-box">
      <img
        src="${qrDataUrl}"
        alt="Scan to visit VirtualToLet"
      />
    </div>

    <div class="scan">
      SCAN TO FIND RENTAL
    </div>

  </div>

  <div class="url">
    virtualtolet.com
  </div>

</div>

</body>
</html>
`;

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: WIDTH,
      height: HEIGHT,
    },
    deviceScaleFactor: 1,
  });

  await page.setContent(html, {
    waitUntil: "networkidle",
  });

  await page.screenshot({
    path: outputPath,
    type: "png",
  });

  await browser.close();

  console.log("");
  console.log("✅ Sticker created successfully");
  console.log(`📁 ${outputPath}`);
  console.log(`📐 ${WIDTH} × ${HEIGHT}px`);
  console.log("🔗 QR: https://virtualtolet.com");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
