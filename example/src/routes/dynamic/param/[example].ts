import { RequestHandler } from "socketio-file-router";

export const post: RequestHandler = async (socket, params, args) => {
  const { example } = params as { example: string };

  console.log("example param", example);
  console.log("example post", args);
};
