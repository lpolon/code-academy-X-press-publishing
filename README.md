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
  db.get(`SELECT * FROM Artist WHERE id = ${param}`, (err, row) => {
    if(err) next();
    req.artistId = row.id;
  })
})
```

O gabarito sugere diferente:
```javascript
  artistsRouter.param('artistId', (req, res, next, param) => {
  db.get(`SELECT * FROM Artist.id WHERE id = $artistId`,
  {$artistId: param},
  (err, row) => {
    if(err) next();
    req.artistId = row.id;
  })
})
```

A minha dúvida é: Quais as diferenças de uma forma ou de outra? Tem alguma diferença? Eu aposto que não. Essa lib para usar sqlite3 com node parece um pouco antiga e parece oferecer uma alternativa anterior ao ES6 para facilitar interpolação de string. Essa é a minha aposta.

## dúvida 2:
isso gera um erro nos testes:
```javascript
artistsRouter.param('artistId', (req, res, next, param) => {
  db.get(`SELECT * FROM Artist WHERE id = ${param}`, (err, row) => {
    if (err) {
      next(err);
    }
    if (!row) {
      res.sendStatus(404);
    }
    req.artist = row;
    next();
  });
});
```

isso, não:
```javascript
artistsRouter.param('artistId', (req, res, next, param) => {
  db.get(`SELECT * FROM Artist WHERE id = ${param}`, (err, row) => {
    if (err) {
      next(err);
    } else if (!row) {
      res.sendStatus(404);
    } else {
      req.artist = row;
      next();
    }
  });
});
```
``Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client``

Por quê?



https://stackoverflow.com/questions/7042340/error-cant-set-headers-after-they-are-sent-to-the-client


estava alterando a response e chamando next(), porque esqueci do return.

Isso, funciona:

```javascript
artistsRouter.param('artistId', (req, res, next, param) => {
  db.get(`SELECT * FROM Artist WHERE id = ${param}`, (err, row) => {
    if (err) return next(err);
    if (!row) return res.sendStatus(404);
    req.artist = row;
    next();
  });
});
```

## dúvida 3:

Por que isso não funciona?

```javascript
artistsRouter.post('/', (req, res, next) => {
  const {artist: {name, dateOfBirth, biography}} = req.body
  
  if (!name || !dateOfBirth || !biography) {
    return res.sendStatus(400);
  }
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  db.run(
    `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES (${name}, ${dateOfBirth}, ${biography}, ${isCurrentlyEmployed})`,
    // {
    //   $name: name,
    //   $dateOfBirth: dateOfBirth,
    //   $biography: biography,
    //   $isCurrentlyEmployed: isCurrentlyEmployed,
    // },
    function(err) {
      db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, row) => {
        if (err) return next(err)
        res.status(201).json({ artist: row });
      });
    }
  );
});
```