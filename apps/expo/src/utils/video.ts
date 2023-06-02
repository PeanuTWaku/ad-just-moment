import { useEffect, type RefObject } from "react";
import { Audio, type Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";

export const loadVideo = async (
  video: Video | null,
  uri: string,
  opts?: { shouldPlay?: boolean; positionMillis?: number },
) => {
  console.log("Loading video from uri: ", uri);
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

export const useUnlockScreenOrientation = () => {
  useEffect(() => {
    void ScreenOrientation.unlockAsync();
  }, []);
};

export const useIOSAudio = (ref: RefObject<Video>, isPlaying?: boolean) => {
  useEffect(() => {
    if (isPlaying) {
      void triggerAudio(ref);
    }
  }, [isPlaying, ref]);
};
