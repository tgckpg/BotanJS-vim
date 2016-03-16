(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.State.Stack} */
	var Stack = __import( "Components.Vim.State.Stack" );

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

	/* @param {Components.Vim.LineFeeder} */
	var ContentPosition = function( f )
	{
		var line = f.cursor.getLine();
		var n = line.lineNum;

		var p = 0;
		if( 0 < n )
		{
			p = f.content.indexOf( "\n" );
			for( i = 1; p != -1 && i < n; i ++ )
			{
				p = f.content.indexOf( "\n", p + 1 );
			}

			if( f.wrap )
			{
				// wordwrap offset
				p ++;
			}
		}

		p += f.cursor.aX;
		return p;
	};

	/** @type {Components.Vim.Cursor.IAction} */
	var INSERT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;

		// Initialize this stack
		this.__rec( "", true );
	};

	INSERT.prototype.dispose = function()
	{

	};

	INSERT.prototype.__storeState = function( c, pos )
	{
		return function() {
			debug.Inf( pos, c );
		};
	};

	INSERT.prototype.__rec = function( c, newRec )
	{
		if( newRec || !this.__stack )
		{
			if( this.__stack )
			{
				var c = this.__content;

				this.__stack.store(
					this.__storeState( c, this.__startPosition )
				);

				this.__cursor.rec.store( this.__stack );
			}

			this.__content = "";
			this.__stack = new Stack();
			this.__startPosition = ContentPosition( this.__cursor.feeder );
		}

		this.__content += c;
	};

	INSERT.prototype.handler = function( e )
	{
		e.preventDefault();
		var inputChar = Translate( e.key );

		if( inputChar.length != 1 ) return;

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var f = ContentPosition( feeder );

		feeder.content =
			feeder.content.substring( 0, f )
			+ inputChar
			+ feeder.content.substring( f );

		feeder.pan();
		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );

		this.__rec( inputChar );

		cur.moveX( 1 );
	};

	INSERT.prototype.getMessage = function()
	{
		var l = this.__cursor.feeder.firstBuffer.cols;
		var msg = Mesg( "INSERT" );

		for( var i = msg.length; i < l; i ++ ) msg += " ";
		return msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "INSERT", INSERT );
})();
