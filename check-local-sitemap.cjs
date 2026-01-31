
const http = require('http');

const url = 'http://localhost:8000/sitemap.xml';

http.get(url, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);
}).on('error', (e) => {
    console.error(e);
});
