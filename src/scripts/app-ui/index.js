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

        gui.add(ButtonsFunctions, 'LoadTexture');

        const corners = {
            leftUpX: 1,
            leftUpY: 2,
            leftUpZ: 0,
            rightUpX: 2,
            rightUpY: 2,
            rightUpZ: 0,
            rightDownX: 2,
            rightDownY: 1,
            rightDownZ: 0
        };
        const cornersFolder = gui.addFolder('Corners coordinates');
        cornersFolder.add(corners, 'leftUpX');
        cornersFolder.add(corners, 'leftUpY');
        cornersFolder.add(corners, 'leftUpZ');
        cornersFolder.add(corners, 'rightUpX');
        cornersFolder.add(corners, 'rightUpY');
        cornersFolder.add(corners, 'rightUpZ');
        cornersFolder.add(corners, 'rightDownX');
        cornersFolder.add(corners, 'rightDownY');
        cornersFolder.add(corners, 'rightDownZ');

        gui.add(ButtonsFunctions, 'AddCurve');

    }

}

export default AppUi;
