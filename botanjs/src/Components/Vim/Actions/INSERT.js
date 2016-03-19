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

		this.__startState = this.__saveCur();

		// Initialize this stack
		this.__rec( "", true );
	};

	INSERT.prototype.__saveCur = function()
	{
		var c = this.__cursor;
		return {
			p: c.P
			, x: c.X
			, y: c.Y
			, px: c.feeder.panX
			, py: c.feeder.panY
		};
	}

	INSERT.prototype.dispose = function()
	{
		this.__cursor.moveX( -1 );
		this.__rec( "", true );
	};

	INSERT.prototype.__storeState = function()
	{
		var cur = this.__cursor;
		var feeder = cur.feeder;
		var insertLength = this.__insertLength;
		var contentUndo = this.__contentUndo;
		var startPos = this.__startPosition;
		var sSt = this.__startState;
		var eSt = this.__saveCur();

		var st = sSt;
		// Calling this repeatedly will swap between UNDO / REDO state
		return function() {
			var contentRedo = feeder.content.substr( startPos, insertLength );
			feeder.content =
				feeder.content.substring( 0, startPos )
				+ contentUndo
				+ feeder.content.substring( startPos + insertLength );
			insertLength = contentUndo.length;
			contentUndo = contentRedo;

			cur.P = st.p;
			cur.X = st.x;
			cur.Y = st.y;
			feeder.panX = st.px;
			feeder.panY = st.py;

			feeder.pan();

			st = ( st == sSt ) ? eSt : sSt;
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
			this.__startPosition = this.__cursor.aPos;
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

		switch( e.keyCode )
		{
			case 8: // Backspace
				var oY = feeder.panY + cur.Y;
				if( cur.X == 0 && feeder.panY == 0 && cur.Y == 0 ) return;

				cur.moveX( -1, true, true );

				var f = cur.aPos;

				if( this.__insertLength <= 0 )
				{
					this.__contentUndo = feeder.content.substr( f, 1 ) + this.__contentUndo;
					this.__startPosition --;
				}
				else
				{
					this.__insertLength --;
				}

				feeder.content =
					feeder.content.substring( 0, f )
					+ feeder.content.substring( f + 1 );

				break;
			case 46: // Delete
				var f = cur.aPos;

				this.__contentUndo += feeder.content.substr( f, 1 );

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

		var f = cur.aPos;

		feeder.content =
			feeder.content.substring( 0, f )
			+ inputChar
			+ feeder.content.substring( f );

		feeder.pan();
		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );

		this.__rec( inputChar );

		if( inputChar == "\n" )
		{
			cur.moveY( 1 );
			cur.lineStart();
		}
		else
		{
			cur.moveX( 1 );
		}
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
