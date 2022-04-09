const http = require("http");
const fs = require('fs').promises;

const host = '0.0.0.0';
const port = 3838;

const page = (res, contents) => {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  return res.end(contents);
};

const notFound = (res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.writeHead(404);
  return res.end('HTTP/1.1 404 Not Found');  
};

const requestListener = async (req, res) => {
  const { url, method } = req;
  if (url==="/" && method==="GET") {  
    const contents = await fs.readFile(__dirname + "/public/index.html");
    return page(res, contents);
  }

  return notFound(res);
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
