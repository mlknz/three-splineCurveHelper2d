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
        console.log(curvesData[0].points[0]);
        const dataToWrite = JSON.stringify(curvesData, null, 4);
        if (exportParams.toFile) this.writeDataToFile(dataToWrite);
        if (exportParams.toConsole) console.log(dataToWrite);
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
            const transformParameters = this.getTransformParameters(
                params.leftUpXCoord,
                params.leftUpYCoord,
                params.rightUpXCoord,
                params.rightUpYCoord
            );
            for (let i = 0; i < curveUserData.curve.points.length; i++) {
                const point = this.transformPoint(curveUserData.curve.points[i], transformParameters);
                curveData.points.push([point.x, point.y]);
            }
        }
        return curveData;
    }

    getTransformParameters(lx, ly, rx, ry) {
        const startLeftUpx = -0.5;
        const startLeftUpy = 0.5; // flip Y
        const vx = rx - lx;
        const vy = ry - ly;

        const scale = Math.sqrt(vx * vx + vy * vy);
        const cosPhi = (rx - lx) / scale;
        const sinPhi = (ry - ly) / scale;
        // console.log('scale, sin, cos, 1:', scale, sinPhi, cosPhi, sinPhi * sinPhi + cosPhi * cosPhi);

        const xOffset = lx - scale * (startLeftUpx * cosPhi - startLeftUpy * sinPhi);
        const yOffset = ly - scale * (startLeftUpx * sinPhi + startLeftUpy * cosPhi);
        // console.log('offset:', xOffset, yOffset);
        return {
            scale,
            cosPhi,
            sinPhi,
            xOffset,
            yOffset
        };
    }

    transformPoint(point, params) {
        const px = point.x;
        const py = -point.y; // flip Y
        const k = params.scale;
        const c = params.cosPhi;
        const s = params.sinPhi;
        const newX = k * (c * px - s * py) + params.xOffset;
        const newY = k * (s * px + c * py) + params.yOffset;
        return { x: newX, y: newY };
    }

    writeDataToFile(data) {
        const curDate = new Date().toString();
        const dateArr = curDate.split(' ');
        const dateToAppend = dateArr[4] + '_' + dateArr[1] + dateArr[2] + '_' + dateArr[3];

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, (fs) => {
            fs.root.getFile('curves_' + dateToAppend + '.bin', {create: true}, (fileEntry) => {
                fileEntry.createWriter((fileWriter) => {
                    const blob = new Blob([data]);
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
