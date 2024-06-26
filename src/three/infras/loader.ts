import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { DRACOLoader, GLTF } from 'three/examples/jsm/Addons.js'
// 创建解压缩器
const dracoLoader = new DRACOLoader();
// 解压缩处理的文件地址
dracoLoader.setDecoderPath(`/three/jsm/libs/draco/gltf/`);
const gltfLoader = new GLTFLoader();

// 加载gltf
export function loadGltf(url: string) {
    gltfLoader.setDRACOLoader(dracoLoader);
    return new Promise<GLTF>((resolve, reject) => {
      gltfLoader.load(url, function (gltf: GLTF) {
            resolve(gltf)
        }, function (xhr) {
            console.log(xhr);
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        });
    })
}
