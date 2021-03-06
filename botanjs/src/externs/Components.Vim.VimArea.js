/** @constructor
 *  @extends {EventDispatcher}
 */
Components.Vim.VimArea = function(){};

/** @type {Components.Vim.LineFeeder} */
Components.Vim.VimArea.contentFeeder;
/** @type {Components.Vim.Syntax.Analyzer} */
Components.Vim.VimArea.contentAnalyzer;
/** @type {Components.Vim.LineFeeder} */
Components.Vim.VimArea.statusFeeder;
/** @type {Components.Vim.StatusBar} */
Components.Vim.VimArea.statusBar;

/** @type {Components.Vim.State.Registers} */
Components.Vim.VimArea.registers;
/** @type {Components.Vim.State.Marks} */
Components.Vim.VimArea.marks;

/** @type Function */
Components.Vim.VimArea.demo;
/** @type Function */
Components.Vim.VimArea.display;

/** @type Number */
Components.Vim.VimArea.index;
/** @type Number */
Components.Vim.VimArea.rows;
/** @type Number */
Components.Vim.VimArea.cols;
/** @type Array */
Components.Vim.VimArea.Instances;
/** @type Function */
Components.Vim.VimArea.dispose;
