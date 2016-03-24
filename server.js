// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files from public folder
app.use(express.static(__dirname + '/public'));

// set view engine to hbs (handlebars)
app.set('view engine', 'hbs');

// add controllers
var controllers = require('./controllers');





// HOMEPAGE ROUTE

app.get('/', function (req, res) {
  res.render('index');
});


// API ROUTES

// get all todos
app.get('/api/todos', controllers.todos.todoIndex);

// create new todo
app.post('/api/todos', controllers.todos.todoCreate);

// get one todo
app.get('/api/todos/:id', controllers.todos.todoShow);

// update todo
app.put('/api/todos/:id', controllers.todos.todoUpdate);

// delete todo
app.delete('/api/todos/:id', controllers.todos.todoDestroy);

// listen on port 3000
app.listen(3000, function() {
  console.log('server started');
});
