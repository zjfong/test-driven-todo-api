var request = require('request'),
    expect = require('chai').expect,
    base_url = 'http://localhost:3000';

describe('Todos API', function() {

  describe('GET /api/todos (index)', function(){
    it('should respond with status 200', function (done) {
      request(base_url + '/api/todos', function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should respond with a JSON object', function (done) {
      request(base_url + '/api/todos', function (error, response, body) {
        expect(function(){ JSON.parse(body); }).to.not.throw(SyntaxError);
        var data = JSON.parse(body);
        expect(data).to.be.an("object");
        done();
      });
    });

    it('should respond with a JSON object containing a list of todos', function (done) {
      request(base_url + '/api/todos', function (error, response, body) {
        expect(function(){ JSON.parse(body); }).to.not.throw(SyntaxError);
        var data = JSON.parse(body);
        expect(data).to.have.property("todos");
        expect(data.todos).to.be.an("array");
        var first_todo = data.todos[0]
        expect(first_todo).to.have.property("task");
        expect(first_todo).to.have.property("description");
        expect(first_todo).to.have.property("_id");
        done();
      });
    });

    it('todo objects should have properities: _id, description, task', function (done) {
      request(base_url + '/api/todos', function (error, response, body) {
        expect(function(){ JSON.parse(body); }).to.not.throw(SyntaxError);
        var data = JSON.parse(body);
        var first_todo = data.todos[0]
        expect(first_todo).to.have.property("task");
        expect(first_todo).to.have.property("description");
        expect(first_todo).to.have.property("_id");
        done();
      });
    });
  });


  describe('GET /api/todos/:id (show)', function(){

    var res, data, all_todos, last_todo;

    before(function(done){
      request(base_url + '/api/todos', function (error, response, body) {
        all_todos = JSON.parse(body).todos;
        last_todo = all_todos[all_todos.length - 1];
        request(base_url + '/api/todos/' + last_todo._id, function (error, response, body) {
          res = response;
          try {
            data = JSON.parse(response.body);
          } finally {}
          done();
        });
      });
    });

    it('should respond with status 200 - Success', function (done) {
      expect(res.statusCode).to.equal(200);
      done();
    });

    it('should respond with JSON', function (done) {
      expect(data).to.be.an("object");
      done();
    });

    it('should fetch one specific todo by _id', function (done) {
      expect(data).to.have.property("task");
      expect(data.task).to.equal(last_todo.task);

      expect(data).to.have.property("description");
      expect(data.description).to.equal(last_todo.description);

      expect(data).to.have.property("_id");
      expect(data._id).to.equal(last_todo._id);

      done();
    });
  });

  describe('POST /api/todos (create)', function(){

    var res, data;
    var new_todo = {
        task: 'Walk Dog',
        description: 'Take Fluffy for a walk'
    };

    before(function(done){
      request.post(
        {
          url: base_url + '/api/todos',
          form: new_todo
        },
        function(error, response, body) {
          res = response;
          try {
            data = JSON.parse(response.body);
          } finally {}
          done();
        }
      )
    })


    it('should respond with status 200 - Success', function (done) {
      expect(res.statusCode).to.equal(200);
      done();
    });

    it('should respond with JSON', function (done) {
      expect(data).to.be.an("object");
      done();
    });

    it('should respond with the new todo object', function (done) {
      expect(data).to.have.property("task");
      expect(data.task).to.equal(new_todo.task);

      expect(data).to.have.property("description");
      expect(data.description).to.equal(new_todo.description);
      done();
    });

    it('should assign an _id to the new todo object', function (done) {
      expect(data).to.have.property("_id");
      done();
    });

    it('should increment the _id number by one each time a todo is created', function (done) {
      var previous_id = data._id;
      expect(previous_id).to.be.a("number");
      request.post(
        {
          url: base_url + '/api/todos',
          form: new_todo // we're creating the same todo again, but the _id should be different this time!
        },
        function(error, response, body) {
          res = response;
          try {
            data = JSON.parse(response.body);
          } finally {}
          expect(data).to.have.property("_id");
          expect(data._id).to.equal(previous_id + 1);
          done();
        }
      );
    });

  });

  describe('DELETE /api/todos/:id (destroy)', function(){

    var res, data, old_todos, last_todo;

    before(function(done){
      request(base_url + '/api/todos', function (error, response, body) {
        old_todos = JSON.parse(body).todos;
        last_todo = old_todos[old_todos.length - 1];
        request.del(base_url + '/api/todos/' + last_todo._id, function (error, response, body) {
          res = response;
          try {
            data = JSON.parse(response.body);
          } finally {}
          done();
        });
      });
    });

    it('should respond with 200 or 204 on success', function (done) {
      expect([200,204]).to.include(res.statusCode);
      done();
    });

    it('should delete one specific todo from the list of todos', function (done) {
      request(base_url + '/api/todos', function(error, get_response, body){
        var current_todos = JSON.parse(body).todos;
        expect(current_todos).to.have.length(old_todos.length - 1);

        var todoWasDeleted = !current_todos.some(function (todo) {
          return todo._id === last_todo._id;
        });

        expect(todoWasDeleted).to.be.true;
        done();
      })
    });
  });


  describe('PUT /api/todos/:id (update)', function(){

    var res, data, original_todo;
    var updated_todo = {
      task: 'Walk Dog',
      description: 'Take Spot for a walk'
    };

    before(function(done){
      request(base_url + '/api/todos', function (error, response, body) {
        var _data = JSON.parse(response.body);
        var all_todos = _data.todos;
        original_todo = all_todos[all_todos.length - 1];

        request.put(
          {
            url: base_url + '/api/todos/' + original_todo._id,
            form: updated_todo
          },
          function (error, response, body) {
            res = response;
            try {
              data = JSON.parse(response.body);
            } finally {}
            done();
          }
        );
      });
    });

    it('should respond with status 200 - Success', function (done) {
      expect(res.statusCode).to.equal(200);
      done();
    });

    it('should respond with JSON', function (done) {
      expect(data).to.be.an("object");
      done();
    });

    it('should update the properities of one specific todo', function (done) {
      expect(data).to.have.property("task");
      expect(data.task).to.equal(updated_todo.task);

      expect(data).to.have.property("description");
      expect(data.description).to.equal(updated_todo.description);

      expect(data).to.have.property("_id");
      expect(data._id).to.equal(original_todo._id);
      done();
    });
  });


  describe('GET /api/todos/search (search)', function(){
    before(function(done){
      request.post(
        {
          url: base_url + '/api/todos',
          form: {
            task: 'surf',
            description: 'dude...'
          }
        },
        done
      );
    });

    it('should list all todos that contain the search term in their title', function(done){
      request(base_url + '/api/todos/search?q=surf', function(error, response, body){
        expect(function(){ JSON.parse(body); }).to.not.throw(SyntaxError);

        var all_todos = JSON.parse(body).todos;
        expect(all_todos).to.be.an("array");

        var last_todo = all_todos[all_todos.length - 1];
        expect(last_todo.task).to.equal("surf");

        done();
      })
    });
  });
});
