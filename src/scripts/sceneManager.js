const THREE = require('three');

import {cameraConfig} from './config.js';

class AppViewer {
    constructor(aspectRatio) {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(cameraConfig.fov, aspectRatio || 1, cameraConfig.near, cameraConfig.far);
        this.camera.position.fromArray(cameraConfig.position);

        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        const boxGeometry = new THREE.BoxGeometry(1, 0.2, 1);
        const boxMaterial = new THREE.MeshBasicMaterial({color: 0x332222});
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        this.scene.add(box);
        box.position.y = -0.15;

        const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
        const planeMaterial = new THREE.MeshBasicMaterial({color: 0xaa8888, side: THREE.DoubleSide});
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.scene.add(plane);
        plane.rotation.x = -Math.PI / 2;

        const textureLoader = new THREE.TextureLoader();
        document.addEventListener('loadTexture', (e) => {
            const file = e.detail;
            console.log('File chosen:', file);
            const src = URL.createObjectURL(file);
            textureLoader.load(src, (texture) => {
                console.log('Successfully loaded texture:', texture);
                planeMaterial.map = texture;
                planeMaterial.color = new THREE.Color(0xffffff);
                planeMaterial.needsUpdate = true;

            });
        }, false);

    }
}

export default AppViewer;
