// Load backend secrets and config (including USDA_API_KEY) from .env.
require("dotenv").config();

const app = require("./app");
const logger = require('./shared/utils/logger');

// PORT is supplied by the hosting platform.
const port = Number(process.env.PORT) || 5000;
const publicApiUrl = process.env.PUBLIC_API_URL || "the configured deployment URL";

app.listen(port, () => {
	logger.info({ msg: `SAKHI backend listening at ${publicApiUrl}`, port });
});
