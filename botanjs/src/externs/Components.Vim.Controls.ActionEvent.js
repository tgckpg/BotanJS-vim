/** @constructor */
Components.Vim.Controls.ActionEvent = function(){};

/** @type {Components.Vim.VimArea} */
Components.Vim.Controls.ActionEvent.target;
/** @type {Components.Vim.Syntax.TokenMatch} */
Components.Vim.Controls.ActionEvent.range;
/** @type {Components.Vim.Syntax.Number} */
Components.Vim.Controls.ActionEvent.count;
/** @type String */
Components.Vim.Controls.ActionEvent.key;
/** @type Boolean */
Components.Vim.Controls.ActionEvent.ModKeys;
/** @type Boolean */
Components.Vim.Controls.ActionEvent.Escape;
/** @type Boolean */
Components.Vim.Controls.ActionEvent.canceled;
/** @type Number */
Components.Vim.Controls.ActionEvent.keyCode;
/** @type Function */
Components.Vim.Controls.ActionEvent.kMap;
/** @type Function */
Components.Vim.Controls.ActionEvent.cancel;
