# Intro
CRUD with Sqlite3 practice code-academy

# dúvidas:

## dúvida 1:
Existe, por exemplo uma tabela de artistas:
- id int primary key
- name text
- etc...

nas rotas de CRUD com sqlite3, vou receber o id como param. p. ex.: /api/artist/:id.

o exercício está usando o sqlite3 como database e sugere criar um middleware para extrair o param do request:

esse é a assinatura middleware:
```javascript
artistRouter.param('artistId', (req, res, next, param) => {
  // request handling
})
```

o ```db``` é isso aqui:

```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../database.sqlite');
```

escrevi isso aqui:

```javascript
  artistsRouter.param('artistId', (req, res, next, param) => {
  db.get(`SELECT id FROM Artist WHERE id = ${param}`, (err, row) => {
    if(err) next();
    req.artistId = row.id;
  })
})
```

O gabarito sugere diferente:
```javascript
  artistsRouter.param('artistId', (req, res, next, param) => {
  db.get(`SELECT id FROM Artist.id WHERE id = $artistId`,
  {$artistId: param},
  (err, row) => {
    if(err) next();
    req.artistId = row.id;
  })
})
```

A minha dúvida é: Quais as diferenças de uma forma ou de outra? Tem alguma diferença? Eu aposto que não. Essa lib para usar sqlite3 com node parece um pouco antiga e parece oferecer uma alternativa anterior ao ES6 para facilitar interpolação de string. Essa é a minha aposta.