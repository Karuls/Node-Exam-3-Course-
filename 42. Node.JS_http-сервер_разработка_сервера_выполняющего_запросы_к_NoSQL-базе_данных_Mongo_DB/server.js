// server.js
const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = 3000;
const MONGO_URI = 'mongodb://Vadim:1235@ac-4ndnh5t-shard-00-00.ijlb3gw.mongodb.net:27017,ac-4ndnh5t-shard-00-01.ijlb3gw.mongodb.net:27017,ac-4ndnh5t-shard-00-02.ijlb3gw.mongodb.net:27017/testdb?ssl=true&replicaSet=atlas-5ui3zb-shard-0&authSource=admin&appName=Cluster0';
const DB_NAME = 'testdb';
const COLLECTION = 'users';

let collection;

MongoClient.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 }).then((client) => {
  const db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);
  console.log('Connected to MongoDB Atlas');

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => { resolve(data ? JSON.parse(data) : {}); });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean);

  res.setHeader('Content-Type', 'application/json');

  try {

    // GET /users — все пользователи
    if (req.method === 'GET' && parts[0] === 'users' && !parts[1]) {
      const users = await collection.find({}).toArray();
      res.writeHead(200);
      res.end(JSON.stringify(users));

    // GET /users/:id — один пользователь
    } else if (req.method === 'GET' && parts[0] === 'users' && parts[1]) {
      const user = await collection.findOne({ _id: new ObjectId(parts[1]) });
      if (!user) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
      res.writeHead(200);
      res.end(JSON.stringify(user));

    // POST /users — создать
    } else if (req.method === 'POST' && parts[0] === 'users') {
      const body = await readBody(req);
      const result = await collection.insertOne(body);
      res.writeHead(201);
      res.end(JSON.stringify({ insertedId: result.insertedId }));

    // PUT /users/:id — обновить
    } else if (req.method === 'PUT' && parts[0] === 'users' && parts[1]) {
      const body = await readBody(req);
      const result = await collection.updateOne(
        { _id: new ObjectId(parts[1]) },
        { $set: body }
      );
      res.writeHead(200);
      res.end(JSON.stringify({ modifiedCount: result.modifiedCount }));

    // DELETE /users/:id — удалить
    } else if (req.method === 'DELETE' && parts[0] === 'users' && parts[1]) {
      const result = await collection.deleteOne({ _id: new ObjectId(parts[1]) });
      res.writeHead(200);
      res.end(JSON.stringify({ deletedCount: result.deletedCount }));

    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Route not found' }));
    }

  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

// --- ТЕСТИРОВАНИЕ ---
//
// Postman:
//   POST   http://localhost:3000/users        Body -> raw JSON: {"name":"Vadim","age":21}
//   GET    http://localhost:3000/users         -> список всех
//   GET    http://localhost:3000/users/<_id>   -> один пользователь
//   PUT    http://localhost:3000/users/<_id>   Body -> raw JSON: {"age":22}
//   DELETE http://localhost:3000/users/<_id>   -> удалить
