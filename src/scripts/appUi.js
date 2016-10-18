const Dat = require('dat-gui');

const addJointEvent = new Event('addJoint');

class AppUi {
    constructor() {
        const gui = new Dat.GUI({width: 400});

        const exportParams = {
            leftUpXCoord: 1,
            leftUpYCoord: 1,
            rightUpXCoord: 1,
            rightUpYCoord: -1,
            applyTransform: false,
            toFile: false,
            toConsole: false
        };

        const drawParams = {
            jointSize: 0.01
        };

        const curveParams = {
            nextCurveSegmentsAmount: 200,
            points: null
        };
        const createSplineEvent = new CustomEvent('createSpline', { 'detail': curveParams });
        const exportSplinesEvent = new CustomEvent('exportSplines', { 'detail': exportParams });

        const ButtonsFunctions = {
            LoadTexture: () => {
                const fileSelector = document.createElement('input');
                fileSelector.setAttribute('type', 'file');
                fileSelector.addEventListener('change', (e) => {
                    const loadTextureEvent = new CustomEvent('loadTexture', { 'detail': e.target.files[0] });
                    document.dispatchEvent(loadTextureEvent);
                });
                fileSelector.click();
            },
            ImportCurves: () => {
                const fileSelector = document.createElement('input');
                fileSelector.setAttribute('type', 'file');
                fileSelector.addEventListener('change', (e) => {
                    const importSplinesEvent = new CustomEvent('importSplines', { 'detail': e.target.files[0] });
                    document.dispatchEvent(importSplinesEvent);
                });
                fileSelector.click();
            },
            AddCurve: () => {
                document.dispatchEvent(createSplineEvent);
            },
            AddJoint: () => {
                document.dispatchEvent(addJointEvent);
            },
            Export: () => {
                document.dispatchEvent(exportSplinesEvent);
            }
        };

        gui.add(ButtonsFunctions, 'LoadTexture');
        gui.add(ButtonsFunctions, 'ImportCurves');

        gui.add(curveParams, 'nextCurveSegmentsAmount').min(1).max(1200).step(1);
        gui.add(ButtonsFunctions, 'AddCurve');
        const jointSizeController = gui.add(drawParams, 'jointSize').min(0.001).max(0.18).step(0.001);
        jointSizeController.onChange((value) => {
            const changeJointSizeEvent = new CustomEvent('changeJointSize', { 'detail': value });
            document.dispatchEvent(changeJointSizeEvent);
        });
        gui.add(ButtonsFunctions, 'AddJoint');

        const exportFolder = gui.addFolder('Export');
        exportFolder.add(exportParams, 'leftUpXCoord');
        exportFolder.add(exportParams, 'leftUpYCoord');
        exportFolder.add(exportParams, 'rightUpXCoord');
        exportFolder.add(exportParams, 'rightUpYCoord');
        exportFolder.add(exportParams, 'applyTransform');
        exportFolder.add(exportParams, 'toFile');
        exportFolder.add(exportParams, 'toConsole');
        exportFolder.add(ButtonsFunctions, 'Export');
        exportFolder.open();
    }

}

export default AppUi;
