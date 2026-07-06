#!/usr/bin/env node
/** Send a test purchase alert — requires NOTIFY_* keys in .env */
require("dotenv").config();
const { sendTestNotification, configuredChannels } = require("../server/notify");

const channels = configuredChannels();
if (!channels.length) {
  console.error("\nNo notification channels in .env — see NOTIFY.md\n");
  process.exit(1);
}

console.log("Sending test alert via:", channels.join(", "));
sendTestNotification()
  .then((r) => {
    console.log("Result:", r);
    process.exit(r.failed?.length ? 1 : 0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
