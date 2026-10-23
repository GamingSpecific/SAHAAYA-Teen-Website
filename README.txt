SAHAAYA - how to run

TEST ON YOUR LAPTOP
1. Install Node.js (nodejs.org).
2. In this folder run:  npm install
3. Start it:
   Mac/Linux:  RESPONDER_KEY=yoursecret node server.js
   Windows:    set RESPONDER_KEY=yoursecret   then   node server.js
4. Open http://localhost:8080 (the website) in one tab and
   http://localhost:8080/responder.html in another.
   Sign in with your key, click "Join guest-1", and chat.

GO ONLINE (Render, one place runs the site AND the chat)
1. Put all these files in a GitHub repository.
2. On render.com: New > Web Service > pick the repo.
   Build command: npm install      Start command: npm start
3. Add environment variable RESPONDER_KEY = a long random secret.
4. Deploy. You get a https link. Test it on a phone.
5. Optional: Settings > Custom Domains to attach your own domain.

Responders sign in at your-link/responder.html and must keep that page open.
Messages are never stored. Free hosting sleeps when idle.
