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
      if (input.id === "0001") {
        return {
          id: input.id,
          title: "蠟筆小新-第九季-037享受洗澡的樂趣喔",
          source: "Shane Cheung",
          uri: `${VIDEO_SERVER_URL}/0001.mp4`,
          ads: [
            { uri: `${VIDEO_SERVER_URL}/ad_0001.mp4`, insertAt: 20000 },
            {
              uri: `${VIDEO_SERVER_URL}/ad_0003.mp4`,
              insertAt: (4 * 60 + 21) * 1000,
            },
          ],
          thumbnail: "https://hackmd.io/_uploads/Byne59oS2.png",
          channelName: "蠟筆小新",
        };
      }

      if (input.id === "0002") {
        return {
          id: input.id,
          title: "理想混蛋 Bestards【我就想你 Miss You So...】",
          source: "理想混蛋 Bestards",
          uri: `${VIDEO_SERVER_URL}/0002.mp4`,
          ads: [
            {
              uri: `${VIDEO_SERVER_URL}/ad_0001.mp4`,
              insertAt: 12000,
            },
            {
              uri: `${VIDEO_SERVER_URL}/ad_0002.mp4`,
              insertAt: (3 * 60 + 43) * 1000,
            },
          ],
          thumbnail: "https://hackmd.io/_uploads/Byne59oS2.png",
          channelName: "理想混蛋 Bestards",
        };
      }

      if (input.id === "0003") {
        return {
          id: input.id,
          title: "電子菸和香菸哪個比較傷肺？",
          source: "GQ Taiwan",
          uri: `${VIDEO_SERVER_URL}/0003.mp4`,
          ads: [
            {
              uri: `${VIDEO_SERVER_URL}/ad_0002.mp4`,
              insertAt: (5 * 60 + 49) * 1000,
            },
            {
              uri: `${VIDEO_SERVER_URL}/ad_0003.mp4`,
              insertAt: (10 * 60 + 43) * 1000,
            },
          ],
          thumbnail: "https://hackmd.io/_uploads/Byne59oS2.png",
          channelName: "GQ Taiwan",
        };
      }

      throw new Error("Not found");
    }),
  all: publicProcedure.query(() => {
    return [
      {
        id: "0001",
        title: "蠟筆小新-第九季-037享受洗澡的樂趣喔",
        source: "Shane Cheung",
        uri: `${VIDEO_SERVER_URL}/0001.mp4`,
        ads: [
          { uri: `${VIDEO_SERVER_URL}/ad_0001.mp4`, insertAt: 20000 },
          {
            uri: `${VIDEO_SERVER_URL}/ad_0003.mp4`,
            insertAt: (4 * 60 + 21) * 1000,
          },
        ],
        thumbnail:
          "https://scontent.xx.fbcdn.net/v/t1.15752-9/351299662_632906972200469_6496396623464326563_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=aee45a&_nc_ohc=IAIqHwJQyawAX-SMOBE&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=03_AdQE6TcKX9Djr8EhDCrL1PHrvT4IbL3h1B28kWixlEfg0A&oe=64A14AF5",
        channelName: "蠟筆小新",
      },
      {
        id: "0002",
        title: "理想混蛋 Bestards【我就想你 Miss You So...】",
        source: "理想混蛋 Bestards",
        uri: `${VIDEO_SERVER_URL}/0002.mp4`,
        ads: [
          {
            uri: `${VIDEO_SERVER_URL}/ad_0001.mp4`,
            insertAt: 12000,
          },
          {
            uri: `${VIDEO_SERVER_URL}/ad_0002.mp4`,
            insertAt: (3 * 60 + 43) * 1000,
          },
        ],
        thumbnail:
          "https://scontent.xx.fbcdn.net/v/t1.15752-9/351449506_984322646081736_1571978434696553127_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=aee45a&_nc_ohc=UIWe2yaCTRkAX8aab4C&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=03_AdQ8U2TUgz7UCBRByxDNnQIApnehmkav8oUbRAgfNEBuSw&oe=64A16EC8",
        channelName: "理想混蛋 Bestards",
      },
      {
        id: "0003",
        title: "電子菸和香菸哪個比較傷肺？",
        source: "GQ Taiwan",
        uri: `${VIDEO_SERVER_URL}/0003.mp4`,
        ads: [
          {
            uri: `${VIDEO_SERVER_URL}/ad_0002.mp4`,
            insertAt: (5 * 60 + 49) * 1000,
          },
          {
            uri: `${VIDEO_SERVER_URL}/ad_0003.mp4`,
            insertAt: (10 * 60 + 43) * 1000,
          },
        ],
        thumbnail:
          "https://scontent.xx.fbcdn.net/v/t1.15752-9/351183902_1953811841635808_6084863315352703187_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=aee45a&_nc_ohc=jjj3ScVqJTsAX_5dVOl&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=03_AdQbpdoKDwQo5PTq8LDE_F6CKX1dzBUXgikC_aXUnwJkWg&oe=64A16AF1",
        channelName: "GQ Taiwan",
      },
    ];
  }),
});
