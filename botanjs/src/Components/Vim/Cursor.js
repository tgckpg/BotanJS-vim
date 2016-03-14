(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {Dandelion} */
	var Dand                                    = __import( "Dandelion" );
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                             = __import( "Dandelion.IDOMElement" );
	/** @type {Dandelion.IDOMObject} */
	var IDOMObject                              = __import( "Dandelion.IDOMObject" );
	/** @type {System.Cycle} */
	var Cycle                                   = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                                   = __import( "System.Debug" );

	var GetLine = function( buffs, l )
	{
		/** @type {Components.Vim.LineBuffer} */
		var LineHead = buffs[0];
		l ++;

		for( var i = 0, line = LineHead;
			line && i < l; i ++ )
		{
			LineHead = line;
			while( line )
			{
				line = line.next;
				if( line.br ) break;
			}
		}

		return LineHead;
	};

	var LineOffset = function( buffs, l )
	{
		/** @type {Components.Vim.LineBuffer} */
		var offset = 0;

		LineLoop:
		for( var i = 0, line = buffs[0];
			line && i < l; i ++ )
		{
			while( line )
			{
				if( line.next && line.next.placeholder )
					break LineLoop;

				// Using toString because tab is 1 byte 
				// but variable width
				offset += line.toString().length + 1;
				line = line.next;

				if( line && line.br ) break;
			}
		}

		return offset;
	};

	var Cursor = function( feeder )
	{
		/** @type {Components.Vim.LineFeeder} */
		this.feeder = feeder;

		this.cols = feeder.firstBuffer.cols;

		// The preferred X position
		this.pX = 0;

		// The displaying X position
		this.X = 0;

		// The current line resided
		this.Y = 0;

		// The resulting position
		this.P = 0;
	};

	// Can only be 1, -1
	// 0 will be treated as undefined
	Cursor.prototype.moveX = function( d )
	{
		var x = this.pX;

		var updatePx = Boolean( d );
		if( updatePx ) x = this.X + d;

		if( !d ) d = 1;

		var buffs = this.feeder.lineBuffers;

		/** @type {Components.Vim.LineBuffer} */
		var line = GetLine( buffs, this.Y );
		var content = line.visualLines.join( "\n" );

		var c = content[ x ];

		if( c == undefined )
		{
			x = d > 0 ? content.length - 1 : 0;
		}
		else if( c == "\n" )
		{
			x += d;
		}

		this.X = x;

		if( updatePx )
		{
			this.pX = x;
			this.updatePosition();
		}
	};

	Cursor.prototype.lineStart = function()
	{
		this.pX = 0;
		this.moveX();
		this.updatePosition();
	};

	Cursor.prototype.lineEnd = function()
	{
		this.moveX( Number.MAX_VALUE );
	};

	Cursor.prototype.updatePosition = function()
	{
		this.P = this.X + LineOffset( this.feeder.lineBuffers, this.Y );
		this.feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	Cursor.prototype.moveY = function( d )
	{
		var Y = this.Y + d;
		var line;

		if( Y < 0 )
		{
			this.feeder.pan( undefined, d );

			this.Y = 0;
			this.moveX();
			this.updatePosition();

			this.feeder.softReset();
			return;
		}
		else if( this.feeder.moreAt < Y )
		{
			var feeder = this.feeder;
			var lastLine = feeder.lastBuffer.lineNum;
			var lineShift = Y - feeder.moreAt;

			var i = 0;
			while( true )
			{
				feeder.pan( undefined, lineShift + i );

				// if it turns out to be the same line
				// before after panning
				// we keep scrolling it ( panning )
				// until the entire line cosumes the screen
				if( feeder.lastBuffer.lineNum == lastLine )
				{
					i ++;
				}
				else break;
			}

			// The line number cursor need to be in
			Y = lastLine + lineShift;

			// Calculate the visual line position
			for( i = 0, line = feeder.firstBuffer;
				line != feeder.lastBuffer;
				line = line.next )
			{
				if( line.br ) i ++;
				if( line.lineNum == Y ) break;
			}

			this.Y = i;
			// Keep original position after panning
			this.moveX();
			this.updatePosition();

			feeder.softReset();

			return;
		}
		else if ( 0 < d )
		{
			// If panning is forward
			// and next line does not exists
			line = this.getLine().nextLine;
			if( !line || line.placeholder )
			{
				// do nothing
				return;
			}
		}

		this.Y = Y;

		this.moveX();
		this.updatePosition();
	};

	Cursor.prototype.getLine = function()
	{
		var feeder = this.feeder;
		var line = feeder.firstBuffer;
		for( var i = 0;
			line != feeder.lastBuffer;
			line = line.next )
		{
			if( line.br ) i ++;
			if( this.Y == i ) break;
		}

		return line;
	};

	__readOnly( Cursor.prototype, "position", function()
	{
		return {
			start: this.P
			, end: this.P + 1
		};
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "Cursor", Cursor );
})();
