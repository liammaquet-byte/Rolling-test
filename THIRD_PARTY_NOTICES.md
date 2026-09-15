# Third-party notice

Optional DWG import uses **@mlightcad/libredwg-web 0.7.10**, based on GNU LibreDWG, loaded on demand in the browser. The upstream package is GPL-3.0 licensed.

The Sheet Nester distribution does not bundle the LibreDWG JavaScript/WASM binaries in this package; by default the DWG adapter loads the pinned browser module from jsDelivr. For a fully self-hosted deployment, place the upstream package assets under `vendor/libredwg-web/` using its original `dist/` and `wasm/` layout.

DWG drawing bytes are passed only to the decoder running in the user's browser and are not uploaded by Sheet Nester.
