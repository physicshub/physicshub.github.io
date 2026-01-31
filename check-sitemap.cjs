
const https = require('https');

const url = 'https://physicshub.github.io/sitemap.xml';

https.get(url, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body snippet:', data.substring(0, 200));
    });

}).on('error', (e) => {
    console.error(e);
});
