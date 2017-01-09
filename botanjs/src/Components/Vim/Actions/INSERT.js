(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );
	/** @type {Components.Vim.State.Stator} */
	var Stator                                 = __import( "Components.Vim.State.Stator" );
	/** @type {System.Debug} */
	var debug                                  = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );

	// Phantom indent
	var IN_START = 0;
	var IN_END = 1;
	var IN_DEL = 2;

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

	/** @type {Components.Vim.IAction} */
	var INSERT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;

		this.__stator = new Stator( Cursor );
		this.__minReach = 0;
		this.__insertLen = 0;
		this.__chopIndent = false;

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
		if( this.__chopIndent ) this.__realizeIndent();
		if( this.__cancelIndent() )
		{
			this.__cursor.feeder.pan();
		}
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
				if( this.__minReach == 0
					&& this.__punch == 0
					&& this.__contentUndo === ""
				) return;

				if( this.__punch < this.__minReach )
				{
					this.__minReach = this.__punch;
				}

				this.__stack.store(
					this.__stator.save(
						this.__insertLen
						, this.__contentUndo
						, -this.__minReach )
				);

				this.__cursor.rec.record( this.__stack );
			}

			this.__punch = 0;
			this.__contentUndo = "";
			this.__stack = new Stack();
		}

		if( c == "\n" )
		{
			// todo
		}

		if( this.__punch < this.__minReach )
		{
			this.__insertLen = 0;
			this.__minReach = this.__punch;
		}

		this.__punch += c.length;
		this.__insertLen += c.length;
	};

	INSERT.prototype.__specialKey = function( e, inputChar )
	{
		var cur = this.__cursor;
		var feeder = cur.feeder;

		// Backspace
		if( e.kMap( "BS" ) || e.kMap( "S-BS" ) )
		{
			this.__realizeIndent();
			var oY = feeder.panY + cur.Y;
			if( cur.X == 0 && feeder.panY == 0 && cur.Y == 0 ) return;

			var f = cur.aPos - 1;

			if( this.__punch <= this.__minReach )
			{
				this.__contentUndo = feeder.content.substr( f, 1 ) + this.__contentUndo;
			}

			feeder.content =
				feeder.content.substring( 0, f )
				+ feeder.content.substring( f + 1 );

			feeder.pan();

			cur.moveX( -1, true, true );

			if( 0 < this.__insertLen ) this.__insertLen --;
			this.__punch --;
		}
		else if( e.kMap( "Del" ) || e.kMap( "S-Del" ) )
		{
			this.__realizeIndent();
			var f = cur.aPos;

			this.__contentUndo += feeder.content.substr( f, 1 );

			feeder.content =
				feeder.content.substring( 0, f )
				+ feeder.content.substring( f + 1 );

			feeder.pan();
		}
		else return;

		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	INSERT.prototype.handler = function( e )
	{
		e.preventDefault();

		if( e.ModKeys ) return;

		var inputChar = Translate( e.key );

		if( inputChar.length != 1 )
		{
			this.__specialKey( e, inputChar );
			return;
		}

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var f = cur.aPos;

		var chopIndent = feeder.content[ f ] != "\n";

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
			this.__autoIndent( e );
			this.__chopIndent = chopIndent;
		}
		else
		{
			this.__realizeIndent();
			feeder.pan();
			cur.moveX( inputChar == "\t" ? feeder.firstBuffer.tabWidth : 1, false, true );
		}

		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );

		this.__rec( inputChar );
	};

	INSERT.prototype.__realizeIndent = function()
	{
		var ind = this.__phantomIndent;
		if( !this.__phantomIndent ) return;

		debug.Info( "Realize Indentation: " + ind );

		l = ind[ IN_END ];
		for( var i = ind[ IN_START ]; i < l; i ++ )
		{
			this.__rec( this.__cursor.feeder.content[ i ] );
		}
		this.__contentUndo = ind[ IN_DEL ] + this.__contentUndo;
		this.__phantomIndent = null;
	};

	INSERT.prototype.__autoIndent = function( e )
	{
		var oInd = this.__phantomIndent;
		var carried = this.__cancelIndent();

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var f = cur.aPos;

		// Get the last indent
		var i = feeder.content.lastIndexOf( "\n", f - 2 );
		var line = feeder.content.substring( i + 1, f - 1 ) || carried;

		// Find Last indent
		while( line == "" && 0 < i )
		{
			var j = i;
			i = feeder.content.lastIndexOf( "\n", j - 2 );
			line = feeder.content.substring( i + 1, j - 1 );
		}

		var inDel = carried ? oInd[ IN_DEL ] : "";
		// Indent removed
		for( var ir = f; "\t ".indexOf( feeder.content[ ir ] ) != -1; ir ++ )
		{
			inDel += feeder.content[ ir ];
		}

		// Copy the indentation
		for( i = 0; "\t ".indexOf( line[i] ) != -1; i ++ );

		if( line )
		{
			feeder.content =
				feeder.content.substring( 0, f )
				+ line.substr( 0, i )
				+ feeder.content.substring( ir );

			feeder.softReset();
			feeder.pan();
			cur.moveX( i * feeder.firstBuffer.tabWidth, false, true );

			var a = [];
			a[ IN_START ] = f;
			a[ IN_END ] = f + i;
			a[ IN_DEL ] = inDel;

			this.__phantomIndent = a;
			debug.Info( "Phantom indent: " + a );
		}
	};

	INSERT.prototype.__cancelIndent = function()
	{
		var ind = this.__phantomIndent;
		if( !ind ) return "";

		debug.Info( "Erase phantom indent: " + ind );

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var canceled = feeder.content.substring( ind[ IN_START ], ind[ IN_END ] );
		feeder.content =
			feeder.content.substring( 0, ind[ IN_START ] )
			+ feeder.content.substring( ind[ IN_END ] );

		this.__phantomIndent = null;

		return canceled;
	}

	INSERT.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "INSERT", INSERT );
})();
