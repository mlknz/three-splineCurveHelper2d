export const rendererConfig = {
    clearColor: 0x555555,
    alpha: false,
    antialias: true,
    pixelRatio: window.devicePixelRatio || 1
};

export const cameraConfig = {
    position: [0, 1.7, 0],
    fov: 35,
    near: 0.01,
    far: 10
};

export const controlsConfig = {
    minDistance: 1,
    maxDistance: 8,
    rotateSpeed: 0.25,
    enableDamping: true
};
