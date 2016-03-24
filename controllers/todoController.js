var todoController = {};

// pre-seeded todo data; our "database" is an array for now
var todos = [
  { _id: 1, task: 'Laundry', description: 'Wash clothes' },
  { _id: 2, task: 'Grocery Shopping', description: 'Buy dinner for this week' },
  { _id: 3, task: 'Homework', description: 'Make this app super awesome!' }
];


function todoIndex(req, res, next) {
  // send all todos as JSON response
  res.json({ todos: todos });
}


function todoCreate(req, res, next) {
  // create new todo with form data (`req.body`)
  var newTodo = req.body;

  // set sequential id (last id in `todos` array + 1)
  if (todos.length > 0) {
    newTodo._id = todos[todos.length - 1]._id + 1;
  } else {
    newTodo._id = 1;
  }

  // add newTodo to `todos` array
  todos.push(newTodo);

  // send newTodo as JSON response
  res.json(newTodo);

}


function todoShow(req, res, next) {
  // get todo id from url params (`req.params`)
  var todoId = parseInt(req.params.id);

  // find todo to by its id
  var foundTodo = todos.filter(function (todo) {
    return todo._id == todoId;
  })[0];

  // send foundTodo as JSON response
  res.json(foundTodo);
}


function todoUpdate(req, res, next) {
  // get todo id from url params (`req.params`)
  var todoId = parseInt(req.params.id);

  // find todo to update by its id
  var todoToUpdate = todos.filter(function (todo) {
    return todo._id == todoId;
  })[0];

  // update the todo's task
  todoToUpdate.task = req.body.task;

  // update the todo's description
  todoToUpdate.description = req.body.description;

  // send back updated todo
  res.json(todoToUpdate);
}


function todoDestroy(req, res, next) {
  // get todo id from url params (`req.params`)
  var todoId = parseInt(req.params.id);

  // find todo to delete by its id
  var todoToDelete = todos.filter(function (todo) {
    return todo._id == todoId;
  })[0];

  // remove todo from `todos` array
  todos.splice(todos.indexOf(todoToDelete), 1);

  // send back deleted todo
  res.json(todoToDelete);
}


// add all our functions to the object we'll export
todoController.todoShow = todoShow;
todoController.todoCreate = todoCreate;
todoController.todoIndex = todoIndex;
todoController.todoDestroy = todoDestroy;
todoController.todoUpdate = todoUpdate;

module.exports = todoController;
