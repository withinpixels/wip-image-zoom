# wip-image-zoom
Native angularjs image zoom directive with lots of features.

## Install

You can download all necessary wip-image-zoom files manually, or install it with bower:

```bash
bower install wip-image-zoom
```


## Usage

You need only to include ``wip-image-zoom.min.js`` and ``wip-image-zoom.min.css``. 

```html
<link rel="stylesheet" href="/dist/wip-image-zoom.min.css">
<script src="/dist/wip-image-zoom.min.js"></script>
```

#### Config Provider

You can change directive defaults using the ``wipImageZoomConfigProvider`` in your config for example:

```javascript
var app = angular.module('exampleApp', ['wipImageZoom']);
app.config(config);

function config(wipImageZoomConfigProvider) {
  wipImageZoomConfigProvider.setDefaults({
    style               : 'box' // e.g.
  });
};
```
#### Sample usage with single image
```html
<img wip-image-zoom src="http://lorempixel.com/output/nature-q-c-640-480-4.jpg">
```

#### Sample usage with options
```html
   <img src="http://lorempixel.com/output/nature-q-c-640-480-4.jpg" 
    wip-image-zoom="vm.options" 
    selected-model="vm.selected"
    selected-index="vm.selectedIndex">
```

## Configuration
Passing a configuration object to ``wip-image-zoom="vm.options""`` changes the defaults.

```js
vm.options = {
                           zoomEnable          : true,
                           defaultIndex        : 0, // Order of the default selected Image
                           /* You should give images in array with object properties
                            [{
                            thumb : 'assets/images/1-thumb.jpg',
                            medium: 'assets/images/1-medium.jpg',
                            large : 'assets/images/1-large.jpg'
                            }] */
                           images              : [],
                           style               : 'inner', // inner or box
                           boxPos              : 'right-top', // e.g., right-top, right-middle, right-bottom, top-center, top-left, top-right ...
                           boxW                : 400, // Box width
                           boxH                : 400, // Box height
                           method              : 'lens', // fallow 'lens' or 'pointer'
                           cursor              : 'crosshair', // 'none', 'default', 'crosshair', 'pointer', 'move'
                           lens                : true, // Lens toggle
                           zoomLevel           : 3, // 0: not scales, uses the original large image size, use 1 and above to adjust.
                           immersiveMode       : '769', // false or 0 for disable, always, max width(px) for trigger
                           immersiveModeOptions: {}, // can extend immersed mode options
                           immersiveModeMessage: 'Click to Zoom', // Immersive mode message
                           prevThumbButton     : '&#9665;', // Prev thumb button (html)
                           nextThumbButton     : '&#9655;', // Next thumb button (html)
                           thumbsPos           : 'bottom', // Thumbs position: 'top', 'bottom'
                           thumbCol            : 3, // Thumb column count
                           thumbColPadding     : 4 // Padding between thumbs
                       };
````

## Demo
[withinpixels.github.io/wip-image-zoom](https://withinpixels.github.io/wip-image-zoom)
