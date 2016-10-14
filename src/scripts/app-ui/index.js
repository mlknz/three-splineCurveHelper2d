const Dat = require('dat-gui');

const createSplineEvent = new Event('createSpline');

class AppUi {
    constructor() {
        const gui = new Dat.GUI({width: 400});

        const ButtonsFunctions = {
            LoadTexture: () => {
                const fileSelector = document.createElement('input');
                fileSelector.setAttribute('type', 'file');
                // fileSelector.setAttribute('webkitdirectory', 'directory multiple');
                fileSelector.addEventListener('change', (e) => {
                    const loadTextureEvent = new CustomEvent('loadTexture', { 'detail': e.target.files[0] });
                    document.dispatchEvent(loadTextureEvent);
                });
                fileSelector.click();
            },
            AddCurve: () => {
                document.dispatchEvent(createSplineEvent);
            }
        };
        const corners = {
            leftUpX: 1,
            leftUpY: 2,
            rightUpX: 2,
            rightUpY: 2,
            rightDownX: 2,
            rightDownY: 1
        };

        const drawParams = {
            jointSize: 0.01
        };

        gui.add(ButtonsFunctions, 'LoadTexture');
        const cornersFolder = gui.addFolder('Corners coordinates');
        cornersFolder.add(corners, 'leftUpX');
        cornersFolder.add(corners, 'leftUpY');
        cornersFolder.add(corners, 'rightUpX');
        cornersFolder.add(corners, 'rightUpY');
        cornersFolder.add(corners, 'rightDownX');
        cornersFolder.add(corners, 'rightDownY');

        gui.add(ButtonsFunctions, 'AddCurve');
        const jointSizeController = gui.add(drawParams, 'jointSize').min(0.001).max(0.18).step(0.001);
        jointSizeController.onFinishChange((value) => {
            const changeJointSizeEvent = new CustomEvent('changeJointSize', { 'detail': value });
            document.dispatchEvent(changeJointSizeEvent);
        });

    }

}

export default AppUi;
