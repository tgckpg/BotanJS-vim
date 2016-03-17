(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	/** @type {Components.Vim.State.Recorder} */
	var Recorder = __import( "Components.Vim.State.Recorder" );

	var Actions = __import( "Components.Vim.Actions.*" );

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

		// State recorder
		this.rec = new Recorder();

		this.action = null;
	};

	// Can only be 1, -1
	// 0 will be treated as undefined
	Cursor.prototype.moveX = function( d, penentrate, phantomSpace )
	{
		var x = this.pX;

		var updatePx = Boolean( d );
		if( updatePx ) x = this.X + d;

		if( !d ) d = 1;

		var buffs = this.feeder.lineBuffers;

		if( penentrate && x < 0 && ( 0 < this.feeder.panY || 0 < this.Y ) )
		{
			this.moveY( -1 );
			this.lineEnd( phantomSpace );
			return;
		}

		/** @type {Components.Vim.LineBuffer} */
		var line = GetLine( buffs, this.Y );
		var content = line.visualLines.join( "\n" );
		var cLen = content.length;

		var c = content[ x ];

		// Include empty lines befor cursor end
		if( ( phantomSpace && cLen - 1 <= x ) || ( cLen == 1 && c == undefined ) )
		{
			x = d > 0 ? cLen - 1 : 0;
		}
		// ( 2 < cLen ) Exclude empty lines at cursor end
		else if( ( 2 < cLen && x == cLen - 1 && c == " " ) || c == undefined )
		{
			x = d > 0 ? cLen - 2 : 0;
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

	Cursor.prototype.lineEnd = function( phantomSpace )
	{
		this.moveX( Number.MAX_VALUE, false, phantomSpace );
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

	Cursor.prototype.openAction = function( name )
	{
		if( this.action ) this.action.dispose();
		this.action = new (Actions[ name ])( this );
		this.__pulseMsg = null;

		this.feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	Cursor.prototype.closeAction = function()
	{
		if( !this.action ) return;
		this.action.dispose();
		this.action = null;
		this.__pulseMsg = null;

		this.feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	Cursor.prototype.openRunAction = function( name, e )
	{
		/** @type {Components.Vim.IAction} */
		var action = new (Actions[ name ])( this );
		action.handler( e );
		this.__pulseMsg = action.getMessage();
		action.dispose();

		this.feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
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

	// The absX for current Line
	__readOnly( Cursor.prototype, "aX", function()
	{
		var X = this.X;
		var f = this.feeder;

		var w = 1;

		// Calculate wordwrap offset
		if( f.wrap )
		{
			var lines = this.getLine().visualLines;

			for( var i in lines )
			{
				/** @type {Components.Vim.LineBuffer} */
				var vline = lines[ i ];

				// Actual length
				var aLen = vline.content.toString().length;

				// Visual length
				var vLen = vline.toString().length;

				// Plus the "\n" character
				X -= vLen + 1;

				if( 0 <= X )
				{
					w += aLen;
				}
				else if( X < 0 )
				{
					w += X + vLen;
					break;
				}
			}
		}

		return w;
	} );

	// The absolute content position
	__readOnly( Cursor.prototype, "aPos", function()
	{
		var f = this.feeder;
		var line = this.getLine();
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

		p += this.aX;
		return p;
	} );

	__readOnly( Cursor.prototype, "message", function()
	{
		if( this.__pulseMsg )
		{
			var m = this.__pulseMsg;
			this.__pulseMsg = null;

			return m;
		}

		return this.action && this.action.getMessage();
	} );

	__readOnly( Cursor.prototype, "position", function()
	{
		return {
			start: this.P
			, end: this.P + 1
		};
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "Cursor", Cursor );
})();
