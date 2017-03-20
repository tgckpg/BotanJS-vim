(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var beep = __import( "Components.Vim.Beep" );

	/** @type {Components.Vim.IAction} */
	var MARK = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
	};

	MARK.prototype.dispose = function() { };

	MARK.prototype.handler = function( e, cmd )
	{
		e.preventDefault();

		/** @type {Components.Vim.State.Marks} */
		var marks = e.target.marks;

		var ccur = this.__cursor;
		if( cmd && cmd[0] )
		{
			marks.set( cmd.join( "" ).trim(), ccur.getLine().lineNum, ccur.aX );
		}
		else
		{
			marks.set( e.key, ccur.getLine().lineNum, ccur.aX );
		}

		return true;
	};

	MARK.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "MARK", MARK );
})();
