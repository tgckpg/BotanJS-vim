(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {Components.Vim.State.Stack} */
	var Stack                                 = __import( "Components.Vim.State.Stack" );
	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

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
		this.__rec( "", true );
	};

	INSERT.prototype.__storeState = function()
	{
		var cur = this.__cursor;
		var feeder = cur.feeder;
		var insertLength = this.__insertLength;
		var contentUndo = this.__contentUndo;
		var startPos = this.__startPosition;

		if( insertLength < 0 )
		{
			startPos += insertLength;
			insertLength = 0;
		}

		return function() {
			var contentRedo = feeder.content.substr( startPos, insertLength );
			feeder.content =
				feeder.content.substring( 0, startPos )
				+ contentUndo
				+ feeder.content.substring( startPos + insertLength );
			insertLength = contentUndo.length;
			contentUndo = contentRedo;

			feeder.pan();
		};
	};

	INSERT.prototype.__rec = function( c, newRec )
	{
		if( newRec || !this.__stack )
		{
			if( this.__stack )
			{
				// If nothings changed
				if( this.__insertLength == 0
					&& this.__contentUndo === ""
				) return;

				this.__stack.store(
					this.__storeState()
				);

				this.__cursor.rec.record( this.__stack );
			}

			this.__insertLength = 0;
			this.__contentUndo = "";
			this.__stack = new Stack();
			this.__startPosition = ContentPosition( this.__cursor.feeder );
		}

		this.__insertLength += c.length;
	};

	INSERT.prototype.__specialKey = function( e, inputChar )
	{
		var cur = this.__cursor;
		var feeder = cur.feeder;

		switch( e.keyCode )
		{
			case 8: // Backspace
				if( cur.X == 0 ) return;

				cur.moveX( -1 );

				var f = ContentPosition( feeder );

				this.__contentUndo = feeder.content.substr( f, 1 ) + this.__contentUndo;
				this.__insertLength --;

				feeder.content =
					feeder.content.substring( 0, f )
					+ feeder.content.substring( f + 1 );

				break;
			case 46: // Delete
				var f = ContentPosition( feeder );

				this.__contentUndo += feeder.content.substr( f, 1 );
				this.__insertLength ++;

				feeder.content =
					feeder.content.substring( 0, f )
					+ feeder.content.substring( f + 1 );

				break;
			default:
				// Do nothing
				return;
		}

		feeder.pan();
		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	INSERT.prototype.handler = function( e )
	{
		e.preventDefault();
		var inputChar = Translate( e.key );

		if( inputChar.length != 1 )
		{
			this.__specialKey( e, inputChar );
			return;
		}

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
