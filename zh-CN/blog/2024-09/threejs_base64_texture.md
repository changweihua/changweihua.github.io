---
lastUpdated: true
commentabled: true
recommended: true
title:  threejs 使用base64编码的图片作为贴图
description: threejs 使用base64编码的图片作为贴图
date: 2024-09-24 14:18:00
pageClass: blog-page-class
---

# threejs 使用base64编码的图片作为贴图 #

使用base64作为贴图可以从接口直接传输(如果特别大需要压缩)，可以省去很多操作

## 加载代码 ##

```ts
// 纹理加载器
const texLoader = new THREE.TextureLoader();
const base64Str = "data:image/png;base64,...";
texLoader.load(base64Str, (texture) => {

        const aspectRatio = texture.image.width / texture.image.height;
        // 创建平面几何体
        const geometry = new THREE.PlaneGeometry(100 * aspectRatio , 100 ); // 根据比例放大

        // 创建材质
        const material = new THREE.MeshLambertMaterial({
            map: texture,
        });
// 创建网格对象
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
        })
```

## 完整示例 ##

```ts
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // 创建场景
        const scene = new THREE.Scene();

        // 创建相机
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 300;

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // 添加光源
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 1, 1).normalize();
        scene.add(light);



        // 纹理加载器
        const texLoader = new THREE.TextureLoader();
        const base64Str = "data:image/png;base64,..."
        texLoader.load(base64Str, (texture) => {

        const aspectRatio = texture.image.width / texture.image.height;
        // 创建平面几何体
        const geometry = new THREE.PlaneGeometry(100 * aspectRatio , 100 ); // 根据比例放大

        // 创建材质
        const material = new THREE.MeshLambertMaterial({
            map: texture,
        });

        // 创建网格对象
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
        })

        // 渲染
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
</script>
```
