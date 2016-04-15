(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.IAction} */
	var UNDO = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__message = "UNDO COMMAND";
	};

	UNDO.prototype.dispose = function()
	{

	};

	UNDO.prototype.handler = function( e )
	{
		e.preventDefault();

		/** @type {Components.Vim.State.Stack} */
		var stack = this.__cursor.rec.undo();
		if( stack )
		{
			this.__cursor.suppressEvent();
			stack.play();
			this.__cursor.unsuppressEvent();
			this.__message = Mesg( "NCHANGES", "<TODO>", stack.id, stack.time );
		}
		else
		{
			this.__message = Mesg( "UNDO_LIMIT" );
		}
	};

	UNDO.prototype.getMessage = function()
	{
		return this.__message;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "UNDO", UNDO );
})();
