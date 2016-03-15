(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );
	var Mesg = __import( "Components.Vim.Message" );

	var Translate = function( c )
	{
		switch( c )
		{
			case "Tab":
				return "\t";
			default:
				return c;
		}
	};

	/** @type {Components.Vim.Cursor.IAction} */
	var INSERT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.cursor = Cursor;
	};

	INSERT.prototype.dispose = function()
	{
	};

	INSERT.prototype.handler = function( e )
	{
		e.preventDefault();
		var inputChar = Translate( e.key );

		if( inputChar.length != 1 ) return;

		var cur = this.cursor;
		var feeder = cur.feeder;

		var line = cur.getLine();
		var n = line.lineNum;

		var cont = feeder.content;

		var f = 0;
		if( 0 < n )
		{
			f = cont.indexOf( "\n" );
			for( i = 1; f != -1 && i < n; i ++ )
			{
				f = cont.indexOf( "\n", f + 1 );
			}

			if( this.cursor.feeder.wrap )
			{
				// wordwrap offset
				f ++;
			}
		}

		f += cur.aX;

		feeder.content = cont.substring( 0, f ) + inputChar +  cont.substring( f );
		feeder.pan();
		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );

		cur.moveX( 1 );
	};

	INSERT.prototype.getMessage = function()
	{
		var l = this.cursor.feeder.firstBuffer.cols;
		var msg = Mesg( "INSERT" );

		for( var i = msg.length; i < l; i ++ ) msg += " ";
		return msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "INSERT", INSERT );
})();
