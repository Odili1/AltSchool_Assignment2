const http = require('http');
const fs = require('fs')
const path = require('path');


// PORT
const port = 5007


// DATABASE RAW DAT
const dbFile = path.join(__dirname + '/db.json');

const db = (fs.readFileSync(dbFile));
const data = JSON.parse(db);


// Handle Responses
const handleResponse = (req, res) => ({code, error = null, data = null}) => {
    res.setHeader('Content-Type', 'application/json');
    res.writeHeader(code);
    res.write(JSON.stringify({data, error}));
    res.end()
}


// BodyParser
const borderParser = (req, res, handleRequest) => {
    const body = [];
    console.log('body Parser');
    req.on('data', (chunk) => {
        // console.log(chunk);
        body.push(chunk)
    });

    req.on('end', () => {
        const content = Buffer.concat(body).toString();
        req.body = JSON.parse(content);

        handleRequest(req, res)
    })
}


// Handle Requests
const handleRequest = (req, res) => {

    const response = handleResponse(req, res)

    console.log('Handle Request');
    // Create Item (POST)
    if (req.url === '/v1/items' && req.method === 'POST') {
        data.items.push({...req.body, id: Math.floor(Math.random() * 500).toString()});

        fs.writeFileSync(dbFile, JSON.stringify(data))
        console.log(JSON.stringify(data));
        // console.log(db);
        return response({
            code: 201,
            data: req.body,
        })
    };


    // Get all Items (GET)
    if (req.url === '/v1/items' && req.method === 'GET') {
        return response({
            code: 200,
            data: data
        })
    }


    console.log(`Get an item`);
    // Get Item (GET)
    if (req.url.startsWith('/v1/items/') && req.method === 'GET') {
        const id = req.url.split('/')[3];
        console.log(`Get an item`);
        console.log(id);
        // Find Item from database
        const itemIndex = data.items.findIndex((item) => item.id === id);
        console.log(itemIndex);
        if (itemIndex === -1) {
            return response({
                code: 404,
                error: `Item not Found`
            })
        };

        const foundItem = data.items[itemIndex];

        return response({
            code: 200,
            data: foundItem
        })
    };


    // Update Item (PATCH)
    if (req.url.startsWith('/v1/items/') && req.method === 'PATCH') {
        const id = req.url.split('/')[3];
        // Find Item from database
        const itemIndex = data.items.findIndex((item) => item.id === id);
        console.log(itemIndex);
        if (itemIndex === -1) {
            return response({
                code: 404,
                error: `Item not Found`
            })
        };

        // Get and update data
        const updatedData = {...data.items[itemIndex], ...req.body}
        data.items.splice(itemIndex, 1, updatedData);

        // Save to database
        fs.writeFileSync(dbFile, JSON.stringify(data));

        response({
            code: 200,
            data: updatedData
        });
    };


    // Delete Item (DELETE)
    if (req.url.startsWith('/v1/items/') && req.method === 'DELETE') {
        const id = req.url.split('/')[3];
        // Find Item from database
        const itemIndex = data.items.findIndex((item) => item.id === id);
        console.log(itemIndex);
        if (itemIndex === -1) {
            return response({
                code: 404,
                error: `Item not Found`
            })
        };

        // Get and update data
        data.items.splice(itemIndex, 1);

        // Save to database
        fs.writeFileSync(dbFile, JSON.stringify(data));

        response({
            code: 200,
            data: data
        });
    };
}


const server = http.createServer((req, res) => borderParser(req, res, handleRequest));



server.listen(port, () => {
    console.log(`Server running on port ${5007}`);
})