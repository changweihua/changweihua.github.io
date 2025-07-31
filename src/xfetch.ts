import { getCurrentWatcher, onWatcherCleanup } from "vue";

export default async function xFetch(url: string, options: RequestInit) {
  const controller = new AbortController();
  if (getCurrentWatcher()) {
    onWatcherCleanup(() => {
      controller.abort();
    });
  }

  const res = await fetch(url, {
    ...options,
    signal: controller.signal,
  });

  let json;
  try {
    json = await res.json();
  } catch (error) {
    json = {
      code: 500,
      message: "JSON format error",
    };
  }
  return json;
}
