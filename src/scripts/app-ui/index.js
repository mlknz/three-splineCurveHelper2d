const Dat = require('dat-gui');

class AppUi {
    constructor() {
        const gui = new Dat.GUI({width: 400});

        const loadTextureButton = { LoadTexture: () => {
            const fileSelector = document.createElement('input');
            fileSelector.setAttribute('type', 'file');
            // fileSelector.setAttribute('webkitdirectory', 'directory multiple');
            fileSelector.addEventListener('change', (e) => {
                const loadTextureEvent = new CustomEvent('loadTexture', { 'detail': e.target.files[0] });
                document.dispatchEvent(loadTextureEvent);
            });
            fileSelector.click();
        } };

        gui.add(loadTextureButton, 'LoadTexture');
    }

}

export default AppUi;
