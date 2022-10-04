# SeqScroll.js

Animate through HTML Elements as scrolling a web page.

## Demo

https://hoqn.github.io/seqscroll-js/example

## Install

- through NPM or YARN

```shell
npm install seqscroll-js

// or

yarn add seqscroll-js
```

- through CDN

```html
// Preparing...
```

- manually

Just clone this repository and load `seqscroll-js-0.1.0.js` + `seqscroll-js-0.1.0.css`.

(Or you can only use `seqscroll-js-0.1.0.ts`. .ts file includes CSS)

## Usage

1. Add `seqscroll-item` in your slides or anything you want to be animated when scrolling.

```HTML
<div class="slide slide-hero" seqscroll-item> ... </div>
```

2. Add `data-y` in your `seqscroll-item` elements.

```HTML
<div class="slide slide-hero" seqscroll-item data-y="0:800">
```

3. Add `