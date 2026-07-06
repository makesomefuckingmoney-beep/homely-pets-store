const domain = require("../config/domain.json");

module.exports = {
  ...domain,
  isProductionHost(hostname) {
    return (
      hostname === domain.domain ||
      hostname === domain.wwwHost ||
      hostname === `www.${domain.domain}`
    );
  },
};
