(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );
	/** @type {Components.Vim.State.Stator} */
	var Stator                                 = __import( "Components.Vim.State.Stator" );
	/** @type {System.Debug} */
	var debug                                  = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );

	var Translate = function( c )
	{
		switch( c )
		{
			case "Tab":
				return "\t";
			case "Enter":
				return "\n";
			default:
				return c;
		}
	};

	/** @type {Components.Vim.Cursor.IAction} */
	var INSERT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;

		this.__stator = new Stator( Cursor );

		// Initialize this stack
		this.__rec( "", true );

		var l = this.__cursor.feeder.firstBuffer.cols;
		var msg = Mesg( "INSERT" );

		for( var i = msg.length; i < l; i ++ ) msg += " ";
		this.__msg = msg;
	};

	INSERT.prototype.allowMovement = false;

	INSERT.prototype.dispose = function()
	{
		this.__msg = "";
		this.__rec( "", true );
		this.__cursor.moveX( -1 );
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
					this.__stator.save( this.__insertLength, this.__contentUndo )
				);

				this.__cursor.rec.record( this.__stack );
			}

			this.__insertLength = 0;
			this.__contentUndo = "";
			this.__stack = new Stack();
		}

		if( c == "\n" )
		{
			// todo
		}

		this.__insertLength += c.length;
	};

	INSERT.prototype.__specialKey = function( e, inputChar )
	{
		var cur = this.__cursor;
		var feeder = cur.feeder;

		// Backspace
		if( e.kMap( "BS" ) )
		{
			var oY = feeder.panY + cur.Y;
			if( cur.X == 0 && feeder.panY == 0 && cur.Y == 0 ) return;

			cur.moveX( -1, true, true );

			var f = cur.aPos;

			if( this.__insertLength <= 0 )
			{
				this.__contentUndo = feeder.content.substr( f, 1 ) + this.__contentUndo;
			}

			feeder.content =
				feeder.content.substring( 0, f )
				+ feeder.content.substring( f + 1 );

			this.__insertLength --;
		}
		else if( e.kMap( "Del" ) )
		{
			var f = cur.aPos;

			this.__contentUndo += feeder.content.substr( f, 1 );

			feeder.content =
				feeder.content.substring( 0, f )
				+ feeder.content.substring( f + 1 );
		}
		else return;

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

		var f = cur.aPos;

		feeder.content =
			feeder.content.substring( 0, f )
			+ inputChar
			+ feeder.content.substring( f );

		if( inputChar == "\n" )
		{
			feeder.softReset();
			feeder.pan();
			cur.moveY( 1 );
			cur.lineStart();
		}
		else
		{
			feeder.pan();
			cur.moveX( 1, false, true );
		}

		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );

		this.__rec( inputChar );

	};

	INSERT.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "INSERT", INSERT );
})();
