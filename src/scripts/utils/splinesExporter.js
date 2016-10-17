class SplinesExporter {
    constructor(splineMeshes) {
        this.splineMeshes = splineMeshes;
        document.addEventListener('exportSplines', this.exportSplines.bind(this));
    }

    exportSplines(e) {
        if (!this.splineMeshes.children.length) {
            alert('Nothing to export');
            return;
        }

        const exportParams = e.detail;
        const curvesData = [];
        this.splineMeshes.children.forEach(splineMesh => {
            const curveData = this.processCurveData(splineMesh.userData, exportParams);
            curvesData.push(curveData);
        });
        this.writeDataToFile(curvesData);
    }

    processCurveData(curveUserData, params) {
        const curveData = {};
        curveData.segmentsAmount = curveUserData.segmentsAmount;
        curveData.points = [];

        if (!params.applyTransform) {
            for (let i = 0; i < curveUserData.curve.points.length; i++) {
                const point = curveUserData.curve.points[i];
                curveData.points.push([point.x, point.y]);
            }
        } else {
            for (let i = 0; i < curveUserData.curve.points.length; i++) {
                const point = this.transformPoint(
                    curveUserData.curve.points[i],
                    params.leftUpXCoord,
                    params.leftUpYCoord,
                    params.rightUpXCoord,
                    params.rightUpYCoord
                );
                curveData.points.push([point.x, point.y]);
            }
        }
        return curveData;
    }

    transformPoint(point, luX, luY, ruX, ruY) {
        return point;
    }

    writeDataToFile(data) {
        const dataToWrite = JSON.stringify(data, null, 4);
        const curDate = new Date().toString();
        const dateArr = curDate.split(' ');
        const dateToAppend = dateArr[4] + '_' + dateArr[1] + dateArr[2] + '_' + dateArr[3];

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, (fs) => {
            fs.root.getFile('curves_' + dateToAppend + '.bin', {create: true}, (fileEntry) => {
                fileEntry.createWriter((fileWriter) => {
                    const blob = new Blob([dataToWrite]);
                    fileWriter.addEventListener('writeend', () => {
                        location.href = fileEntry.toURL();
                    }, false);
                    fileWriter.write(blob);
                }, () => {});
            }, () => {});
        }, () => {});
    }
}

export default SplinesExporter;
