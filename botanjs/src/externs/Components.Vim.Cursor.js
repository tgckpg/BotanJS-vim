/** @constructor */
Components.Vim.Cursor = function(){};

/** @type {Components.Vim.LineFeeder} */
Components.Vim.Cursor.feeder;
/** @type {Components.Vim.IAction} */
Components.Vim.Cursor.action;

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
Components.Vim.Cursor.openAction;
/** @type Function */
Components.Vim.Cursor.closeAction;

/** @type {Array} */
Components.Vim.Cursor.lineBuffers;
/** @type Number */
Components.Vim.Cursor.pX;
/** @type Number */
Components.Vim.Cursor.P;
/** @type Number */
Components.Vim.Cursor.aX;
/** @type Number */
Components.Vim.Cursor.X;
/** @type Number */
Components.Vim.Cursor.Y;
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
