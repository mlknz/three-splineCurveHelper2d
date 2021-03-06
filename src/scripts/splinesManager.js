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
        document.addEventListener('insertJoint', this.insertJoint.bind(this));
        document.addEventListener('removeJoint', this.removeJoint.bind(this));
        document.addEventListener('changeJointSize', this.changeJointSize.bind(this));
        document.addEventListener('updateSegmentsAmount', this.updateSegmentsAmount.bind(this));
    }

    createSpline(e) {
        const curveSegmentsAmount = e.detail.nextCurveSegmentsAmount || this.defaultCurveSegmentsAmount;
        const splineCoords = e.detail.points || this.defaultSplinePoints.slice();

        const curve = new THREE.SplineCurve(splineCoords);
        const path = new THREE.Path(curve.getPoints(curveSegmentsAmount));
        const geometry = path.createPointsGeometry(curveSegmentsAmount);
        const splineMesh = new THREE.Line(geometry, lineMaterial);
        splineMesh.rotation.x = Math.PI / 2;
        splineMesh.position.y = 0.0003;
        splineMesh.userData = {};
        splineMesh.userData.curve = curve;
        splineMesh.userData.segmentsAmount = curveSegmentsAmount;

        for (let i = 0; i < splineCoords.length; i++) {
            const jointMesh = this._createJoint(splineCoords[i], splineMesh.uuid, i);
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

    updateSegmentsAmount(e) {
        const segmentsAmount = e.detail.nextCurveSegmentsAmount;
        if (!this.selectedSpline) return;

        const oldSpline = this.selectedSpline;
        const uuid = oldSpline.uuid;

        const curve = this.selectedSpline.userData.curve;
        const path = new THREE.Path(curve.getPoints(segmentsAmount));
        const geometry = path.createPointsGeometry(segmentsAmount);
        const splineMesh = new THREE.Line(geometry, selectedLineMaterial);
        splineMesh.rotation.x = Math.PI / 2;
        splineMesh.position.y = 0.0003;
        splineMesh.userData = {};
        splineMesh.userData.curve = curve;
        splineMesh.userData.segmentsAmount = segmentsAmount;
        this.splineMeshesContainer.add(splineMesh);

        this.selectedSpline = splineMesh;
        oldSpline.parent.remove(oldSpline);
        splineMesh.uuid = uuid;
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

    insertJoint() {
        if (!this.selectedSpline) return;
        const splineMesh = this.selectedSpline;
        const curve = splineMesh.userData.curve;
        let newJointIndex = curve.points.length;

        if (this.selectedJoint && this.selectedJoint.userData.splineUuid === splineMesh.uuid) {
            newJointIndex = this.selectedJoint.userData.pointIndex + 1;
        }
        const spawnPos = new THREE.Vector2();
        if (newJointIndex < curve.points.length) {
            spawnPos.x = (curve.points[newJointIndex - 1].x + curve.points[newJointIndex].x) / 2;
            spawnPos.y = (curve.points[newJointIndex - 1].y + curve.points[newJointIndex].y) / 2;

            this.jointsContainer.children.forEach(joint => {
                if (joint.userData.splineUuid === splineMesh.uuid && joint.userData.pointIndex >= newJointIndex) {
                    joint.userData.pointIndex += 1;
                }
            });
        } else {
            spawnPos.x = 1.2 * curve.points[curve.points.length - 1].x - 0.2 * curve.points[curve.points.length - 2].x;
            spawnPos.y = 1.2 * curve.points[curve.points.length - 1].y - 0.2 * curve.points[curve.points.length - 2].y;
        }

        const jointMesh = this._createJoint(spawnPos, splineMesh.uuid, newJointIndex);
        curve.points.splice(newJointIndex, 0, new THREE.Vector2(jointMesh.position.x, jointMesh.position.z));
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

    _createJoint(pos, splineUuid, pointIndex) {
        const jointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.jointsContainer.add(jointMesh);
        jointMesh.position.x = pos.x;
        jointMesh.position.y = 0.0003;
        jointMesh.position.z = pos.y;
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
