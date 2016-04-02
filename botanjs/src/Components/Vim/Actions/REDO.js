(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.IAction} */
	var REDO = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__message = "REDO COMMAND";
	};

	REDO.prototype.dispose = function()
	{

	};

	REDO.prototype.handler = function( e )
	{
		e.preventDefault();

		/** @type {Components.Vim.State.Stack} */
		var stack = this.__cursor.rec.redo();
		if( stack )
		{
			stack.play();
			this.__message = "<<TODO>>; before #" + stack.id + "  " + stack.time;
		}
		else
		{
			this.__message = Mesg( "REDO_LIMIT" );
		}
	};

	REDO.prototype.getMessage = function()
	{
		return this.__message;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "REDO", REDO );
})();
