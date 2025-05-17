// Servidor web simples para executar a aplicação localmente
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Normalizar URL removendo query strings e hash
  let url = req.url;
  url = url.split('?')[0];
  url = url.split('#')[0];

  // Se a URL terminar com '/', adicionar 'index.html'
  if (url.endsWith('/')) {
    url += 'index.html';
  }

  // Mapear a URL para um caminho de arquivo local
  const filePath = path.join(__dirname, url);
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Verificar se o tipo MIME é suportado
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Ler o arquivo e enviar a resposta
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Arquivo não encontrado
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('Arquivo não encontrado');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Erro de servidor
        res.writeHead(500);
        res.end(`Erro de servidor: ${error.code}`);
      }
    } else {
      // Sucesso
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/`);
  console.log(`Pressione Ctrl+C para encerrar o servidor`);
});
