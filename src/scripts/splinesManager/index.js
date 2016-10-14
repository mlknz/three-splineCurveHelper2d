const THREE = require('three');

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const selectedLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

const sphereGeometry = new THREE.SphereGeometry(1, 10, 10);
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xaaccaa});

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
        this.selectedSpline = null;

        document.addEventListener('createSpline', this.createSpline.bind(this));
        document.addEventListener('addJoint', this.addJoint.bind(this));
        document.addEventListener('changeJointSize', this.changeJointSize.bind(this));
    }

    createSpline(e) {
        const curveSegmentsAmount = e.detail.nextCurveSegmentsAmount;

        const splineCoords = [
            new THREE.Vector2(-0.5, 0),
            new THREE.Vector2(0.5, 0)
        ];
        const curve = new THREE.SplineCurve(splineCoords);
        const path = new THREE.Path(curve.getPoints(curveSegmentsAmount));
        const geometry = path.createPointsGeometry(curveSegmentsAmount);
        const splineMesh = new THREE.Line(geometry, lineMaterial);
        splineMesh.rotation.x = Math.PI / 2;
        splineMesh.position.y = 0.005;
        splineMesh.userData = {};
        splineMesh.userData.curve = curve;
        splineMesh.userData.myIndex = this.curvesContainer.children.length;
        splineMesh.userData.segmentsAmount = curveSegmentsAmount;

        for (let i = 0; i < splineCoords.length; i++) {
            const jointMesh = this._createJoint(splineCoords[i].x, splineCoords[i].y, this.curvesContainer.children.length, i);
            this.jointsContainer.add(jointMesh);
        }

        this.curvesContainer.add(splineMesh);

        this.selectedSpline = splineMesh;
        this.curvesContainer.children.forEach(curveMesh => {
            curveMesh.material = lineMaterial;
        });
        splineMesh.material = selectedLineMaterial;
    }

    updateSpline(targetedJoint) {
        if (!(targetedJoint.position instanceof THREE.Vector3)) {
            throw new Error('updateSpline with uncorrect argument:', targetedJoint);
        }
        const splineNumber = targetedJoint.userData.splineNumber;
        const pointIndex = targetedJoint.userData.pointIndex;
        const splineMesh = this.curvesContainer.children[splineNumber];
        const curve = splineMesh.userData.curve;
        curve.points[pointIndex] = new THREE.Vector2(targetedJoint.position.x, targetedJoint.position.z);

        const segmentsAmount = splineMesh.userData.segmentsAmount;
        let p = null;
        for (let i = 0; i < segmentsAmount + 1; i ++) {
            p = splineMesh.geometry.vertices[i];
            p.copy(curve.getPoint(i / (segmentsAmount)));
            p.z = 0;
        }

        splineMesh.geometry.verticesNeedUpdate = true;
        this.selectedSpline = splineMesh;
        this.curvesContainer.children.forEach(curveMesh => {
            curveMesh.material = lineMaterial;
        });
        splineMesh.material = selectedLineMaterial;
    }

    addJoint() {
        if (!this.selectedSpline) return;
        const splineMesh = this.selectedSpline;
        const curve = splineMesh.userData.curve;
        const newJointIndex = curve.points.length;

        const jointMesh = this._createJoint(0.6, 0.1, splineMesh.userData.myIndex, newJointIndex);

        curve.points[newJointIndex] = new THREE.Vector2(jointMesh.position.x, jointMesh.position.z);
        this.updateSpline(jointMesh);
    }

    _createJoint(posX, posY, splineNumber, pointIndex) {
        const jointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.jointsContainer.add(jointMesh);
        jointMesh.position.x = posX;
        jointMesh.position.y = 0.005;
        jointMesh.position.z = posY;
        jointMesh.scale.x = this.jointSize;
        jointMesh.scale.y = this.jointSize;
        jointMesh.scale.z = this.jointSize;
        jointMesh.userData = {};

        jointMesh.userData.splineNumber = splineNumber;
        jointMesh.userData.pointIndex = pointIndex;
        return jointMesh;
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
