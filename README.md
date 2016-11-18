# three-splineHelper2d.

A tool for constructing 2d three.js splines and exporting them with transform applied.

Live version: https://mlknz.github.io/three-splineCurveHelper2d/

Usage:

1. Map a texture from hard drive on 1x1 plane.
2. Draw multiple THREE.SplineCurve's on it (add/remove curves/joints, tweak curve segments amount, move joints).
3. Export curves in local coordinates or with applied transform to File or console. Transform is set by setting desired coordinates of left up and right up texture corners.
4. Import curves (no transforms applied).

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
