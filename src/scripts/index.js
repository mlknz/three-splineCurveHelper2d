const THREE = require('three');
window.THREE = THREE;
const webgldetection = require('./utils/webgldetection');

import {rendererConfig} from './config.js';
import SceneManager from './sceneManager.js';
import AppUi from './appUi.js';
import SplinesManager from './splinesManager.js';
import SplinesExporter from './utils/splinesExporter.js';
import SplinesImporter from './utils/splinesImporter.js';
require('three/examples/js/controls/OrbitControls');
require('three/examples/js/controls/DragControls');
require('./utils/transformControls2d');

(() => {
    if (!webgldetection()) {
        document.body.innerHTML = 'Unable to initialize WebGL. Your browser may not support it.';
        return;
    }

    const renderer = new THREE.WebGLRenderer({antialias: rendererConfig.antialias, alpha: rendererConfig.alpha});
    renderer.setClearColor(rendererConfig.clearColor, +!rendererConfig.alpha);
    renderer.setPixelRatio(rendererConfig.pixelRatio);

    const canvas = renderer.domElement;
    canvas.className = 'canvas';
    document.body.appendChild(canvas);

    const sceneManager = new SceneManager(canvas.clientWidth / canvas.clientHeight);
    const camera = sceneManager.camera;
    const scene = sceneManager.scene;
    const orbitControls = new THREE.OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.rotateSpeed = 0.25;

    const appUi = new AppUi();

    const splinesManager = new SplinesManager(scene);
    const transformControl = new THREE.TransformControls(camera, renderer.domElement);
    scene.add(transformControl);

    transformControl.addEventListener('objectChange', (e) => {
        splinesManager.updateSpline(e.target.object);
    });

    const dragcontrols = new THREE.DragControls(camera, splinesManager.jointsContainer.children, renderer.domElement);
    dragcontrols.on('hoveron', (e) => {
        transformControl.attach(e.object);
    });
    // dragcontrols.on('hoveroff', (e) => {
        // if (e)
        // transformControl.detach();
    // });
    const splinesExporter = new SplinesExporter(splinesManager.splineMeshesContainer);
    const splinesImporter = new SplinesImporter(splinesManager);

    const gl = renderer.getContext();
    function resize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;

            if (camera.aspect !== width / height) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
    }

    function animate() {
        resize();
        transformControl.update();
        orbitControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();
})();
