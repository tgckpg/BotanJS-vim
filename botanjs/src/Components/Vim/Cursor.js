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

		for( var i = 0, line = buffs[0];
			line && i < l; i ++ )
		{
			while( line )
			{
				if( line.br )
				{
					offset += line.prev.toString().length + 1;

					// Empty line has a special space
					if( line.content == "" ) offset ++;

					line = line.next;
					break;
				}
				else
				{
					if( offset == 0 ) offset -= 1;

					if( line.next && !line.next.br )
						offset += line.cols + 1;
				}

				line = line.next;
			}
		}

		debug.Info( offset );

		return offset;
	};

	var Cursor = function( buffs )
	{
		this.buffers = buffs;
		this.cols = buffs[0].cols;

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

		var buffs = this.buffers;

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
		/** @type {Components.Vim.LineBuffer} */
		this.moveX( Number.MAX_VALUE );
	};

	Cursor.prototype.updatePosition = function()
	{
		this.P = this.X + LineOffset( this.buffers, this.Y );
	};

	Cursor.prototype.moveY = function( d )
	{
		this.Y += d;
		this.moveX();
		this.updatePosition();
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
