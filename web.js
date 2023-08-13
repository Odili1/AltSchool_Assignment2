const fs = require('fs');
const path = require('path');
const http = require('http');
const { url } = require('inspector');


const handleResponse = (req, res) => (code, fileLocation) => {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(code);
    res.write(fileLocation);
    res.end()
}

const server = http.createServer((req, res) => {

    const response = handleResponse(req, res)

    if (req.url === '/' && req.method === 'GET'){
        const file = fs.readFileSync('./index.html');
        response(200, './index.html')
    };

    if (req.url.endsWith('.html') && req.method === 'GET'){
        const splitUrl = req.url.split('/');
        const fileName = splitUrl[1];
        const fileLocation = `./${fileName}`;

       try {
        const file = fs.readFileSync(fileLocation);
        response(200, file)
        
       } catch (error) {
        const errorFile = fs.readFileSync('./404.html');
        response(404, errorFile)
       }
    }
})



const port = 5006;



server.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
