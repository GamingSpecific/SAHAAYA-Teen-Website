// Serves the website + anonymous chat relay. Run: npm install && RESPONDER_KEY=yoursecret node server.js
// Messages are passed straight through and NEVER stored or logged.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const KEY = process.env.RESPONDER_KEY || 'change-me';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };
const files = new Set(['/index.html', '/style.css', '/chat-live.js', '/responder.html']);
// serves the website AND the chat from one place
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  if (!files.has(p)) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(__dirname, p), (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] });
    res.end(data);
  });
});
const wss = new WebSocketServer({ server });
setInterval(() => wss.clients.forEach(c => c.ping()), 30000);   // keeps connections alive
const visitors = new Map();   // id -> user object
const responders = new Set();
let n = 0;

const send = (ws, o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
const pushQueue = () => {
  const waiting = [...visitors.values()].filter(v => !v.partner).map(v => v.id);
  responders.forEach(r => send(r.ws, { type: 'queue', waiting }));
};
const endPair = me => {
  if (me.partner) { send(me.partner.ws, { type: 'ended' }); me.partner.partner = null; me.partner = null; }
};

wss.on('connection', ws => {
  const me = { ws, id: null, role: null, partner: null };
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.type === 'hello' && m.role === 'visitor' && !me.role) {
      me.role = 'visitor'; me.id = 'guest-' + (++n); visitors.set(me.id, me);
      send(ws, { type: 'waiting' }); pushQueue();
    } else if (m.type === 'hello' && m.role === 'responder' && m.key === KEY && !me.role) {
      me.role = 'responder'; responders.add(me); send(ws, { type: 'ok' }); pushQueue();
    } else if (m.type === 'join' && me.role === 'responder' && !me.partner) {
      const v = visitors.get(m.id);
      if (v && !v.partner) {
        v.partner = me; me.partner = v;
        send(v.ws, { type: 'connected' }); send(ws, { type: 'connected', id: v.id }); pushQueue();
      }
    } else if (m.type === 'msg' && me.partner && typeof m.text === 'string') {
      send(me.partner.ws, { type: 'msg', text: m.text.slice(0, 1000) });
    }
  });
  ws.on('close', () => {
    endPair(me);
    if (me.role === 'visitor') visitors.delete(me.id);
    if (me.role === 'responder') responders.delete(me);
    pushQueue();
  });
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log('Running on http://localhost:' + PORT));
