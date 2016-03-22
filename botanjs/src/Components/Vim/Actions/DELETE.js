(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.Cursor.IAction} */
	var DELETE = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
	};

	DELETE.prototype.allowMovement = true;

	DELETE.prototype.dispose = function()
	{

	};

	DELETE.prototype.handler = function( e )
	{
		e.preventDefault();

	};

	DELETE.prototype.getMessage = function()
	{
		return "<TODO> DELETE COMMAND";
	};

	ns[ NS_EXPORT ]( EX_CLASS, "DELETE", DELETE );
})();
