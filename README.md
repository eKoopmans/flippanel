# FlipPanel

FlipPanel is a JavaScript/CSS package for creating a panel of tiles that will flip when moused over.

This is an x-by-y grid of flip tiles as described [here](https://davidwalsh.name/css-flip). Each tile flips independently when moused over. The novel feature of FlipPanel is that the tiles combine to show a single image (see [here](http://www.erik-koopmans.com/portfolio/) for an example). The result is a single image that can be moused over to reveal different content under each tile.

## Install

1. Copy `flippanel.js` and `flippanel.css` to your project directory.
2. Include `<script src="flippanel.js"></script>` and `<link rel="stylesheet" type="text/css" href="flippanel.css">` in your HTML document.

## Usage

### Basic usage

As soon as FlipPanel is included, the `FlipPanel` class is exposed. To construct a new FlipPanel object, you must pass a destination DOM (which it will fill) and a callback that will be called upon creation:

```js
var destination = document.getElementById('myContainer');
var callback = function(flipPanel) { console.log(flipPanel) };
var myPanel = new FlipPanel(destination, callback);
```

The `destination` DOM will be completely filled (height and width) by the FlipPanel; the only requirement is that its position is **not** static (the default setting). The purpose of the `callback` function is to set any custom content for each individual tile (see the included examples for more details). The FlipPanel is created asynchronously, so it is **not** safe to assume it is ready to access immediately after the `new FlipPanel()` declaration.

### The opts parameter

The FlipPanel constructor accepts a third parameter, `opts`, that allows further configuration of the panel. Here is an example usage:

```js
new FlipPanel(destination, callback, { imgFront: 'panelFront.jpg', imgBack: 'panelBack.jpg', nx: 2, ny: 3 });
```

The `opts` parameter has the following optional fields:

|Field       |Value(s)        |Description                                                |
|------------|----------------|-----------------------------------------------------------|
|imgFront    |string          |The URL of the image to display as the front of the panel. |
|imgBack     |string          |The URL of the image to display as the back of the panel.  |
|nx          |integer         |The number of tiles to split the panel into horizontally.  |
|ny          |integer         |The number of tiles to split the panel into vertically.    |
|ruffleTimer |integer (in ms) |An optional timer to repeatedly "ruffle" the tiles.        |
|ruffleDelay |integer (in ms) |The delay to use when ruffling (affects the ruffle speed). |

It is standard to specify at least `imgFront`, `nx`, and `ny`. If `imgBack` is not specified, it will default to using the same image as `imgFront`.

#### The "ruffle"

The FlipPanel has a built-in method, `FlipPanel.ruffle()`, which causes the tiles to flip over in sequence, left-to-right and top-to-bottom. This can be a useful visual cue to help visitors understand that the FlipPanel is interactive, and not a static image.

`opts.ruffleTimer` allows you to set the panel to automatically ruffle at a set rate; providing a value of 0 will cause it to ruffle only once on load, and a value greater than 0 will be used (in milliseconds) as a timer for a recurring ruffle. `opts.ruffleDelay` allows you to fine-tune the speed of the ruffle; it has a default value of 120 ms, and smaller values will cause each ruffle to flip through the tiles faster.

## Dependencies

FlipPanel does not require any external JavaScript packages.

## Credits

- [Erik Koopmans](https://github.com/eKoopmans)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2017 Erik Koopmans <[http://www.erik-koopmans.com/](http://www.erik-koopmans.com/)>
