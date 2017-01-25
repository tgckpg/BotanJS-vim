/** @constructor */
Components.Vim.Cursor = function(){};

/** @type {Components.Vim.VimArea} */
Components.Vim.Cursor.Vim;
/** @type {Components.Vim.LineFeeder} */
Components.Vim.Cursor.feeder;
/** @type {Components.Vim.IAction} */
Components.Vim.Cursor.action;
/** @type {Components.Vim.State.Recorder} */
Components.Vim.Cursor.rec;

/** @type Function */
Components.Vim.Cursor.moveTo;
/** @type Function */
Components.Vim.Cursor.moveX;
/** @type Function */
Components.Vim.Cursor.moveY;
/** @type Function */
Components.Vim.Cursor.lineStart;
/** @type Function */
Components.Vim.Cursor.lineEnd;
/** @type Function */
Components.Vim.Cursor.updatePosition;
/** @type Function */
Components.Vim.Cursor.fixTab;
/** @type Function */
Components.Vim.Cursor.openAction;
/** @type Function */
Components.Vim.Cursor.openRunAction;
/** @type Function */
Components.Vim.Cursor.closeAction;
/** @type Function */
Components.Vim.Cursor.suppressEvent;
/** @type Function */
Components.Vim.Cursor.unsuppressEvent;

/** @type {Boolean} */
Components.Vim.Cursor.blink;
/** @type {Boolean} */
Components.Vim.Cursor.pSpace;
/** @type {Array} */
Components.Vim.Cursor.lineBuffers;
/** @type Number */
Components.Vim.Cursor.pX;
/** @type Number */
Components.Vim.Cursor.PStart;
/** @type Number */
Components.Vim.Cursor.PEnd;
/** @type Number */
Components.Vim.Cursor.aX;
/** @type Number */
Components.Vim.Cursor.X;
/** @type Number */
Components.Vim.Cursor.Y;
/** @type Number */
Components.Vim.Cursor.aPos;
/** @type Number */
Components.Vim.Cursor.cols;
/** @type message */
Components.Vim.Cursor.string;
/** @type Object */
Components.Vim.Cursor.position;
/** @type Number */
Components.Vim.Cursor.position.start;
/** @type Number */
Components.Vim.Cursor.position.end;
/** @type String */
Components.Vim.Cursor.rawLine;
