import { chromium } from "playwright-core";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const pages = [
  { locale: "en", path: "/en/get-involved", amount: "$25" },
  { locale: "en-us", path: "/en/get-involved?country=US", amount: "$25" },
  { locale: "de", path: "/de/mitmachen", amount: "25 €" },
  { locale: "sk", path: "/sk/zapojte-sa", amount: "25 €" },
  { locale: "el", path: "/el/symmetechete", amount: "25 €" },
  { locale: "cs", path: "/cs/zapojte-se", amount: "600 Kč" },
  { locale: "ro", path: "/ro/implica-te", amount: "125 lei" },
  { locale: "sr", path: "/sr/prikljuci-se", amount: "3.000 дин." },
  { locale: "ru", path: "/ru/uchastvovat", amount: "25 $" },
  { locale: "mk", path: "/mk/vklucise", amount: "1.500 ден." },
];

const browser = await chromium.launch({
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

let failed = false;
for (const entry of pages) {
  const page = await browser.newPage();
  const problems = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      msg.type() === "error" ||
      /hydrat|did not match|text content does not match|Minified React error #418/i.test(text)
    ) {
      problems.push(`${msg.type()}: ${text}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  await page.goto(base + entry.path, { waitUntil: "networkidle" });
  const body = await page.locator("body").innerText();
  if (!body.includes(entry.amount)) {
    problems.push(`missing amount text ${JSON.stringify(entry.amount)}`);
  }
  if (problems.length > 0) {
    failed = true;
    console.log(entry.locale, "FAIL");
    for (const problem of problems) console.log(" ", problem);
  } else {
    console.log(entry.locale, "ok", JSON.stringify(entry.amount));
  }
  await page.close();
}

await browser.close();
if (failed) process.exit(1);
