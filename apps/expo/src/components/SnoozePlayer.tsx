import React, { useRef, useState, type RefObject } from "react";
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ResizeMode,
  Video,
  VideoFullscreenUpdate,
  type AVPlaybackStatus,
  type VideoFullscreenUpdateEvent,
} from "expo-av";
import { Link, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";

import { api, type RouterOutputs } from "~/utils/api";
import {
  loadVideo,
  useIOSAudio,
  useUnlockScreenOrientation,
} from "~/utils/video";
import { ADS_COUNTDOWN_TIME, AdsCountdown } from "./AdsCountdown";
import { SnoozePanel } from "./SnoozePanel";

export type Ads = RouterOutputs["video"]["byId"]["ads"];

type SnoozePlayerProps = {
  videoId: string;
};

export const SnoozePlayer = ({ videoId }: SnoozePlayerProps) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [adsInfo, setAdsInfo] = useState<Ads>([]);
  const [isVideo, setIsVideo] = useState(true);
  const [videoPosition, setVideoPosition] = useState(0);
  const {
    showSnoozeCountdown,
    setShowSnoozeCountdown,
    showSnoozePanel,
    setShowSnoozePanel,
    handleSnoozeCancel,
    handleSnoozeConfirm,
    handleSnoozePressed,
    snoozeCountdown,
  } = useSnooze(videoRef);
  const router = useRouter();

  const videoQuery = api.video.byId.useQuery(
    { id: videoId },
    {
      onSuccess: (data) => {
        setAdsInfo(data.ads);
        void loadVideo(videoRef.current, data.uri);
      },
    },
  );

  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    setStatus(status);
    if (!status.isLoaded) return;

    // when an ad finishes, load the video
    if (!isVideo && status.didJustFinish) {
      await loadVideo(videoRef.current, videoQuery.data?.uri ?? "", {
        positionMillis: videoPosition,
      });
      setIsVideo(true);
      return;
    }

    // when the video is playing and there's an ad, pause the video
    const firstAd = adsInfo[0];
    if (isVideo && firstAd && status.positionMillis >= firstAd.insertAt) {
      setIsVideo(false);
      setVideoPosition(status.positionMillis);
      await loadVideo(videoRef.current, firstAd.uri);
      setAdsInfo(adsInfo.slice(1));
      setShowSnoozeCountdown(false);
      setShowSnoozePanel(false);
      return;
    }

    if (
      isVideo &&
      firstAd &&
      firstAd.insertAt - status.positionMillis <= ADS_COUNTDOWN_TIME
    ) {
      setShowSnoozeCountdown(true);
    }
  };

  const handleFullscreenUpdate = async ({
    fullscreenUpdate,
  }: VideoFullscreenUpdateEvent) => {
    if (Platform.OS !== "android") return;

    switch (fullscreenUpdate) {
      case VideoFullscreenUpdate.PLAYER_DID_PRESENT:
        await ScreenOrientation.unlockAsync(); // only on Android required
        break;
      case VideoFullscreenUpdate.PLAYER_WILL_DISMISS:
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT,
        ); // only on Android required
        break;
    }
  };

  useUnlockScreenOrientation();

  const isPlaying = status?.isLoaded && status.isPlaying;
  useIOSAudio(videoRef, isPlaying);

  const { width, height } = Dimensions.get("window");
  const isInLandscape = width > height;

  const snoozeCountdownTime = snoozeCountdown({
    positionMillis: status?.isLoaded ? status.positionMillis : undefined,
    firstAd: adsInfo[0],
  });

  if (videoQuery.isLoading)
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
        <Link href="/playlist">Back to Playlist</Link>
      </SafeAreaView>
    );

  if (videoQuery.isError)
    return (
      <SafeAreaView>
        <Text>Something went wrong</Text>
        <Link href="/playlist">Back to Playlist</Link>
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="landscape:bg-black">
      <View className="w-full">
        <View className="relative items-center justify-center">
          <Video
            ref={videoRef}
            useNativeControls={isVideo}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={(status) =>
              void handlePlaybackStatusUpdate(status)
            }
            onFullscreenUpdate={(e) => void handleFullscreenUpdate(e)}
            className="aspect-video w-full"
            style={isInLandscape ? { height: Math.floor(height) } : {}}
          />

          <AdsCountdown
            type="snooze"
            show={showSnoozeCountdown}
            adsCountdownTime={snoozeCountdownTime}
            onPress={() => void handleSnoozePressed()}
          />

          <SnoozePanel
            show={showSnoozePanel}
            onCancelPressed={() => void handleSnoozeCancel()}
            onConfirmPressed={({ minutes, seconds }) =>
              void handleSnoozeConfirm(adsInfo[0], minutes, seconds)
            }
          />
        </View>
      </View>

      <View className="w-full items-start gap-2 p-4">
        <Text className="text-lg font-semibold">{videoQuery.data.title}</Text>
        <Text className="text-base font-light text-snooze-darkgray">
          Video Source: {videoQuery.data.channelName}
        </Text>

        <TouchableOpacity
          className="rounded-full bg-snooze-button px-4 py-2"
          onPress={() => router.push("/playlist")}
        >
          <Text className="font-semibold text-white">Back to Playlist</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const useSnooze = (ref: RefObject<Video>) => {
  const [showSnoozePanel, setShowSnoozePanel] = useState(false);
  const [showSnoozeCountdown, setShowSnoozeCountdown] = useState(false);

  const handleSnoozePressed = async () => {
    await ref.current?.pauseAsync();
    setShowSnoozePanel(true);
  };

  const snoozeCountdown = ({
    positionMillis,
    firstAd,
  }: {
    positionMillis?: number;
    firstAd?: Ads[number];
  }) => {
    if (!showSnoozeCountdown) return 0;
    if (!firstAd) return 0;
    if (positionMillis == null) return 0;
    return (firstAd.insertAt - positionMillis) / 1000;
  };

  const handleSnoozeCancel = async () => {
    setShowSnoozePanel(false);
    await ref.current?.playAsync();
  };

  const handleSnoozeConfirm = async (
    firstAd: Ads[number] | undefined,
    minutes: number,
    seconds: number,
  ) => {
    setShowSnoozePanel(false);
    setShowSnoozeCountdown(false);

    if (!firstAd) return;

    const snoozeInSeconds = minutes * 60 + seconds;
    const snoozeInMilliseconds = snoozeInSeconds * 1000;
    firstAd.insertAt = firstAd.insertAt + snoozeInMilliseconds;
    await ref.current?.playAsync();
  };

  return {
    showSnoozePanel,
    setShowSnoozePanel,
    showSnoozeCountdown,
    setShowSnoozeCountdown,
    handleSnoozePressed,
    handleSnoozeCancel,
    handleSnoozeConfirm,
    snoozeCountdown,
  };
};
