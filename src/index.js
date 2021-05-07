const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  request.body.user = users.find(user => user.username == username);

  if (!request.body.user) return response.status(404).json({ error: "User not found!" })
  next();
}

function checkTodoExists(request, response,next) {
  const { user } = request.body;
  const { id } = request.params;
  request.body.todo = user.todos.find(todo => todo.id === id);

  if(!request.body.todo) return response.status(404).json({ error: "Todo not found!"})

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username == username);

  if (userAlreadyExists) return response.status(400).json({ error: "This username already exists!" })

  const user = {
    name, username,
    id: uuidv4(),
    todos: []
  }
  users.push(user)

  response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request.body;

  response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user, title, deadline } = request.body;

  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount,checkTodoExists, (request, response) => {
  const { title, deadline, todo } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount,checkTodoExists, (request, response) => {
  const { todo } = request.body;

  todo.done = true;

  response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount,checkTodoExists, (request, response) => {
  const { user, todo } = request.body;

  user.todos = user.todos.filter(_todo => _todo.id != todo.id)

  response.status(204).json([])

});

module.exports = app;