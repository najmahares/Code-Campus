export type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  mood: "focus" | "calm" | "sleep";
};

export const TRACKS: Track[] = [
  { id: "focus-01", title: "Deep Work", artist: "Ambient Collective", src: "/audio/focus-01.mp3", mood: "focus" },
  { id: "focus-02", title: "Flow State", artist: "Ambient Collective", src: "/audio/focus-02.mp3", mood: "focus" },
  { id: "focus-03", title: "Quiet Engine", artist: "Ambient Collective", src: "/audio/focus-03.mp3", mood: "focus" },
  { id: "focus-04", title: "Night Compile", artist: "Ambient Collective", src: "/audio/focus-04.mp3", mood: "focus" },
  { id: "calm-01", title: "Soft Rain", artist: "Nature Sessions", src: "/audio/calm-01.mp3", mood: "calm" },
  { id: "calm-02", title: "Slow Tide", artist: "Nature Sessions", src: "/audio/calm-02.mp3", mood: "calm" },
  { id: "calm-03", title: "Open Window", artist: "Nature Sessions", src: "/audio/calm-03.mp3", mood: "calm" },
  { id: "calm-04", title: "Paper Lantern", artist: "Nature Sessions", src: "/audio/calm-04.mp3", mood: "calm" },
  { id: "sleep-01", title: "Wind Down", artist: "Rest Studio", src: "/audio/sleep-01.mp3", mood: "sleep" },
  { id: "sleep-02", title: "Drift", artist: "Rest Studio", src: "/audio/sleep-02.mp3", mood: "sleep" },
  { id: "sleep-03", title: "Dim Room", artist: "Rest Studio", src: "/audio/sleep-03.mp3", mood: "sleep" },
  { id: "sleep-04", title: "Long Exhale", artist: "Rest Studio", src: "/audio/sleep-04.mp3", mood: "sleep" },
];
