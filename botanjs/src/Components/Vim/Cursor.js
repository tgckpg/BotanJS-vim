(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	/** @type {Components.Vim.State.Recorder} */
	var Recorder = __import( "Components.Vim.State.Recorder" );

	var Actions = __import( "Components.Vim.Actions.*" );

	var occurence = __import( "System.utils.Perf.CountSubstr" );

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

		if( !line )
		{
			line = c.feeder.firstBuffer;
			i = 0;
			l = d;
		}

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
		// i.e. last line was at pos 23
		// moving to next line will prefer pos at 23
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
	Cursor.prototype.moveTo = function( aPos, phantomSpace, skipTabs )
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

		var kX = jumpX - pline.content.length;
		while( 0 < kX )
		{
			jumpX ++;
			pline = pline.next
			if(!( pline && pline.lineNum == expLineNum )) break;
			kX -= pline.content.length;
		}

		if( jumpY ) this.moveY( jumpY );

		// This is needed because first line does not contain the first "\n" character
		if( 0 < this.getLine().lineNum && lineStart <= aPos ) jumpX --;

		this.moveX( - Number.MAX_VALUE, false, false, true );
		this.moveX( jumpX, false, phantomSpace, skipTabs );
	};

	// 0 will be treated as default ( 1 )
	Cursor.prototype.moveX = function( d, penetrate, phantomSpace, skipTab )
	{
		var x = this.pX;
		var updatePx = Boolean( d );

		if( 0 < this.__off )
		{
			if( 0 < d && phantomSpace )
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
		var tabStep = line.tabWidth - 1;
		var rline = this.rawLine;
		var content = line.visualLines.join( "\n" );
		var cLen = content.length;

		var lineEnd = 0;
		var hasPhantomSpace = true;

		// Empty lines has length of 1
		// Need to compensate the lineEnd for phantomSpace
		// if length is 1 < and != line.cols
		if( 1 < cLen )
		{
			// Begin check if this line contains phantomSpace
			// hasPhantomSpace = 0 < ( rawLine.displayLength ) % cols
			hasPhantomSpace = 0 < ( rline.length + occurence( rline, "\t" ) * tabStep ) % line.cols;

			if( hasPhantomSpace )
			{
				lineEnd = phantomSpace ? cLen - 1 : cLen - 2;
			}
			else
			{
				lineEnd = phantomSpace ? cLen : cLen - 1;
			}
		}

		// Hacky tab compensations
		if( skipTab )
		{
			// Handles INSERT on first tab char
			if( penetrate && 0 < d )
			{
				if( ( content.length - 1 ) <= x )
				{
					this.moveY( 1 );
					this.X = 0;
					this.updatePosition();
					return;
				}
			}
		}
		else
		{
			// Handles INSERT on first tab char
			if( penetrate )
			{
				if( line.content[0] == "\t" && x < tabStep )
				{
					this.moveY( -1 );
					this.lineEnd( phantomSpace );
					return;
				}
			}

			var s = this.aX;
			var a = rline[ s + d ];
			var e = s;
			if( d < 0 )
			{
				if( rline[ s ] == "\t" )
				{
					x -= tabStep;
					if( x < 0 )
						x = tabStep;
				}

				s += d;

				var ntabs = occurence( rline.substring( s, e ), "\t" ) - 1;
				if( 0 < ntabs ) x -= ntabs * tabStep;
			}
			else if( updatePx ) // && 0 < d ( assuming d can never be 0 )
			{
				// Going from one line to next
				// linebreaks are *invisible*
				var isLF = ( content[ x ] == "\n" ) ? 1 : 0;

				if( s == 0 )
				{
					x = d;
					if ( rline[ 0 ] == "\t" )
					{
						x += tabStep;
					}
				}

				e += d;

				var ntabs = occurence( rline.substring( s + 1, e + 1 ), "\t" );
				if( 1 < ntabs && rline[ e ] == "\t" ) ntabs --;
				x += ntabs * tabStep + isLF;

				// Reset the distance to 1 as x is now calculated
				d = 1;
			}
			else // jk, non-X navigation. i.e., pX does not change
			{
				// s = 0, which is unused here
				e = x + d;
				x += ( occurence( rline.substring( 0, e ), "\t" ) ) * tabStep;
				x += Math.floor( x / line.cols );
				if( 1 < d ) x += d - 1;
			}
		}

		var c = content[ x ];

		// Whether x is at line boundary
		var boundary = c == undefined || ( cLen == x + 1 && c == " " );

		if( boundary )
		{
			x = 0 < x ? lineEnd : 0;

			// This happens on backspacing max filled lines on INSERT mode
			if( d < 0 && 0 < x )
			{
				boundary = false;
				x += d;
			}
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
			this.pX = this.aX;
			this.updatePosition();
		}

	};

	// fix the tab position
	Cursor.prototype.fixTab = function()
	{
		this.moveX( 1, false, true );
		this.moveX( -1 );
	};

	Cursor.prototype.lineStart = function( atWord )
	{
		if( atWord )
		{
			var a = this.rawLine.match( /^[ \t]+/g );
			this.pX = a ? a[0].length : 0;
		}
		else
		{
			this.pX = 0;
		}

		this.moveX();
		this.updatePosition();
	};

	Cursor.prototype.lineEnd = function( phantomSpace )
	{
		this.moveX( Number.MAX_VALUE, false, phantomSpace, true );
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
	Cursor.prototype.openAction = function( name, e )
	{
		if( this.action ) this.action.dispose();

		debug.Info( "openAction: " + name );

		this.action = new (Actions[ name ])( this, e );
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
	Cursor.prototype.openRunAction = function( name, e, arg1, arg2, arg3, arg4, arg5 )
	{
		debug.Info( "OpenRunAction: " + name );
		/** @type {Components.Vim.IAction} */
		var action = new (Actions[ name ])( this );
		action.handler( e, arg1, arg2, arg3, arg4, arg5 );
		this.__pulseMsg = action.getMessage();
		action.dispose();

		this.Vim.contentAnalyzer.reset();

		this.__visualUpdate();
	};

	Cursor.prototype.suppressEvent = function() { ++ this.__suppEvt; };
	Cursor.prototype.unsuppressEvent = function() { -- this.__suppEvt; };

	Cursor.prototype.getLine = function( display )
	{
		var feeder = this.feeder;
		var line = feeder.firstBuffer;
		var eBuffer = feeder.lastBuffer.next;
		for( var i = 0; line != eBuffer; line = line.next )
		{
			if( line.br ) i ++;
			if( this.Y == i )
			{
				// Return the display line
				if( display )
				{
					var x = this.aX + 1;
					while( 0 < ( x -= line.content.length ) )
					{
						if( !line.next ) return line;
						line = line.next;
					}
				}

				return line;
			}
		}

		return null;
	};

	__readOnly( Cursor.prototype, "rawLine", function()
	{
		var str = this.feeder.content;
		var lineNum = this.getLine().lineNum - 1;
		var i = str.indexOf( "\n" ), j = 0;

		for( ; 0 <= i; i = str.indexOf( "\n", i ), j ++ )
		{
			if( lineNum == j ) break;
			i ++;
		}

		if( j == 0 && i == -1 ) i = 0;

		var end = str.indexOf( "\n", i + 1 );
		return str.substring( i + 1, end );
	} );

	// The position offset relative to current line
	__readOnly( Cursor.prototype, "aX", function()
	{
		var X = this.X;
		var f = this.feeder;

		var w = 0;

		// Calculate wordwrap offset
		if( f.wrap )
		{
			var lines = this.getLine().visualLines;

			// Since w represent valid absX position
			// w couldn't handle INSERT at the line end with phantomSpace
			// because phantomSpace is not a valid character
			// So we calculate along with the phantomSpace here
			var phantomSpace = X;
			for( var i in lines )
			{
				/** @type {Components.Vim.LineBuffer} */
				var vline = lines[ i ];

				// Actual length
				var aLen = vline.content.length;

				// Visual length
				var vLen = vline.toString().length;

				// Plus the "\n" character
				X -= vLen + 1;

				if( 0 <= X )
				{
					w += aLen;
					phantomSpace -= 1 + occurence( vline.content, "\t" ) * ( vline.tabWidth - 1 );
				}
				else if( X < 0 )
				{
					X += vLen + 1;

					var rline = this.rawLine.substr( w );
					var l = rline.length;

					var j = 0;

					if( rline[ 0 ] == "\t" )
					{
						X -= vline.tabWidth - 1;
						phantomSpace -= vline.tabWidth - 1;
					}

					for( var i = 1; j < X && i < rline.length; i ++ )
					{
						if( rline[ i ] == "\t" )
						{
							X -= vline.tabWidth - 1;
							phantomSpace -= vline.tabWidth - 1;
						}
						j ++;
					}

					w += j;

					if( w < phantomSpace ) w = phantomSpace;
					break;
				}
			}
		}
		else return this.X;

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
