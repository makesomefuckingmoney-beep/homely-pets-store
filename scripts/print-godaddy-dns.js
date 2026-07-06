#!/usr/bin/env node
/** Print GoDaddy DNS records for homelypets.co.uk */
const d = require("../config/domain.json");

console.log(`
Homely Pets — GoDaddy DNS for ${d.domain}
========================================

Store URL: ${d.primaryUrl}
Render host: ${d.renderServiceHost}

GoDaddy → My Products → ${d.domain} → DNS

1) CNAME record
   Type:  CNAME
   Name:  www
   Value: ${d.renderServiceHost}
   TTL:   1 Hour

2) Root forward (homelypets.co.uk → www)
   Domain → Forwarding → ${d.apexRedirect}
   Type: Permanent (301)

3) Render → Custom Domains → add www.${d.domain}

4) Render env: SITE_URL=${d.primaryUrl}

Full guide: GODADDY-DNS.md
`);
