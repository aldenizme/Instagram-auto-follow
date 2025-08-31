import puppeteer from "puppeteer";

const username = "your-username";
// Simple delay function for any Puppeteer version
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Universal auto-follow function
async function autoFollow(page, username) {
  // Go to the target profile
  await page.goto(`https://www.instagram.com/${username}/`, {
    waitUntil: "networkidle2",
  });

  // Give time for the page to render
  await delay(5000);

  // Function to find and click the follow button dynamically
  const findFollowButton = async () => {
    return await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.find((btn) => {
        const text = btn.innerText.toLowerCase();
        return text.includes("follow") || text.includes("follow back");
      });
    });
  };

  // Try up to 3 times if button loads slowly
  for (let i = 0; i < 3; i++) {
    const followButton = await findFollowButton();

    if (followButton) {
      await followButton.click();
      console.log(`Successfully followed @${username}`);
      return true;
    } else {
      console.log(`Follow button not found yet, retrying (${i + 1})...`);
      await delay(3000);
    }
  }

  console.log(`Could not find follow button for @${username}`);
  return false;
}

// Main script
(async () => {
  const browser = await puppeteer.launch({
    headless: false, // show browser for manual login
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.instagram.com", { waitUntil: "networkidle2" });

  console.log("Please log in to Instagram manually in the opened window...");

  // Wait 40 seconds for manual login
  await delay(50000);

  // Your username to be followed
  const yourUsername = "aldenizme";
  await autoFollow(page, yourUsername);

  // Wait before closing browser
  await delay(5000);
  await browser.close();
})();
