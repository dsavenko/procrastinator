const static = require('node-static')
const file = new static.Server()

require('http').createServer((request, response) => {
    request.addListener('end', () => file.serve(request, response)).resume()
}).listen(process.env.PORT || 8000)
