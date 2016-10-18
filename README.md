# three-splineHelper2d.

A tool for constructing 2d three.js splines. Main purpose: creating splines for other three.js scenes.

Usage:

1. Map a texture from hard drive on 1x1 plane.
2. Draw multiple THREE.SplineCurve's on it (set next curve segments amount, add curves, add joints, move joints).
3. Export curves in local coordinates (with applyTransform flag unchecked) to File or console.
4. Import curves (should be exported according to previous Item).
5. Export curves with applied transform: set world coordinates of left up and right up texture corners and export with applyTransform flag checked.

Unimplemented features:

1. Removing splines.
2. Removing joints.
3. Modifying segmentsAmount of existing splines.

Export file is in JSON format. Example:
{
    "curves": [
        {
            "segmentsAmount": 200,
            "points": [
                [
                    -0.5,
                    0
                ],
                [
                    0.5,
                    0
                ]
            ]
        },
        {
            ...
        }
    ]
}

To launch the project locally:

0. Install Node.js v5 or higher.
1. Clone project to your hard drive.
2. Run "npm install" in project root directory.
4. Run "gulp watch".
5. Look in terminal what port is used and navigate to http://localhost:${port}

To update build launch "gulp build".
