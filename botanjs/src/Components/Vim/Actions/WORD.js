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


		// Forword WORD start
		if( e.kMap( "w" ) || e.kMap( "W" ) )
		{
			// +2 because there is a closing "\n"
			if( feeder.content[ p + 2 ] == undefined )
			{
				beep();
				return;
			}

			var wordRange = analyzer.wordAt( p );
			if( wordRange.open != -1 )
			{
				p = wordRange.close + 1;

				while( " \t\n".indexOf( feeder.content[ p ] ) != -1 ) p ++;

				if( feeder.content[ p ] == undefined )
				{
					// This is the last character
					p --;
				}
			}
		}

		// Forward WORD end
		if( e.kMap( "e" ) || e.kMap( "E" ) )
		{
			if( feeder.content[ p + 2 ] == undefined )
			{
				beep();
				return;
			}

			p ++;
			while( " \t\n".indexOf( feeder.content[ p ] ) != -1 ) p ++;

			// This is the last character
			if( feeder.content[ p ] == undefined )
			{
				p --;
			}
			else
			{
				var wordRange = analyzer.wordAt( p );

				if( wordRange.open != -1 )
				{
					p = wordRange.close;
				}
			}
		}

		// Backward WORD start
		if( e.kMap( "b" ) || e.kMap( "B" ) )
		{
			if( p == 0 )
			{
				beep();
				return;
			}

			p --;
			while( " \t".indexOf( feeder.content[ p ] ) != -1 ) p --;

			// No more results
			if( p == -1 )
			{
				p = 0;
			}
			else
			{
				var wordRange = analyzer.wordAt( p );
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
