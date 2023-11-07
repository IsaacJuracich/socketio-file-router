import { RequestHandler } from "../../../../../dist/cjs/index";

export const post: RequestHandler = async (socket, params, args) => {
  const { slug } = params as { slug: string };

  console.log("slug param", slug);
  console.log("example post", args);
};
