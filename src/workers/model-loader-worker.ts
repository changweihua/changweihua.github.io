// worker.js 文件
import { OBJLoader } from "../jsm/loaders/OBJLoader.js";

function loadModel(workerCallback, progressCallback, modelUrl) {
  const loader = new OBJLoader();

  // 监听加载进度并触发回调函数
  loader.addEventListener("progress", function (event) {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      progressCallback(percentComplete);
    }
  });

  loader.load(modelUrl, function (gltf) {
    workerCallback({ type: "model", data: gltf });
  });
}

self.addEventListener(
  "message",
  function (e) {
    var data = e.data;
    if (data.type === "load") {
      loadModel(self.postMessage, self.postMessage, data.url);
    }
  },
  false
);
