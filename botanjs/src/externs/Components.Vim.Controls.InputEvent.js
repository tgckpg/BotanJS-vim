/** @constructor */
Components.Vim.Controls.InputEvent = function(){};

/** @type {Components.Vim.VimArea} */
Components.Vim.Controls.InputEvent.target;
/** @type {Components.Vim.Syntax.TokenMatch} */
Components.Vim.Controls.InputEvent.range;
/** @type String */
Components.Vim.Controls.InputEvent.key;
/** @type Boolean */
Components.Vim.Controls.InputEvent.ModKeys;
/** @type Boolean */
Components.Vim.Controls.InputEvent.Escape;
/** @type Number */
Components.Vim.Controls.InputEvent.keyCode;
/** @type Function */
Components.Vim.Controls.InputEvent.kMap;
