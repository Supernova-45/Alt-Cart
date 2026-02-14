// Simple test script to verify Stagehand works
require('dotenv').config();
const { Stagehand } = require("@browserbasehq/stagehand");

async function test() {
  console.log('Starting Stagehand test...');
  console.log('API Key:', process.env.BROWSERBASE_API_KEY ? 'Set' : 'Missing');
  console.log('Project ID:', process.env.BROWSERBASE_PROJECT_ID ? 'Set' : 'Missing');

  try {
    console.log('\n1. Initializing Stagehand...');
    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
    });

    console.log('2. Calling init()...');
    await stagehand.init();
    console.log('✓ Stagehand initialized successfully!');

    console.log('\n3. Navigating to Amazon (using domcontentloaded)...');
    await stagehand.page.goto('https://www.amazon.com/dp/B0C2JYLPBW', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    console.log('✓ Navigation successful!');

    console.log('\n4. Waiting for content to load...');
    await stagehand.page.waitForTimeout(2000);

    console.log('\n5. Getting page title...');
    const title = await stagehand.page.title();
    console.log('Page title:', title);

    console.log('\n6. Trying to find product title...');
    const productTitle = await stagehand.page.$('#productTitle');
    if (productTitle) {
      const text = await productTitle.textContent();
      console.log('Product title:', text?.trim());
    } else {
      console.log('Product title element not found');
    }

    console.log('\n7. Closing Stagehand...');
    await stagehand.close();
    console.log('✓ Test completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

test();
