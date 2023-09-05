import { BoxGeometry, Mesh, MeshBasicMaterial, TextureLoader } from "three";

const buildTerminal = function (name: string) {
  const textloader = new TextureLoader();
  const geometry = new BoxGeometry(200, 30, 80);
  const matcapTexture = textloader.load("/images/glass_wall.webp");
  const materials = [
    new MeshBasicMaterial({
      map: matcapTexture,
    }),
    new MeshBasicMaterial({
      map: textloader.load("/images/glass_wall.webp")
    }),
    new MeshBasicMaterial({
      map: textloader.load("/images/glass_wall.webp")
    }),
    new MeshBasicMaterial({
      map: textloader.load("/images/glass_wall.webp")
    }),
    new MeshBasicMaterial({
      map: textloader.load("/images/top.webp")
    }),
    new MeshBasicMaterial({
      map: textloader.load("/images/wall1.webp")
    }),
  ];

  return new Mesh(geometry, materials);
};

export { buildTerminal };
