'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');

// Set region to europe-west1 (closest to CIS users) or us-central1
setGlobalOptions({ region: 'us-central1', memory: '512MiB', timeoutSeconds: 120 });

const app = require('./server');

// Export the Express app as a single Firebase HTTP Function
exports.api = onRequest(app);
