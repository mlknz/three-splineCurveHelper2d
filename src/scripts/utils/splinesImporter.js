const THREE = require('three');

class SplinesImporter {
    constructor(splinesManager) {
        this.splinesManager = splinesManager;

        this.file = null;

        const curveParams = {
            nextCurveSegmentsAmount: null,
            points: null
        };
        const createSplineEvent = new CustomEvent('createSpline', { 'detail': curveParams });

        this.fileReader = new FileReader();
        this.fileReader.onload = (theFile => {
            return evt => {
                const inputObject = JSON.parse(evt.target.result);

                inputObject.curves.forEach(curve => {
                    const points = this.createPointsArray(curve.points);
                    curveParams.nextCurveSegmentsAmount = curve.segmentsAmount;
                    curveParams.points = points;
                    document.dispatchEvent(createSplineEvent);
                });
            };
        })(this.file);

        document.addEventListener('importSplines', this.importSplines.bind(this));
    }

    importSplines(e) {
        this.file = e.detail;
        this.fileReader.readAsText(this.file);
    }

    createPointsArray(points) {
        const result = [];
        points.forEach(point => {
            result.push(new THREE.Vector2(point[0], point[1]));
        });
        return result;
    }
}

export default SplinesImporter;
