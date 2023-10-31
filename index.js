var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var path = require('path');
const cors = require('cors');


var db = new sqlite3.Database('./db.sqlite');

var app = express();
app.use(cors());
app.use(express.json());  // parse JSON body

db.run('CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, author TEXT, created_at TEXT)');

// Index Route
app.get('/', function(_, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// Show all posts
app.get('/posts', function(_, res) {
  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) {
      console.log("Error: ", err.message);
      res.status(500).json({ "error": err.message });
      return;
    }
    if (!rows.length) {
      res.status(404).json({ "error": "No posts found" });
      return;
    }
    console.log('Posts retrieved successfully.');
    res.json(rows);
  });
});


// Show a post
app.get('/posts/:id', function(req, res) {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], function(err, row) {
    if (err) {
      console.log("Error: ", err.message);
      res.status(500).json({ "error": err.message });
      return;
    }
    if (!row) {
      res.status(404).json({"error": "Post not found"});
      return;
    }
    console.log(`Post ${req.params.id} retrieved successfully.`);
    res.json(row);
  });
});

// Create a post
app.post('/posts', function(req, res) {
  var data = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    created_at: new Date().toISOString()
  };
  db.run('INSERT INTO posts (title, content, author, created_at) VALUES (?, ?, ?, ?)', [data.title, data.content, data.author, data.created_at], function(err) {
    if (err) {
      console.log("Error: ", err.message);
      res.status(500).json({ "error": err.message });
      return;
    }
    data.id = this.lastID; // assign the last inserted id to data object
    console.log(`Post created successfully with id ${data.id}`);
    res.json({ "status": "success", "data": data, "message": "Post created successfully" });
  });
});

// Update a post
app.put('/posts/:id', function(req, res) {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], function(err, row) {
    if (err) {
      console.log("Error: ", err.message);
      res.status(500).json({ "error": err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ "error": "Post not found" });
      return;
    }
    var data = {
      id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    };
    db.run('UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?', [data.title, data.content, data.author, data.id], function(err) {
      if (err) {
        console.log("Error: ", err.message);
        res.status(500).json({ "error": err.message });
        return;
      }
      console.log(`Post ${data.id} updated successfully.`);
      res.json({ "status": "success", "data": data, "message": "Post updated" });
    });
  });
});

// Delete a post
app.delete('/posts/:id', function(req, res) {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], function(err, row) {
    if (err) {
      console.log("Error: ", err.message);
      res.status(500).json({ "error": err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ "error": "Post not found" });
      return;
    }
    db.run('DELETE FROM posts WHERE id = ?', req.params.id, function(err) {
      if (err) {
        console.log("Error: ", err.message);
        res.status(500).json({ "error": err.message });
        return;
      }
      console.log(`Post ${req.params.id} deleted successfully.`);
      res.json({ "status": "success", "message": "Post deleted" });
    });
  });
});

app.listen(3000, function() {
  console.log('App is listening on port 3000');
});
