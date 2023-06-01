import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const VIDEO_SERVER_URL = "http://140.113.123.22:8080/video";

export const videoRouter = createTRPCRouter({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ input }) => {
      console.log("videoRouter:byId:query", input);
      return {
        id: input.id,
        title: "蠟筆小新-第九季-037享受洗澡的樂趣喔",
        source: "Shane Cheung",
        uri: `${VIDEO_SERVER_URL}/0001.mp4`,
        ads: [{ uri: `${VIDEO_SERVER_URL}/ad_0001.mp4`, insertAt: 5000 }],
      };
    }),
});
