import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { videoRouter } from "./router/video";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  video: videoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
