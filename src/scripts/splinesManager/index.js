const THREE = require('three');

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
// const selectedLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

const sphereGeometry = new THREE.SphereGeometry(1, 10, 10);
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xaaccaa});
// const selectedSphereMaterial = new THREE.MeshBasicMaterial({color: 0xccaaaa});

const ARC_SEGMENTS = 200;

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
        const path = new THREE.Path(curve.getPoints(ARC_SEGMENTS));
        const geometry = path.createPointsGeometry(ARC_SEGMENTS);
        const splineMesh = new THREE.Line(geometry, lineMaterial);
        splineMesh.rotation.x = Math.PI / 2;
        splineMesh.position.y = 0.005;
        splineMesh.userData = {};
        splineMesh.userData.curve = curve;
        this.curvesContainer.add(splineMesh);
        for (let i = 0; i < splineCoords.length; i++) {
            const jointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            this.jointsContainer.add(jointMesh);
            jointMesh.position.x = splineCoords[i].x;
            jointMesh.position.y = 0.005;
            jointMesh.position.z = splineCoords[i].y;
            jointMesh.scale.x = this.jointSize;
            jointMesh.scale.y = this.jointSize;
            jointMesh.scale.z = this.jointSize;
            jointMesh.userData = {};

            jointMesh.userData.splineNumber = this.curvesContainer.children.length - 1;
            jointMesh.userData.pointIndex = i;
        }
    }

    updateSpline(targetedJoint) {
        const splineNumber = targetedJoint.userData.splineNumber;
        const pointIndex = targetedJoint.userData.pointIndex;
        const splineMesh = this.curvesContainer.children[splineNumber];
        const curve = splineMesh.userData.curve;
        curve.points[pointIndex] = new THREE.Vector2(targetedJoint.position.x, targetedJoint.position.z);

        let p = null;
        for (let i = 0; i < ARC_SEGMENTS + 1; i ++) {
            p = splineMesh.geometry.vertices[i];
            p.copy(curve.getPoint(i / (ARC_SEGMENTS - 1)));
            p.z = 0;
        }

        splineMesh.geometry.verticesNeedUpdate = true;
    }

    changeJointSize(e) {
        this.jointSize = e.detail;
        this.jointsContainer.children.forEach(jointMesh => {
            jointMesh.scale.x = this.jointSize;
            jointMesh.scale.y = this.jointSize;
            jointMesh.scale.z = this.jointSize;
        });
    }
}

export default SplinesManager;
