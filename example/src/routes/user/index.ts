import { RequestHandler } from "socketio-file-router";

export const post = [
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
