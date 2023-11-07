import { RequestHandler } from "socketio-file-router";

export const post: RequestHandler = async (socket, params, args) => {
  const { slug } = params as { slug: string };

  console.log("slug param", slug);
  console.log("example post", args);
};
