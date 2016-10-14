const THREE = require('three');
window.THREE = THREE;
const webgldetection = require('./webgldetection');

import {rendererConfig} from './config.js';
import AppViewer from './app-viewer';
import AppUi from './app-ui';
import SplinesManager from './splinesManager';
require('three/examples/js/controls/OrbitControls');
require('three/examples/js/controls/TransformControls');
require('three/examples/js/controls/DragControls');

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

    const appViewer = new AppViewer(canvas.clientWidth / canvas.clientHeight);
    const camera = appViewer.camera;

    const scene = appViewer.scene;
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
