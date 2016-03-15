/** @constructor */
Components.Vim.LineFeeder = function(){};

/** @type {Components.Vim.Cursor} */
Components.Vim.LineFeeder.cursor;
/** @type {Components.Vim.LineBuffer} */
Components.Vim.LineFeeder.firstBuffer;
/** @type {Components.Vim.LineBuffer} */
Components.Vim.LineFeeder.lastBuffer;

/** @type EventDispatcher */
Components.Vim.LineFeeder.dispatcher;

/** @type Function */
Components.Vim.LineFeeder.softReset;
/** @type Function */
Components.Vim.LineFeeder.pan;
/** @type Function */
Components.Vim.LineFeeder.render;
/** @type Function */
Components.Vim.LineFeeder.setRender;
/** @type Function */
Components.Vim.LineFeeder.init;
/** @type Function */
Components.Vim.LineFeeder.setWrap;

/** @type {Array} */
Components.Vim.LineFeeder.lineBuffers;
/** @type Boolean */
Components.Vim.LineFeeder.EOF;
/** @type Boolean */
Components.Vim.LineFeeder.wrap;
/** @type Number */
Components.Vim.LineFeeder.panX;
/** @type Number */
Components.Vim.LineFeeder.panY;
/** @type Number */
Components.Vim.LineFeeder.moreAt;
/** @type Number */
Components.Vim.LineFeeder.linesOccupied;
/** @type String */
Components.Vim.LineFeeder.docPos;
/** @type String */
Components.Vim.LineFeeder.lineStat;
/** @type {String} */
Components.Vim.LineFeeder.content;
