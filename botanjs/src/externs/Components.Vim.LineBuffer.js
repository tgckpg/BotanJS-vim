/** @constructor */
Components.Vim.LineBuffer = function(){};

/** @type {Components.Vim.LineBuffer} */
Components.Vim.LineBuffer.next;
/** @type {Components.Vim.LineBuffer} */
Components.Vim.LineBuffer.prev;
/** @type {Components.Vim.LineBuffer} */
Components.Vim.LineBuffer.nextLine;

/** @type EventDispatcher */
Components.Vim.LineBuffer.dispatcher;

/** @type Function */
Components.Vim.LineBuffer.softReset;
/** @type Function */
Components.Vim.LineBuffer.pan;
/** @type Function */
Components.Vim.LineBuffer.render;
/** @type Function */
Components.Vim.LineBuffer.setRender;
/** @type Function */
Components.Vim.LineBuffer.init;
/** @type Function */
Components.Vim.LineBuffer.setWrap;

/** @type Array */
Components.Vim.LineBuffer.visualLines;
/** @type Boolean */
Components.Vim.LineBuffer.placeholder;
/** @type Boolean */
Components.Vim.LineBuffer.br;
/** @type Number */
Components.Vim.LineBuffer.cols;
/** @type Number */
Components.Vim.LineBuffer.lineNum;
/** @type Number */
Components.Vim.LineBuffer.tabWidth;
/** @type Number */
Components.Vim.LineBuffer.linesOccupied;
/** @type String */
Components.Vim.LineBuffer.content;
