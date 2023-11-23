# CMSmall

## Open routes
### `/api/home`
Front-office view (authenticated or not users)

>A list of all published pages in chronological order (by publication >date), and can read the full content of each page (and its properties)

```http
GET http://localhost:3000/api/home
```

### `/api/login`
Performs login:
- admin
- content creator
```http
POST http://localhost:3000/api/login
Content-Type: application/json

{
    "username":"password"
}
```

### `/api/pages/:pageId`
Get the content of the specified page (f.i. when user clicks on it)

```http
GET http://localhost:3000/api/pages/2
```

## Restricted to authenticated users routes
### `/api/logout`
Performs logout:
- admin
- content creator
```http
POST http://localhost:3000/api/logout
```

### `/api/create`
> id is taken from req.user.id
Creates a new page:
- at least 1 header
- at least 1 between paragraph or block

```http
POST http://localhost:3000/api/user1/create
Content-type: application/json

{
    "title":"prova"
}
```

### `/api/:pageId/edit`
> id is taken from req.user.id or req.user.id
```http
PUT http://localhost:3000/api/4/edit
Content-type: application/json

{
    "title":"this is the editing title"
}
```

### `/api/:pageId/delete`
> id is taken from req.user.id or req.user.id

```http
DELETE http://localhost:3000/api/4/delete
```