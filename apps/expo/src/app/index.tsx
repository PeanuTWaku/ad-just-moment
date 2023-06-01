import React, { useEffect, useRef, useState, type RefObject } from "react";
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Audio,
  ResizeMode,
  Video,
  VideoFullscreenUpdate,
  type AVPlaybackStatus,
  type VideoFullscreenUpdateEvent,
} from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";

import { api, type RouterOutputs } from "~/utils/api";

type Ads = RouterOutputs["video"]["byId"]["ads"];

const SNOOZE_DECISION_TIME = 5000;

export default function App() {
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

  const videoQuery = api.video.byId.useQuery(
    { id: "0001" },
    {
      onSuccess: (data) => {
        console.log("success", data);
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
      firstAd.insertAt - status.positionMillis <= SNOOZE_DECISION_TIME
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

  return (
    <SafeAreaView className="landscape:bg-black">
      <View className="w-full">
        <View className="relative w-full items-center justify-center">
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
          {showSnoozeCountdown && (
            <TouchableOpacity
              className="absolute bottom-8 right-0 items-center bg-snooze-gray px-4 py-2"
              onPress={() => void handleSnoozePressed()}
            >
              <Text className="text-xs text-snooze-white">
                Ads in {Math.round(snoozeCountdownTime)} seconds...
              </Text>
              <Text className="text-sm text-snooze-white underline">
                Snooze
              </Text>
            </TouchableOpacity>
          )}
          {showSnoozePanel && (
            <View className="absolute inset-0 rounded bg-snooze-panel p-4">
              <Text className="text-snooze-white">Snooze</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity onPress={() => void handleSnoozeCancel()}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void handleSnoozeConfirm(adsInfo[0])}
                >
                  <Text>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <Text>{videoQuery.data?.title}</Text>
      </View>

      <View>
        {status?.isLoaded && (
          <TouchableOpacity
            onPress={() =>
              isPlaying
                ? void videoRef.current?.pauseAsync()
                : void videoRef.current?.playAsync()
            }
          >
            <Text>{isPlaying ? "Pause" : "Play"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const loadVideo = async (
  video: Video | null,
  uri: string,
  opts?: { shouldPlay?: boolean; positionMillis?: number },
) => {
  await video?.loadAsync(
    { uri },
    {
      shouldPlay: opts?.shouldPlay ?? true,
      positionMillis: opts?.positionMillis ?? 0,
    },
  );
};

const triggerAudio = async (ref: RefObject<Video>) => {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  await ref.current?.playAsync();
};

const useUnlockScreenOrientation = () => {
  useEffect(() => {
    void ScreenOrientation.unlockAsync();
  }, []);
};

const useIOSAudio = (ref: RefObject<Video>, isPlaying?: boolean) => {
  useEffect(() => {
    if (isPlaying) {
      void triggerAudio(ref);
    }
  }, [isPlaying, ref]);
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

  const handleSnoozeConfirm = async (firstAd?: Ads[number]) => {
    setShowSnoozePanel(false);
    setShowSnoozeCountdown(false);

    if (!firstAd) return;

    firstAd.insertAt = firstAd.insertAt + 30000;
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
