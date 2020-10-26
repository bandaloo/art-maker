# artmaker

Maybe you want a wobbly Earthbound-style background for your HTML5 gamejam
game without much effort, or perhaps you just want a cool visual for your
website. Either way, artmaker can help. Recently, I used it to add some style
to this game prototype you can play in the browser
[here](https://www.bandaloo.fun/forward/).

# [live example](https://www.bandaloo.fun/art-maker)

The live example is also a good way to find cool patterns. By copying the
seed (logged to the developer console) you can replicate the same pattern.

# usage

You can use artmaker as a node module or directly in the browser.

## with build tools

If you are familiar with npm, browserify and maybe TypeScript, the absolute best
way to use this is to install it with `npm install artmaker` and import it like:

```javascript
import ArtMaker from "./index";
```

## with script tag

Of course, you can also simply include it as a script:

```html
<script src="artmaker.min.js"></script>
```

For a complete example, see the file `scriptexample.html`.

## general usage

You can add the canvas to the DOM and animate it with this:

```javascript
const artMaker = new ArtMaker();
artMaker.art();
```

This will add a canvas to the div with the id `"art"`:

```html
<div id="art"></div>
```

The new canvas will have an id of `"artcanvas"` so you can style it easily
with CSS:

```css
#artcanvas {
  width: 100%;
  border: 2px solid pink;
  /* this gives a nice crisp blocky effect when the canvas has a
  low resolution and is scaled up */
  image-rendering: pixelated;
}
```

You can pass in more arguments to the constructor to change the resolution
and the ids of the elements. These are the defaults:

```javascript
const artMaker = new ArtMaker(1920, 1080, "art", "artcanvas");
```

If you want to get the same pattern, you can seed the random generation by
passing in a string to `art`:

```javascript
artMaker.art("foo");
```

Note that before 1.0, the generative algorithm might change, thus breaking
seeds you might have saved from previous versions. If you save a shareable
link from the [live demo](https://www.bandaloo.fun/art-maker) and try to
visit it again after the algorithm has been updated, you'll be notified with
an alert.

# some thoughts and acknowledgements

If you play with this library and find that you want some greater control
over the output for practical purposes, maybe locked/unlocked framerate and
timing options, let me know by creating an issue. If you happen to find a use
for this weird project, let me know as well.

This project was started for a seminar on Generative Design taught by Gillian
Smith. It also makes use two other libraries I wrote,
[merge-pass](https://www.bandaloo.fun/merge-pass/example.html) and
[postpre](https://www.bandaloo.fun/postpre/example.html) which were
originally created to add post-processing effects to Charlie Robert's
[marching.js](https://charlieroberts.github.io/marching/playground/).
