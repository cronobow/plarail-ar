# 8th Wall distributed engine 1.0.0

Source: [`@8thwall/engine-binary@1.0.0`](https://www.npmjs.com/package/@8thwall/engine-binary/v/1.0.0), [official repository](https://github.com/8thwall/engine).

The package's `dist/` (including its `LICENSE`) is copied without modification; the package root license is also preserved as `LICENSE.package`. `SHA256SUMS` records the distributed files. The binary is governed by its [8th Wall Engine Binary License Agreement](LICENSE), **not the MIT license** used by separate open source framework code. © 2026 Niantic Spatial, Inc. The application provides the copyright, license and disclaimer link in Settings → 使用說明／隱私說明.

The main application loads `xr.js` and the `slam` chunk on entering AR. Image targets and SLAM use the camera and device motion sensors; there is no API key or runtime CDN dependency. Other package chunks remain intact but are not enabled by this application.

Reproduce from the private source repository with `node scripts/prepare-world-tracking.mjs` (Node 22). This installs pinned engine, image-target-cli 1.0.0 and sharp 0.34.5 in a temporary folder, copies distribution files, generates target images and deterministic metadata, and refreshes hashes. Then run `sh scripts/build-browser.sh`.

`image-targets/station.json` is generated from the original `marker.png`: the entire image is resized to 480 pixels wide and centered on a 480×640 white canvas to satisfy the target tool's 3:4 tracking region. The application maps target width to the original marker width. No new printed marker is required. Physical marker scale, orientation, drift and iOS camera quality still require device testing.
