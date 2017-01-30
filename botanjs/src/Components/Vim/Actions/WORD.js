(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );
	var beep = __import( "Components.Vim.Beep" );

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
			if( p == 0 )
			{
				beep();
				return;
			}

			d = -1;

			while( " \t".indexOf( feeder.content[ p + d ] ) != -1 )
			{
				d --;
			}

			// No more results
			if( ( p + d ) == -1 )
			{
				p = 0;
			}
			else
			{
				var wordRange = analyzer.wordAt( p + d );
				if( wordRange.open != -1 )
				{
					p = wordRange.open;
				}

				// If the very first char is " " or "\t"
				if( " \t".indexOf( feeder.content[ p ] ) != -1 ) p ++;
			}
		}

		cur.moveTo( p );
	};

	WORD.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "WORD", WORD );
})();
