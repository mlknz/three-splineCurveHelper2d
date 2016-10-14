const THREE = require('three');
window.THREE = THREE;
require('three/examples/js/controls/OrbitControls');

class Controls {
    constructor(camera, domElement) {
        this._controls = new THREE.OrbitControls(camera, domElement);
    }
}

export default Controls;
