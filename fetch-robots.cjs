
const https = require('https');

https.get('https://physicshub.github.io/robots.txt', (res) => {
    console.log('StatusCode:', res.statusCode);
    res.pipe(process.stdout);
});
