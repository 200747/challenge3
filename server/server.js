import express from "express";
import { Server } from 'socket.io';

const app = express();
const port = 3000;
const server = app.listen(port, () => { console.log('Server running'); });
const io = new Server(server);

const sockets = [];
const users = [];
const messages = [];

app.use(express.static('public'));
app.use(express.urlencoded({ extended:true }));
app.use(express.json());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    res.redirect(`/chat/${req.body.username}`);
});

app.get('/chat/:username', (req, res) => {
    res.render('chat', { username:req.params.username });
});

//Er werd een nieuwe connectie met SocketIO gedecteerd
io.on('connection', (socket) => {

    sockets[socket.id] = socket;

    socket.on('join', (username) => {
    //Voeg username toe aan lijst
    users[socket.id] = username;
    //Verstuur 'join' bericht aan alle clients
    io.emit('join', { username:username, users:Object.values(users) });
    });

    socket.on('disconnect', (reason) => {
    //Haal username op van de disconnected user
    const username = users[socket.id];
    //Verwijder socket en username uit de lijsten
    delete sockets[socket.id];
    //Verstuur 'leave' bericht aan resterende clients
    delete users[socket.id];
    // en geef naam vertrekkende gebruiker en lijst met actieve gebruikers mee
    io.emit('leave', { username:username, users:Object.values(users) });
    });

    socket.on('message', (data) => {
    //Haal variabelen messenger en message op uit data
    const { messenger, message } = data;
    //Verstuur 'message' bericht aan alle clients
    io.emit('message', data);
    });
});