class SplinesImporter {
    constructor(splinesManager) {
        this.splinesManager = splinesManager;
        document.addEventListener('importSplines', this.importSplines.bind(this));
    }

    importSplines(e) {
        const file = e.detail;
        const fileReader = new FileReader();
        fileReader.onload = ((theFile) => {
            return (evt) => {
                // console.log(e.target.result);
                const inputObject = JSON.parse(evt.target.result);
                console.log(inputObject);
                inputObject.curves.forEach(curve => {
                    const points = this.createPointsArray(curve.points);
                    const createSplinesEvent = new CustomEvent('createSpline', { 'detail': {
                        nextCurveSegmentsAmount: curve.segmentsAmount,
                        points
                    } });
                    document.dispatchEvent(createSplinesEvent);
                });
            };
        })(file);
        fileReader.readAsText(file);
    }

    createPointsArray(points) {
        console.log(points);
    }
}

export default SplinesImporter;
