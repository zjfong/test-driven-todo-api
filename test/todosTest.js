var request = require('request'),
    expect = require('chai').expect,
    Q = require('q'),
    base_url = 'http://localhost:3000';

TIMEOUT = 200;

var fetcher = (function(request, q) {
  // This module mostly just ensures the server response is JSON,
  // and allows for method/promise chaining in the tests

  return {
    get:  function(action      ){ return fetch("get",   {url: action})             },
    del:  function(action      ){ return fetch("del",   {url: action})             },
    post: function(action, data){ return fetch("post",  {url: action, form: data}) },
    put:  function(action, data){ return fetch("put",   {url: action, form: data}) }
  };

  ////

  function fetch(method, options){
    var deferred = Q.defer();

    setTimeout(function(){
      // Intended to be more intelligible to students than mocha's stock error of
      //    "Error: timeout of 2000ms exceeded. /
      //     Ensure the done() callback is being called in this test."
      deferred.reject(new Error("No Response From Server"))
    }, TIMEOUT);

    request[method](options, function(error, response){
      if(error){
        return deferred.reject(new Error(error));
      }

      try {
        response.json = JSON.parse(response.body);
        deferred.resolve(response);
      } catch (e) {
        deferred.reject(new Error("Response body is the " + typeof(response.body) + " (" + response.body.toString() + ") and not valid JSON"))
      }
    });


    return deferred.promise;
  }

}(request, Q))



// Utility function
function fetchAll(){
  var deferred = Q.defer();

  fetcher
    .get(base_url + '/api/todos')
    .then(function(response){
      var all_todos = response.json.todos;
      var last_todo = all_todos[all_todos.length - 1];
      deferred.resolve({
        all: all_todos,
        last: last_todo
      });
    })
    .fail(
      deferred.reject
    )

  return deferred.promise;
}


/*
  BEGIN TEST SUITE
  note: in order to ensure that records are being persisted/deleted correctly
        on the server, each test uses a before action to hit the `index` route
        first, and then compares those results to the test results.
*/

describe('Todos API', function() {
  // this.timeout(TIMEOUT); // Overriden by timeout error raised in fetcher module

  describe('GET /api/todos (index)', function(){
    it('should respond with status 200', function (done) {
      fetcher
        .get(base_url + '/api/todos')
        .then(function(response){
          expect(response.statusCode).to.equal(200);
          done();
        })
        .fail(done);
    });

    it('should respond with a JSON object', function (done) {
      fetcher
        .get(base_url + '/api/todos')
        .then(function(response) {
          expect(response.json).to.be.an("object");
          done();
        })
        .fail(done);
    });

    it('should respond with a JSON object containing a list of todos', function (done) {
      fetcher
        .get(base_url + '/api/todos')
        .then(function (response) {
          expect(response.json)
            .to.have.property("todos")
            .and.be.an("array")
              .and.have.property(0)
              .and.have.all.keys(["task", "description", "_id"]);

          done();
        })
        .fail(done);
    });

    it('todo objects should have properities: _id, description, task', function (done) {
      fetcher
        .get(base_url + '/api/todos')
        .then(function (response) {
          var first_todo = response.json.todos[0]

          expect(first_todo)
            .to.have.property("task")
            .and.to.be.a("string");

          expect(first_todo)
            .to.have.property("description")
            .and.to.be.a("string");

          expect(first_todo)
            .to.have.property("_id")
            .and.to.be.a("number");

          done();
        })
        .fail(done);
    });
  });


  describe('GET /api/todos/:id (show)', function(){

    var actual_response = {};
    var db = {};

    before(function(done){
      fetchAll()
        .then(function(todo){
          fetcher
            .get(base_url + '/api/todos/' + todo.last._id)
            .then(function (response) {
                actual_response.statusCode = response.statusCode;
                actual_response.json = response.json;
                db = todo;
                done();
              })
            .fail(done);
        })
        .fail(done);
    });

    it('should respond with status 200 - Success', function (done) {
      expect(actual_response.statusCode).to.equal(200);
      done();
    });

    it('should respond with JSON', function (done) {
      expect(actual_response.json).to.be.an("object");
      done();
    });

    it('should fetch one specific todo by _id', function (done) {
      expect(actual_response.json)
        .to.have.property("task")
        .and.equal(db.last.task);

      expect(actual_response.json)
        .to.have.property("description")
        .and.equal(db.last.description);

      expect(actual_response.json)
        .to.have.property("_id")
        .and.equal(db.last._id);

      done();
    });
  });

  describe('POST /api/todos (create)', function(){

    var actual_response = {};
    var db = {};
    var new_todo = {
      task: 'Create random task name #' + Math.random(),
      description: 'Pick a random number, e.g. ' + Math.random()
    };

    before(function(done){
      fetcher
        .post(base_url + '/api/todos', new_todo)
        .then(function(response) {
            actual_response.statusCode = response.statusCode;
            actual_response.json = response.json;
            done();
        })
        .fail(done);
    })


    it('should respond with status 200 - Success', function (done) {
      expect(actual_response.statusCode).to.equal(200);
      done();
    });

    it('should respond with JSON', function (done) {
      expect(actual_response.json).to.be.an("object");
      done();
    });

    it('should respond with the new todo object', function (done) {
      expect(actual_response.json)
        .to.have.property("task")
        .and.equal(new_todo.task);

      expect(actual_response.json)
        .to.have.property("description")
        .and.to.equal(new_todo.description);

      done();
    });

    it('should assign an _id to the new todo object', function (done) {
      expect(actual_response.json).to.have.property("_id");
      done();
    });

    it('should increment the _id number by one each time a todo is created', function (done) {
      var previous_id = actual_response.json._id;
      expect(previous_id).to.be.a("number");

      // we're creating the same todo again, but the _id should be different this time!
      fetcher
        .post(base_url + '/api/todos', new_todo)
        .then(
          function(response) {
            expect(response.json)
              .to.have.property("_id")
              .and.to.be.above(previous_id);
            done();
          }
        )
        .fail(done)
    });

  });

  describe('DELETE /api/todos/:id (destroy)', function(){

    var actual_response = {}
    var db = {};

    before(function(done){
      fetchAll()
        .then(function(todo){
          fetcher
            .del(base_url + '/api/todos/' + todo.last._id)
            .then(function(response) {
              actual_response.statusCode = response.statusCode;
              actual_response.json = response.json;
              db = todo;
              done();
            })
            .fail(done)
        })
        .fail(done)
    });

    it('should respond with 200 or 204 on success', function(done) {
      expect([200,204]).to.include(actual_response.statusCode);
      done();
    });

    it('should delete one specific todo from the list of todos', function (done) {
      fetcher
        .get(base_url + '/api/todos')
        .then(function(response){
          var current_todos = response.json.todos;
          expect(current_todos).to.have.length(db.all.length - 1);

          var todoWasDeleted = !current_todos.some(function (todo) {
            return todo._id === db.last._id;
          });

          expect(todoWasDeleted).to.be.true;
          done();
        })
      .fail(done)
    });
  });


  describe('PUT /api/todos/:id (update)', function(){

    var actual_response = {};
    var db = {};
    var updated_todo = {
      task: 'Return order #' + Math.random(),
      description: 'Shipping label #' + Math.random()
    };

    before(function(done){
      fetchAll()
        .then(function(todo){
          fetcher
            .put(base_url + '/api/todos/' + todo.last._id, updated_todo)
            .then(function (response) {
              actual_response.statusCode = response.statusCode;
              actual_response.json = response.json;
              db.original_todo = todo.last;
              done();
            })
            .fail(done);

        })
        .fail(done);
    });

    it('should respond with status 200 - Success', function (done) {
      expect(actual_response.statusCode).to.equal(200);
      done();
    });

    it('should respond with JSON', function (done) {
      expect(actual_response.json).to.be.an("object");
      done();
    });

    it('should update the properities of one specific todo', function (done) {
      expect(actual_response.json)
        .to.have.property("task")
        .and.to.equal(updated_todo.task);

      expect(actual_response.json)
        .to.have.property("description")
        .and.equal(updated_todo.description);

      expect(actual_response.json)
        .to.have.property("_id")
        .and.equal(db.original_todo._id);

      done();
    });
  });


  describe('GET /api/todos/search (search)', function(){

    var actual_response = {};
    var db = {};
    var new_todo = {
      task: 'surf ' + Math.random(),
      description: 'dude... ' + Math.random()
    };

    before(function(done){
      fetcher
        .post(base_url + '/api/todos', new_todo)
        .then(function(){
          done()
        })
        .fail(done)
    });

    it('should list all todos that contain the search term in their title', function(done){
      fetcher
        .get(base_url + '/api/todos/search?q=surf')
        .then(function(response){

          expect(response.json).to.have.property("todos");

          var all_todos = response.json.todos;
          expect(all_todos).to.be.an("array");

          var last_todo = all_todos[all_todos.length - 1];
          expect(last_todo.task).to.equal(new_todo.task);
          done();
        })
        .fail(done);
    });
  });
});
