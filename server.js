const express = require('express');
const http = require('http');
const socket = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socket(server);

let tasks = [];

io.on('connection', (socket) => {
  console.log('Nowy użytkownik połączony');

  socket.emit('updateData', tasks);

  socket.on('addTask', (newTask) => {
    newTask.id = tasks.length + 1;
    tasks.push(newTask);
    socket.broadcast.emit('updateData', tasks);
  });

  socket.on('removeTask', (taskId) => {
    tasks = tasks.filter(task => task.id !== taskId);
    socket.broadcast.emit('updateData', tasks);
  });
});


app.use(express.static('client'));
app.use(express.json());

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
