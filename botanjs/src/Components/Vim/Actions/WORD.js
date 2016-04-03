(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	/** @type {Components.Vim.IAction} */
	var WORD = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "<WORD COMMAND>";
		Cursor.suppressEvent();
	};

	WORD.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	WORD.prototype.handler = function( e )
	{
		e.preventDefault();

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var analyzer = cur.Vim.contentAnalyzer;
		var p = cur.aPos;


		var d = 1;
		// forward
		if( e.kMap( "w" ) || e.kMap( "W" ) )
		{
			if( feeder.content[ p + 1 ] == "\n" )
			{
				p ++;
			}

			var wordRange = analyzer.wordAt( p );
			if( wordRange.open != -1 )
			{
				p = wordRange.close + 1;
			}
		}
		// Backward
		if( e.kMap( "b" ) || e.kMap( "B" ) )
		{
			if( p == 0 ) return;
			d = -1;

			var wordRange = analyzer.wordAt( p - 1 );
			if( wordRange.open != -1 )
			{
				p = wordRange.open;
			}
		}

		while( " \t".indexOf( feeder.content[ p ] ) != -1 )
		{
			p += d;
		}

		cur.moveTo( p );
	};

	WORD.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "WORD", WORD );
})();
