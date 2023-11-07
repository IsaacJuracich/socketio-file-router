import moment from "moment";
import { readdirSync, lstatSync } from "fs";
import { Server } from "socket.io";

type Route = {
  reqPath: string;
  path: string;
  handler: RequestHandler;
  method: string;
};

type Config = {
  ROUTES_DIR: string;
  debug: boolean;
};

export type RequestHandler = (
  socket: any,
  params: object,
  args: any[],
  next?: ({ err, nextParams }: { err?: any; nextParams?: object }) => void
) => void;

let dir_name: string;
const routes = new Map<string, Route>();

export default async function FileRouter(
  io: Server,
  config: Config,
  dirname: string
) {
  dir_name = dirname;

  const start = Date.now();

  await getRoutes(dirname + config.ROUTES_DIR + "/");

  if (config.debug) {
    console.log(
      "[FileRouter] Cached routes loaded in",
      moment(Date.now() - start).format("mm:ss.SSS") + " seconds"
    );
    console.log("[FileRouter] Routes", routes);
  }

  io.on("connection", (socket) => {
    socket.onAny(async (event, ...args) => {
      const eventName = event as string;
      const eventArgs = args as any[];

      try {
        const route = await getRoute(eventName);

        if (!route) return socket.emit("error", { message: "Route not found" });

        const {
          route: { handler },
          params,
        } = route;

        if (!handler)
          return socket.emit("error", { message: "Handler not found" });

        if (typeof handler === "object") {
          const handlerFixed = handler as RequestHandler[];

          for (let i = 0; i < handlerFixed.length; i++) {
            const handlerFunction = handlerFixed[i];

            if (i === handlerFixed.length - 1) {
              return handlerFunction(socket, params, eventArgs);
            }
            const middlewareFunction = handlerFunction;

            // @ts-ignore
            await middlewareFunction(
              socket,
              params,
              eventArgs,
              ({ err, nextParams }: { err?: any; nextParams?: object }) => {
                if (err) return socket.emit("error", err);

                if (nextParams) {
                  return Object.assign(params, {
                    ...params,
                    ...nextParams,
                  });
                }
              }
            );
          }
        }
        return handler(socket, params, eventArgs);
      } catch (err) {
        console.log("[File Router] Error", err);
      }
    });
  });
}

export async function getHandler(route: Route): Promise<{
  handler: (req: any, res: any, next: any) => void;
  method: string;
} | null> {
  try {
    const { path } = route;
    const handler = await import(path);

    const handlerFunction =
      handler.default || handler.get || handler.post || handler.handler;
    const method = Object.keys(handler)[0];

    return {
      handler: handlerFunction,
      method: method,
    };
  } catch (err) {
    console.log("[File Router] Error", err);
    return null;
  }
}

export async function getRoute(reqPath: string): Promise<{
  route: Route;
  params: any;
} | null> {
  const route = routes.get(reqPath);

  if (!route) {
    for (const [key, _] of routes) {
      const splitKey = key.split("/");
      const splitReqPath = reqPath.split("/");

      if (splitKey.length !== splitReqPath.length) {
        const lastSplitKey = splitKey[splitKey.length - 1];

        if (lastSplitKey === "[...slug]") {
          const route = await getRoute(
            splitKey.slice(0, splitKey.length - 1).join("/") + "/[...slug]"
          );

          if (!route) continue;

          return {
            route: route.route,
            params: {
              ...route.params,
              slug: splitReqPath.slice(splitKey.length - 1),
            },
          };
        }

        continue;
      }
      for (let i = 0; i < splitKey.length; i++) {
        const key = splitKey[i];
        const reqPath = splitReqPath[i];

        if (key.startsWith("[") && key.endsWith("]")) {
          const keyName = key.replace("[", "").replace("]", "");
          const keyVal = reqPath;

          const route = await getRoute(
            splitKey.slice(0, i).join("/") + "/" + key
          );

          if (!route) continue;

          return {
            route: route.route,
            params: {
              ...route.params,
              [keyName]: keyVal,
            },
          };
        }
      }
    }

    return null;
  }

  return {
    route,
    params: {},
  };
}

export async function getRoutes(path: string) {
  const files = readdirSync(path);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isFolder = lstatSync(path + file).isDirectory();

    if (file.endsWith(".js") || file.endsWith(".ts")) {
      const regex = new RegExp(
        `^${dir_name}/routes|(\\.ts|\\.js|/index)?`,
        "g"
      );
      const reqPath = (path + file).replace(regex, "");

      const route = {
        reqPath,
        path: path + file,
      } as Route;

      const handlerInformation = await getHandler(route);
      if (!handlerInformation) continue;

      const { handler, method } = handlerInformation;
      routes.set(reqPath, {
        ...route,
        handler,
        method,
      });
    }

    if (isFolder) await getRoutes(path + file + "/");
  }
}
