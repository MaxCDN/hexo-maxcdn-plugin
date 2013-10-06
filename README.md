# hexo-maxcdn-plugin

### Status

Currently expected to be in working state. Tests have passed, but hasn't been tested with Hexo.

### Configuration

See file `_maxcdn.yml`

* `domain`: Your MaxCDN domain.
* `enabled`: Accepts either an array of NODE_ENV strings, or boolean true for all environments.
* `cachebuster`: [optional] custom cachebuster. Will you datestamp of process execution time if not provided.

### Basic Usage

``` javascript
// path: string
// attributes: object [optional]
maxcdn(path, attributes);
```

Example:

``` jade
.image_div= maxcdn('/path/to/image.gif', { width: '100px', height: '100px', style: 'border:1px;' })
```

``` ejs
<div class="image_div">
    <%- maxcdn('/path/to/image.gif', { width: '100px', height: '100px', style: 'border:1px;' }) %>
</div>
```

Outputs:
``` html
<div class="image_div">
    <img src="//you.maxcdn.com/path/to/image.gif" height='100px' style="border:1px;" width="100px" />
</div>
```

> Note: Attributes will be sorted by name.

Supported extensions:
``` text
.css    yields   link
.ico    yields   link

.js     yields   script

.bmp    yields   img
.gif    yields   img
.jpg    yields   img
.jpeg   yields   img
.png    yields   img

.pdf    yields   embed
.svg    yields   embed
```

Default attributes:
``` text
css   adds   rel=stylesheet
ico   adds   rel=icon
js    adds   type=text/javascript
svg   adds   type=image/svg+xml
```

### Test Output

> Including test output until further documented.

``` text
  maxcdn-plugin                                                                                                                               [10/1366]
    helper methods
      processStarted
        + is a string
        + contains only numbers
        + is 13 characters long
        + is always the same (502ms)
      throwError
        + throws an error containing message
      fetch.version
        + pulls from config first
        + pulls from processStarted seconds
      fetch.source
        + pulls from config
        + throws error if config is undefined
      escape
        + escapes &
        + escapes <
        + escapes "
        + escapes '
      attributesFrom
        + creates attributes
        + turns false in to false string
        + allows for empty attributes using null
        + allows for empty attributes using undefined
        + allows for empty attributes using an empty string
    maxcdnify
      + throws error on unkown ext
      + .css yields link tag
      + .ico yields link tag
      + .js yields script tag
      + .bmp yields img tag
      + .gif yields img tag
      + .jpg yields img tag
      + .jpeg yields img tag
      + .png yields img tag
      + .pdf yields embed tag
      + .svg yields embed tag
      + css includes rel=stylesheet by default
      + ico includes rel=icon by default
      + js includes type=text/javascript by default
      + svg includes type=image/svg+xml by default
      + includes customs attrs
    config
      domain
        + includes domain
      enabled
        + accepts true
        + disables
      cachebuster
        + includes cachebuster


  38 passing (541ms)
```
