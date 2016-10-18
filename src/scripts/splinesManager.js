const THREE = require('three');

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const selectedLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

const sphereGeometry = new THREE.SphereGeometry(1, 10, 10);
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xaaccaa});

class SplinesManager {
    constructor(scene) {
        this.scene = scene;
        this.jointsContainer = new THREE.Object3D();
        this.splineMeshesContainer = new THREE.Object3D();
        this.jointsContainer.name = 'jointsContainer';
        this.splineMeshesContainer.name = 'splineMeshesContainer';
        this.scene.add(this.jointsContainer);
        this.scene.add(this.splineMeshesContainer);
        this.splines = [];

        this.jointSize = 0.01;
        this.defaultCurveSegmentsAmount = 200;
        this.defaultSplinePoints = [
            new THREE.Vector2(-0.5, 0),
            new THREE.Vector2(0.5, 0)
        ];

        this.selectedJoint = null;
        this.selectedSpline = null;

        document.addEventListener('createSpline', this.createSpline.bind(this));
        document.addEventListener('removeSpline', this.removeSpline.bind(this));
        document.addEventListener('addJoint', this.addJoint.bind(this));
        document.addEventListener('removeJoint', this.removeJoint.bind(this));
        document.addEventListener('changeJointSize', this.changeJointSize.bind(this));
    }

    createSpline(e) {
        const curveSegmentsAmount = e.detail.nextCurveSegmentsAmount || this.defaultCurveSegmentsAmount;
        const splineCoords = e.detail.points || this.defaultSplinePoints.slice();

        const curve = new THREE.SplineCurve(splineCoords);
        const path = new THREE.Path(curve.getPoints(curveSegmentsAmount));
        const geometry = path.createPointsGeometry(curveSegmentsAmount);
        const splineMesh = new THREE.Line(geometry, lineMaterial);
        splineMesh.rotation.x = Math.PI / 2;
        splineMesh.position.y = 0.005;
        splineMesh.userData = {};
        splineMesh.userData.curve = curve;
        splineMesh.userData.segmentsAmount = curveSegmentsAmount;

        for (let i = 0; i < splineCoords.length; i++) {
            const jointMesh = this._createJoint(splineCoords[i].x, splineCoords[i].y, splineMesh.uuid, i);
            this.jointsContainer.add(jointMesh);
        }

        this.splineMeshesContainer.add(splineMesh);

        this.selectedSpline = splineMesh;
        this.splineMeshesContainer.children.forEach(curveMesh => {
            curveMesh.material = lineMaterial;
        });
        splineMesh.material = selectedLineMaterial;
    }

    removeSpline() {
        if (!this.selectedSpline) return;

        const spl = this.selectedSpline;
        const trashJoints = [];

        this.jointsContainer.children.forEach(joint => {
            if (joint.userData.splineUuid === spl.uuid) {
                trashJoints.push(joint);
            }
        });

        trashJoints.forEach(joint => {
            joint.parent.remove(joint);
        });
        this.splineMeshesContainer.remove(spl);
        this.selectedSpline = this.splineMeshesContainer.children[0] || null;
    }

    updateSpline(targetedJoint) {
        if (!(targetedJoint.position instanceof THREE.Vector3)) {
            throw new Error('updateSpline with uncorrect argument:', targetedJoint);
        }
        const splineUuid = targetedJoint.userData.splineUuid;
        const pointIndex = targetedJoint.userData.pointIndex;
        let splineMesh = null;
        this.splineMeshesContainer.children.forEach(spl => {
            if (spl.uuid === splineUuid) splineMesh = spl;
        });
        if (!splineMesh) {
            console.warn('couldn\'t update spline');
            return;
        }
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
        this.splineMeshesContainer.children.forEach(curveMesh => {
            curveMesh.material = lineMaterial;
        });
        splineMesh.material = selectedLineMaterial;
    }

    selectJoint(obj) {
        this.selectedJoint = obj;
    }

    addJoint() {
        if (!this.selectedSpline) return;
        const splineMesh = this.selectedSpline;
        const curve = splineMesh.userData.curve;
        const newJointIndex = curve.points.length;

        const jointMesh = this._createJoint(0.6, 0.1, splineMesh.uuid, newJointIndex);

        curve.points[newJointIndex] = new THREE.Vector2(jointMesh.position.x, jointMesh.position.z);
        this.updateSpline(jointMesh);
    }

    removeJoint() {
        if (!this.selectedJoint) return;
        const fatedJoint = this.selectedJoint;
        const pointIndex = fatedJoint.userData.pointIndex;
        const splineUuid = fatedJoint.userData.splineUuid;

        let splineMesh = null;
        this.splineMeshesContainer.children.forEach(spl => {
            if (spl.uuid === splineUuid) splineMesh = spl;
        });

        if (!splineMesh) {
            console.warn('couldn\'t remove fatedJoint (spline doesn\'t exist)');
            return;
        }

        const splinePoints = splineMesh.userData.curve.points;
        if (splinePoints.length < 3) return;

        splinePoints.splice(pointIndex, 1);
        this.selectedJoint = null;
        fatedJoint.parent.remove(fatedJoint);

        let braveJoint = null;
        this.jointsContainer.children.forEach(joint => {
            if (joint.userData.splineUuid === splineUuid) {
                braveJoint = joint;
                if (joint.userData.pointIndex > pointIndex) {
                    joint.userData.pointIndex -= 1;
                }
            }
        });
        this.updateSpline(braveJoint);
    }

    _createJoint(posX, posY, splineUuid, pointIndex) {
        const jointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.jointsContainer.add(jointMesh);
        jointMesh.position.x = posX;
        jointMesh.position.y = 0.005;
        jointMesh.position.z = posY;
        jointMesh.scale.x = this.jointSize;
        jointMesh.scale.y = this.jointSize;
        jointMesh.scale.z = this.jointSize;
        jointMesh.userData = {};
        jointMesh.userData.splineUuid = splineUuid;
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
