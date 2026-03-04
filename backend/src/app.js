import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: Environment.get('CLIENT_URL'),
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Client connecté au dashboard public');
  
  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});