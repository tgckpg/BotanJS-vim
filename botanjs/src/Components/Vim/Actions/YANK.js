(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.Cursor.IAction} */
	var YANK = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
	};

	YANK.prototype.allowMovement = true;

	YANK.prototype.dispose = function()
	{

	};

	YANK.prototype.handler = function( e )
	{
		e.preventDefault();

	};

	YANK.prototype.getMessage = function()
	{
		return "<TODO> YANK COMMAND";
	};

	ns[ NS_EXPORT ]( EX_CLASS, "YANK", YANK );
})();
