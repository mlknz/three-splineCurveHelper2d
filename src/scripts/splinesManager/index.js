const THREE = require('three');

const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const sphereGeometry = new THREE.SphereGeometry(1, 10, 10);
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
class SplinesManager {
    constructor(scene) {
        this.scene = scene;
        this.jointsContainer = new THREE.Object3D();
        this.curvesContainer = new THREE.Object3D();
        this.jointsContainer.name = 'jointsContainer';
        this.curvesContainer.name = 'curvesContainer';
        this.scene.add(this.jointsContainer);
        this.scene.add(this.curvesContainer);
        this.splines = [];

        this.jointSize = 0.01;

        document.addEventListener('createSpline', this.createSpline.bind(this));
        document.addEventListener('changeJointSize', this.changeJointSize.bind(this));
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
        this.curvesContainer.add(splineMesh);

        const splineJoints = new THREE.Object3D();
        this.jointsContainer.add(splineJoints);
        splineCoords.forEach(coords => {
            const jointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            splineJoints.add(jointMesh);
            jointMesh.position.x = coords.x;
            jointMesh.position.y = 0.005;
            jointMesh.position.z = coords.y;
            jointMesh.scale.x = this.jointSize;
            jointMesh.scale.y = this.jointSize;
            jointMesh.scale.z = this.jointSize;
        });
    }

    changeJointSize(e) {
        this.jointSize = e.detail;
        this.jointsContainer.children.forEach(splinesCont => {
            splinesCont.children.forEach(jointMesh => {
                jointMesh.scale.x = this.jointSize;
                jointMesh.scale.y = this.jointSize;
                jointMesh.scale.z = this.jointSize;
            });
        });
    }
}

export default SplinesManager;
