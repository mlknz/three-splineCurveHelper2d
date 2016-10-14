const THREE = require('three');

const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

class SplinesManager {
    constructor(scene) {
        this.scene = scene;
        this.splines = [];

        document.addEventListener('createSpline', this.createSpline.bind(this));
    }

    createSpline() {
        const splineCoords = [
            new THREE.Vector2(-0.5, 0),
            new THREE.Vector2(0.5, 0)
        ];
        const curve = new THREE.SplineCurve(splineCoords);
        const path = new THREE.Path(curve.getPoints(50));
        const geometry = path.createPointsGeometry(50);
        const splineMesh = new THREE.Line(geometry, lineMaterial);
        splineMesh.rotation.x = Math.PI / 2;
        splineMesh.position.y = 0.005;
        this.scene.add(splineMesh);
    }
}

export default SplinesManager;
