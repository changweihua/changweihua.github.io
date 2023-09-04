// @ts-ignore
import { OBJLoader } from "../../jsm/loaders/OBJLoader.js";
// @ts-ignore
import { MTLLoader } from "../../jsm/loaders/MTLLoader.js";
// @ts-ignore
import { GLTFLoader } from "../../jsm/loaders/GLTFLoader.js";
// @ts-ignore
import { DRACOLoader } from "../../jsm/loaders/DRACOLoader.js";
import { LoadingManager, Object3D } from "three";

function loadPlane(
  mtl: string,
  obj: string,
  report?: (progress: number) => void
) {
  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();
  return new Promise<Object3D>((resolve) => {
    mtlLoader.load(mtl, function (materials: any) {
      // materials.preload();
      // objLoader.setMaterials(materials);
      objLoader.load(
        obj,
        function (gltf: any) {
          console.log(gltf);
          gltf.rotation.z = 1 * Math.PI;
          gltf.position.set(0, -130, 0);
          gltf.scale.set(0.01, 0.01, 0.01);
          resolve(gltf);
        },
        (xhr: any) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          report && report(Math.floor((xhr.loaded / xhr.total) * 100));
        },
        (error: any) => {
          console.log("An error happened", error);
        }
      );
    });
  });
}

function loadGltfPlane(gltf: string, report?: (progress: number) => void) {
  const gltfLoader = new GLTFLoader(new LoadingManager());
  const dracoLoader = new DRACOLoader(); //
  dracoLoader.setDecoderPath('/three/jsm/libs/draco/gltf/' );//设置解压库文件路径
  dracoLoader.setDecoderConfig({ type: "js" }); //使用js方式解压
  dracoLoader.preload(); //初始化_initDecoder 解码器
  return new Promise<Object3D>((resolve) => {
    gltfLoader.setDRACOLoader(dracoLoader); //gltfloader使用dracoLoader
    gltfLoader.load(
      gltf,
      function ({ scene }: { scene: any }) {
        scene.rotation.z = 1 * Math.PI;
        scene.position.set(0, -130, 0);
        scene.scale.set(0.01, 0.01, 0.01);
        resolve(scene);
      },
      (xhr: any) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        report && report(Math.floor((xhr.loaded / xhr.total) * 100));
      },
      (error: any) => {
        console.log("An error happened", error);
      }
    );
  });
}

export { loadPlane, loadGltfPlane };
