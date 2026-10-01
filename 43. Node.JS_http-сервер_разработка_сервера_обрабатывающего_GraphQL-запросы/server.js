// server.js
const http = require('http');
const { graphql, buildSchema } = require('graphql');

const PORT = 3000;

// Определяем схему — типы и операции
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    age: Int!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, age: Int!): User
    deleteUser(id: ID!): String
  }
`);

// База данных в памяти
let users = [
  { id: '1', name: 'Vadim', age: 21 },
  { id: '2', name: 'Ivan', age: 25 },
];
let nextId = 3;

// Резолверы — логика для каждой операции
const root = {
  users: () => users,
  user: ({ id }) => users.find(u => u.id === id),
  createUser: ({ name, age }) => {
    const user = { id: String(nextId++), name, age };
    users.push(user);
    return user;
  },
  deleteUser: ({ id }) => {
    const exists = users.find(u => u.id === id);
    if (!exists) return `User ${id} not found`;
    users = users.filter(u => u.id !== id);
    return `User ${id} deleted`;
  },
};

// Читаем тело запроса
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => { resolve(data ? JSON.parse(data) : {}); });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // GraphQL работает через POST /graphql
  if (req.method === 'POST' && req.url === '/graphql') {
    const body = await readBody(req);
    const { query, variables } = body;

    // Выполняем GraphQL запрос
    const result = await graphql({ schema, source: query, rootValue: root, variableValues: variables });
    res.writeHead(200);
    res.end(JSON.stringify(result));

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Send POST to /graphql' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/graphql`);
});

// --- ТЕСТИРОВАНИЕ ---
//
// Postman: POST http://localhost:3000/graphql
// Body -> raw -> JSON
//
// Получить всех:
// {"query":"{ users { id name age } }"}
//
// Получить одного:
// {"query":"{ user(id: \"1\") { id name age } }"}
//
// Создать:
// {"query":"mutation { createUser(name: \"Petro\", age: 30) { id name age } }"}
//
// Удалить:
// {"query":"mutation { deleteUser(id: \"1\") }"}
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/graphql',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'{ users { id name age } }'})}).then(r=>r.json()).then(console.log)