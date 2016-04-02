(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var VimError = __import( "Components.Vim.Error" );

	var occurance = __import( "System.utils.Perf.CountSubstr" );

	var ESCAPE = function( reg )
	{
		var str = reg.toString();
		return str.replace( "\t", "^I" ).replace( "\n", "^J" );
	};

	/** @type {Components.Vim.IAction} */
	var QUIT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	QUIT.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	QUIT.prototype.handler = function( e, p )
	{
		e.preventDefault();

		var cur = this.__cursor;
		var Vim = cur.Vim;

		if( cur.rec.changed )
		{
			var msg = VimError( "E37" );

			var l = this.__cursor.feeder.firstBuffer.cols;
			for( var i = msg.length; i < l; i ++ ) msg += " ";

			this.__msg = msg;
		}
		else
		{
			Vim.dispose();
			return true;
		}
	};

	QUIT.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "QUIT", QUIT );
})();
