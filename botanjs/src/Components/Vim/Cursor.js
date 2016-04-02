(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	/** @type {Components.Vim.State.Recorder} */
	var Recorder = __import( "Components.Vim.State.Recorder" );

	var Actions = __import( "Components.Vim.Actions.*" );

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

	// Rush cursor to wanted position "d" then get the actual position
	var GetRushPos = function( c, d )
	{
		var line = c.getLine();
		var l = c.Y + d;
		var i = c.Y;

		// First line ( visual ) does not count
		if( line != c.feeder.firstBuffer ) i --;

		for( ; i < l; line = line.nextLine )
		{
			if( line.placeholder ) break;
			if( line.br ) i ++;
		}

		return i;
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
		this.PStart = 0;
		this.PEnd = 1;

		// State recorder
		this.rec = new Recorder();

		this.action = null;

		this.blink = true;
		this.pSpace = false;

		this.__suppEvt = 0;

		// Offset compensation for max filled wrapped line
		this.__off = 0;
	};

	// Set by VimArea
	Cursor.prototype.Vim;

	// Move to an absolute position
	Cursor.prototype.moveTo = function( aPos, phantomSpace )
	{
		var content = this.feeder.content;
		var pline = this.getLine();
		var lastLineNum = pline.lineNum;

		if( pline.placeholder )
		{
			lastLineNum = 0;
			this.Y = 0;
		}

		var expLineNum = 0;
		var lineStart = 0;
		for( var i = content.indexOf( "\n" ); 0 <= i ; i = content.indexOf( "\n", i ) )
		{
			if( aPos <= i )
			{
				break;
			}

			lineStart = i;
			i ++;
			expLineNum ++;
		}

		var jumpY = expLineNum - lastLineNum;
		var jumpX = aPos < lineStart ? lineStart - aPos : aPos - lineStart;

		jumpX += Math.ceil( jumpX / pline.cols ) - 1;

		if( jumpY ) this.moveY( jumpY );

		// This needed because first line does not contain first "\n" character
		if( 0 < this.getLine().lineNum && lineStart <= aPos ) jumpX --;

		this.moveX( - Number.MAX_VALUE );
		this.moveX( jumpX, false, phantomSpace );

	};

	// 0 will be treated as default ( 1 )
	Cursor.prototype.moveX = function( d, penetrate, phantomSpace )
	{
		var x = this.pX;
		var updatePx = Boolean( d );

		if( 0 < this.__off )
		{
			d += this.__off;
			this.__off = 0;
		}

		if( updatePx ) x = this.X + d;

		if( !d ) d = 1;

		var feeder = this.feeder;
		var buffs = feeder.lineBuffers;

		if( penetrate )
		{
			if( x < 0 && ( 0 < this.feeder.panY || 0 < this.Y ) )
			{
				this.moveY( -1 );
				this.lineEnd( phantomSpace );
				return;
			}
		}

		/** @type {Components.Vim.LineBuffer} */
		var line = this.getLine();
		var content = line.visualLines.join( "\n" );
		var cLen = content.length;

		var lineEnd = 0;
		var hasPhantomSpace = true;

		// Empty lines has length of 1
		// If length larger than a, need to compensate the lineEnd
		// for phantomSpace
		if( 1 < cLen )
		{
			// Begin check if whether this line contains phantomSpace
			var lineNum = line.lineNum - 1;
			var str = feeder.content;
			for( var i = str.indexOf( "\n" ), j = 0; 0 <= i; i = str.indexOf( "\n", i ), j ++ )
			{
				if( lineNum == j ) break;
				i ++;
			}

			if( j == 0 && i == -1 ) i = 0;

			var end = str.indexOf( "\n", i + 1 );
			end = end == -1 ? str.length : end;

			// Actual LineLength
			var hasPhantomSpace = 0 < ( end - i - 1 ) % line.cols;

			if( hasPhantomSpace )
			{
				lineEnd = phantomSpace ? cLen - 1 : cLen - 2;
			}
			else
			{
				lineEnd = phantomSpace ? cLen : cLen - 1;
			}
		}

		var c = content[ x ];

		// Whether x is at line boundary
		var boundary = c == undefined || ( cLen == x + 1 && c == " " );

		if( boundary )
		{
			x = 0 < d ? lineEnd : 0;
		}
		else if( c == "\n" )
		{
			x += d;
		}

		// Wordwrap phantomSpace movement compensation on max filled lines
		if( feeder.wrap && boundary && !hasPhantomSpace && phantomSpace )
		{
			this.__off = 1;
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
		var feeder = this.feeder;
		var P = this.X + LineOffset( feeder.lineBuffers, this.Y ) + this.__off;

		this.PStart = P;
		this.PEnd = P + 1;

		this.__visualUpdate();
	};

	Cursor.prototype.__visualUpdate = function()
	{
		if( 0 < this.__suppEvt )
		{
			debug.Info( "Event suppressed, suppression level is: " + this.__suppEvt );
			return;
		}
		this.feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	Cursor.prototype.moveY = function( d )
	{
		var i;
		var Y = this.Y + d;
		var feeder = this.feeder;
		var line;

		if( Y < 0 )
		{
			feeder.pan( undefined, Y );

			this.Y = 0;
			this.moveX();
			this.updatePosition();

			feeder.softReset();
			return;
		}
		// More at bottom, start panning
		else if( !feeder.EOF && feeder.moreAt < Y )
		{
			var feeder = this.feeder;

			if( feeder.linesTotal < Y )
			{
				while( !feeder.EOF )
				{
					feeder.pan( undefined, 1 );
				}

				i = GetRushPos( this, d );
			}
			else
			{
				var lastLine = feeder.lastBuffer.lineNum;
				var lineShift = Y - feeder.moreAt;
				var thisLine = this.getLine().lineNum;

				if( !feeder.EOF )
					feeder.pan( undefined, lineShift );

				// The line number cursor need to be in
				Y = thisLine + d;

				// if it turns out to be the same line
				// OR the cursor can not reside on the needed line
				// before after panning
				// we keep scrolling it ( panning )
				// until the entire line cosumes the screen
				while( !feeder.EOF && (
					feeder.lastBuffer.lineNum == lastLine
					||  feeder.lastBuffer.lineNum < Y
				) )
				{
					feeder.pan( undefined, 1 );
				}

				i = this.Y;
				this.Y = 0;
				// Calculate the visual line position "i"
				for( var line = this.getLine();
					line && line.lineNum != Y && !line.placeholder;
					this.Y ++, line = this.getLine() )
				{
				}

				i = this.Y;

				// Check if this line is collapsed
				if( !feeder.EOF && feeder.lastBuffer.next.lineNum == line.lineNum )
				{
					// If yes, step back to last visible line
					i --;
				}
			}

			this.Y = i;
			// Keep original position after panning
			this.moveX();
			this.updatePosition();

			// Because it is panned, soft reset is needed
			feeder.softReset();

			return;
		}
		else if ( 0 < d )
		{
			var line = this.getLine();
			// If already at bottom
			if( line.nextLine.placeholder ) return;

			Y = GetRushPos( this, d );
		}

		this.Y = Y;

		this.moveX();
		this.updatePosition();
	};

	// Open an action handler
	// i.e. YANK, VISUAL, INSERT, UNDO, etc.
	Cursor.prototype.openAction = function( name )
	{
		if( this.action ) this.action.dispose();

		debug.Info( "openAction: " + name );

		this.action = new (Actions[ name ])( this );
		this.__pulseMsg = null;

		this.__visualUpdate();
	};

	Cursor.prototype.closeAction = function()
	{
		if( !this.action ) return;
		this.action.dispose();
		this.__pulseMsg = this.action.getMessage();
		this.action = null;

		debug.Info( "closeAction: " + this.__pulseMsg );

		// Reset the analyzed content
		this.Vim.contentAnalyzer.reset();

		this.__visualUpdate();
	};

	// Open, Run, then close an action
	Cursor.prototype.openRunAction = function( name, e, arg1 )
	{
		/** @type {Components.Vim.IAction} */
		var action = new (Actions[ name ])( this );
		action.handler( e, arg1 );
		this.__pulseMsg = action.getMessage();
		action.dispose();

		this.Vim.contentAnalyzer.reset();

		this.__visualUpdate();
	};

	Cursor.prototype.suppressEvent = function() { ++ this.__suppEvt; };
	Cursor.prototype.unsuppressEvent = function() { -- this.__suppEvt; };

	Cursor.prototype.getLine = function()
	{
		var feeder = this.feeder;
		var line = feeder.firstBuffer;
		var eBuffer = feeder.lastBuffer.next;
		for( var i = 0;
			line != eBuffer;
			line = line.next )
		{
			if( line.br ) i ++;
			if( this.Y == i ) return line;
		}

		return null;
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

	__readOnly( Cursor.prototype, "face", function() { return "\u2588"; } );

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
			start: this.PStart
			, end: this.PEnd
		};
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "Cursor", Cursor );
})();
