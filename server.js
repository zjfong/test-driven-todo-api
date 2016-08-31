// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files from public folder
app.use(express.static(__dirname + '/public'));

/************
 * DATABASE *
 ************/

// our database is an array for now with some hardcoded values
var todos = [
  { _id: 7, task: 'Laundry', description: 'Wash clothes' },
  { _id: 27, task: 'Grocery Shopping', description: 'Buy dinner for this week' },
  { _id: 44, task: 'Homework', description: 'Make this app super awesome!' }
];

/**********
 * ROUTES *
 **********/

/*
 * HTML Endpoints
 */

app.get('/', function homepage(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


/*
 * JSON API Endpoints
 *
 * The comments below give you an idea of the expected functionality
 * that you need to build. These are basic descriptions, for more
 * specifications, see the todosTest.js file and the outputs of running
 * the tests to see the exact details. BUILD THE FUNCTIONALITY IN THE
 * ORDER THAT THE TESTS DICTATE.
 */

app.get('/api/todos/search', function search(req, res) {
  /* This endpoint responds with the search results from the
   * query in the request. COMPLETE THIS ENDPOINT LAST.
   */

  var query = req.query.q;
  // var lower = query.toLowerCase();
  // console.log(lower);
  // console.log(query);
  var result = todos.filter(function searches(element, index){
    if(element._id == query){
      //console.log("element1" + element);
      return true;
    } else if(element.task === query){
      return true;
    } else if(element.description === query){
      return true;
    } else {
      return false;
    };
  });
  //console.log(result);
  res.send({todos: result});
});



app.get('/api/todos', function index(req, res) {
  /* This endpoint responds with all of the todos
   */
   res.json({todos});
});

var x = 45;
app.post('/api/todos', function create(req, res) {
  /* This endpoint will add a todo to our "database"
   * and respond with the newly created todo.
   */

   //var newId = req.body.id;
  var newTask = req.body.task;
  var newDesc = req.body.description;
  var newTodo = {_id: x, task: newTask, description: newDesc};
  todos.push(newTodo);
  res.json(newTodo);
  x++;
});

app.get('/api/todos/:id', function show(req, res) {
  /* This endpoint will return a single todo with the
   * id specified in the route parameter (:id)
   */
  var id = req.params.id;
  var number = parseInt(id);
  for(i=0; i<todos.length-1; i++){
    if(todos[i]._id === number){
      var result = todos[i];
      console.log(todos[i]);
      res.json(result);
    };

  };
  //res.send({todos});
});



app.put('/api/todos/:id', function update(req, res) {
  /* This endpoint will update a single todo with the
   * id specified in the route parameter (:id) and respond
   * with the newly updated todo.
   */
  var id = req.params.id;
  var number = parseInt(id);
  var newTask = req.body.task;
  var newDesc = req.body.description;
  var newTodo = {_id: number, task: newTask, description: newDesc};
  for(i=0; i<todos.length-1; i++){
    if(todos[i]._id === number){
      todos[i] = newTodo;
      res.json(newTodo);
    };
  };
  res.send({todos});
});

app.delete('/api/todos/:id', function destroy(req, res) {
  /* This endpoint will delete a single todo with the
   * id specified in the route parameter (:id) and respond
   * with success.
   */
  var id = req.params.id;
  var number = parseInt(id);
  for(i=0; i<todos.length-1; i++){
    if(todos[i]._id === number){
      todos.splice(i,1);
      res.send({todos});
    };

  };
  res.send({todos});
});

/**********
 * SERVER *
 **********/

// listen on port 3000
app.listen(3000, function() {
  console.log('Server running on http://localhost:3000');
});
