# **socketio-file-router**

# **Installation**

```
npm install socketio-file-router
```

# **How to Use**

You can integrate the file router by using it as a middleware like this:

```js
await FileRouter(
  io, // socket server
  {
    ROUTES_DIR: "/routes",
    debug: false,
  },
  __dirname
);
```

[Example Setup](https://github.com/IsaacJuracich/socketio-file-router/tree/main/example)

```js
import { createServer } from "http";
import { Server } from "socket.io";
import FileRouter from "socketio-file-router";

async function init(): Promise<void> {
  process.on("uncaughtException", (err) => {
    console.log(err);
  });

  const port = 3080;
  const server = createServer();

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  await FileRouter(
    io,
    {
      ROUTES_DIR: "/routes",
      debug: false,
    },
    __dirname
  );

  server.listen(port, () => console.log(`Server listening on port ${port}`));
}
init();
```

# **Route Setup**

## **Example Structure**

[Structure Setup](https://github.com/IsaacJuracich/socketio-file-router/tree/main/example/src/routes)

```php
├── index.ts // main file
├── routes
    ├── get.ts // get
    ├── dynamic // params
        ├── param
            ├── [example].ts // single
            └── [...slug].ts // get all
    └── user
        ├── index.ts // user
    └── post.ts
```

## **Middleware**

You are able to add route specific middlewares by exporting an array like this:
**Example**

```js
import { RequestHandler } from "socketio-file-router";

export const handler = [
  async (socket, params, args, next) => {
    if (!next) return;

    return next({
      nextParams: {
        userID: "123",
      },
    });
  },
  async (socket, params, args) => {
    console.log("middleware post", params, args);
  },
] as RequestHandler[];
```
