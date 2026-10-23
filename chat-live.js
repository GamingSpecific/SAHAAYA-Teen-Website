// Connects the chat box to server.js. Replaces the demo functions in index.html.
const WS_URL = location.protocol === 'file:'
  ? 'ws://localhost:8080'
  : (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;
let socket, waitTimer;
function connectToBackend() {
  socket = new WebSocket(WS_URL);
  socket.onopen = () => socket.send(JSON.stringify({ type: 'hello', role: 'visitor' }));
  socket.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.type === 'waiting') {
      addMsg('Waiting for someone to join you. This can take a few minutes.', 'sys');
      waitTimer = setTimeout(() => addMsg('Nobody is available right now. You can leave and try again later, or reach out to someone you trust.', 'sys'), 120000);
    }
    if (m.type === 'connected') { clearTimeout(waitTimer); addMsg('Someone has joined. Start whenever you want.', 'sys'); }
    if (m.type === 'msg') addMsg(m.text, 'them');
    if (m.type === 'ended') addMsg('The other person has left the chat.', 'sys');
  };
  socket.onerror = () => addMsg('Could not connect right now. Please try again later.', 'sys');
}
function sendMessage(text) { if (socket && socket.readyState === 1) socket.send(JSON.stringify({ type: 'msg', text })); }
function disconnect() { clearTimeout(waitTimer); if (socket) socket.close(); }
