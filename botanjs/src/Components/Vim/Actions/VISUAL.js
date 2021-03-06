(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.IAction} */
	var YANK = ns[ NS_INVOKE ]( "YANK" );
	/** @type {Components.Vim.IAction} */
	var DELETE = ns[ NS_INVOKE ]( "DELETE" );
	/** @type {Components.Vim.IAction} */
	var SHIFT_LINES = ns[ NS_INVOKE ]( "SHIFT_LINES" );
	/** @type {Components.Vim.IAction} */
	var PUT = ns[ NS_INVOKE ]( "PUT" );

	var MODE_NULL = -1;
	var MODE_VISUAL = 0;
	var MODE_LINE = 1;

	// The offset of given line relative to content
	var offsetY = function( cur, l )
	{
		if( l == 0 ) return 0;

		var f = cur.feeder;

		var j = 0;

		var last = -1;
		for( var i = f.content.indexOf( "\n" ); 0 <= i; i = f.content.indexOf( "\n", i + 1 ) )
		{
			last = i;
			j ++;
			if( l <= j ) break;
		}

		if( f.EOF ) i = last;

		// "\n" compensation
		var c = f.content[ i + 1 ];
		if(!( c == undefined || c == "\n" ))
		{
			i ++;
		}

		return i;
	};

	var lineInfo = function( c )
	{
		return {
			lineNum: c.getLine().lineNum
			, aX: c.aX
		};
	};

	/** marker @type {Components.Vim.State.Marks} */
	var MarkSelected = function( marker, s, e )
	{
		marker.set( "<", s.lineNum, s.aX );
		marker.set( ">", e.lineNum, e.aX );
	};

	/** @type {Components.Vim.IAction} */
	var VISUAL = function( Cursor )
	{
		this.__reset( Cursor );
		this.__msg = "";

		Cursor.blink = false;
		Cursor.pSpace = true;
	};

	VISUAL.prototype.__reset = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;

		var s = lineInfo( Cursor );

		s.aPos = Cursor.aPos;
		s.X = Cursor.X;
		s.pStart = Cursor.PStart;
		s.aStart = s.aPos - s.aX;

		Cursor.suppressEvent();
		Cursor.lineEnd( true );

		s.aEnd = Cursor.aPos;

		Cursor.moveTo( s.aPos );
		Cursor.unsuppressEvent();

		this.__startLine = s;
	};

	VISUAL.prototype.allowMovement = true;

	VISUAL.prototype.dispose = function()
	{
		var c = this.__cursor;

		c.blink = true;
		c.pSpace = false;
		c.updatePosition();

		// This fix the highlighting position of missing phantomSpace
		// for maximum filled line
		if( c.feeder.wrap && 0 < c.X )
		{
			c.suppressEvent();
			c.moveX( -1 );
			c.moveX( 1 );
			c.unsuppressEvent();
		}
	};

	VISUAL.prototype.handler = function( e, done )
	{
		e.preventDefault();

		if( e.ModKeys ) return;

		var cur = this.__cursor;
		var feeder = cur.feeder;
		var Action = null;

		var dispatchUpdate = false;

		if( e.kMap( "y" ) )
		{
			Action = new YANK( cur );
		}
		else if( e.kMap( "d" ) )
		{
			Action = new DELETE( cur );
		}
		else if( e.kMap( "p" ) )
		{
			Action = new PUT( cur );
		}
		else if( e.kMap( "V" ) )
		{
			if( this.__mode == MODE_LINE ) return true;
			else
			{
				dispatchUpdate = true;
				this.__mode = MODE_LINE;
				this.__msg = Mesg( "VISLINE" );
			}
		}
		else if( e.kMap( "<" ) || e.kMap( ">" ) )
		{
			Action = new SHIFT_LINES( cur, e );
		}
		else if( e.kMap( "v" ) )
		{
			if( this.__mode == MODE_VISUAL ) return true;
			else
			{
				dispatchUpdate = true;
				this.__mode = MODE_VISUAL;
				this.__msg = Mesg( "VISUAL" );

				cur.updatePosition();
			}
		}

		if( dispatchUpdate )
			feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );

		if( this.__mode == MODE_NULL )
		{
			debug.Error( new Error( "Mode is undefined" ) );
			return true;
		}

		var startLine = this.__startLine;
		if( Action )
		{
			cur.suppressEvent();

			var lineMode = this.__mode == MODE_LINE;
			if( lineMode )
			{
				if( startLine.aPos < cur.aPos )
				{
					cur.lineEnd( true );
					startLine.aPos = startLine.aStart;
				}
				else
				{
					cur.lineStart();
					startLine.aPos = startLine.aEnd;
				}
			}

			/**
			 * Content Modifier:
			 *   This swaps the cursor direction from LTR to RTL
			 *   i.e. treat all delete as "e<----s" flow to keep
			 *        the cursor position as the top on UNDO / REDO
			 **/
			var IsContMod = ~[ DELETE, PUT ].indexOf( Action.constructor );
			if( IsContMod && startLine.aPos < cur.aPos )
			{
				var o = cur.aPos;
				cur.moveTo( startLine.aPos, true );
				startLine.aPos = o;
			}

			Action.handler( e, startLine.aPos, lineMode );

			/**
			 * Cursor Modifier:
			 *   Whether the cursor position is already handled
			 **/
			var IsCurMod = ~[ DELETE, PUT, SHIFT_LINES ].indexOf( Action.constructor );
			if( !IsCurMod )
			{
				cur.moveTo( startLine.aPos );
			}

			this.__msg = Action.getMessage();

			Action.dispose();
			cur.unsuppressEvent();

			startLine.pStart = cur.PStart;

			return true;
		}
		else
		{
			if( e.range )
			{
				cur.suppressEvent();

				var r = e.range;

				if( cur.aPos == startLine.aPos )
				{
					cur.moveTo( r.open, true, false, true );
					this.__reset( cur );
					startLine = this.__startLine;
				}

				cur.unsuppressEvent();
				cur.moveTo( r.close, true, false, true );
			}

			var currAp = cur.aPos;

			// Calculate the visible max min aPos of the current screen
			var line = feeder.firstBuffer;
			var firstLine = line.lineNum;
			var minAp = offsetY( cur, firstLine );
			var maxAp = offsetY( cur, firstLine + feeder.moreAt + 1 ) - 1;

			debug.Info( "Min aPos: " + minAp, "Max aPos: " + maxAp );

			var pStart = startLine.X;
			var nstart = cur.PStart;

			// highlight from the start
			if( startLine.aPos < minAp )
			{
				pStart = 0;

				if( this.__mode == MODE_LINE )
				{
					cur.suppressEvent();

					cur.lineEnd( true );
					nstart = cur.PStart;

					cur.moveTo( currAp, true );

					cur.unsuppressEvent();
				}
			}
			// highlight from the end
			else if( maxAp < startLine.aPos )
			{
				pStart = -2;
				var i = 0;
				do
				{
					if( line.placeholder ) break;
					if( i <= feeder.moreAt )
					{
						pStart += line.toString().length + 1;
					}
					i ++;
				}
				while( line = line.next );
			}
			else
			{
				var l = startLine.lineNum;
				if( this.__mode == MODE_LINE )
				{
					cur.suppressEvent();
					pStart = 0;

					if( currAp < startLine.aPos )
					{
						pStart = -1;
						l ++;

						cur.lineStart();
						nstart = cur.PStart;
					}
					else if( startLine.aPos < currAp )
					{
						cur.lineEnd( true );
						nstart = cur.PStart;
					}
					// aPos == currPos
					else
					{
						cur.lineStart();
						nstart = cur.PStart;
						cur.lineEnd( true );
						pStart = cur.PStart;
						l = line.lineNum;
					}

					cur.moveTo( currAp, true );

					cur.unsuppressEvent();
				}
				else if( this.__mode == MODE_VISUAL )
				{
					if( currAp == startLine.aPos ) return;
				}

				// Append the Y offset
				var i = 0;
				do
				{
					if( line.lineNum == l || line.placeholder ) break;
					pStart += line.toString().length + 1;
				}
				while( line = line.next );
			}

			var prevPos = pStart;
			var newPos = nstart;

			var posDiff = newPos - prevPos;

			var currAp = cur.aPos;

			// Sets the visual position
			// s-->e
			if( 0 <= posDiff )
			{
				newPos = newPos + 1;
				MarkSelected( e.target.marks, startLine, lineInfo( cur ) );
			}
			// e<--s
			else if( posDiff < 0 )
			{
				prevPos += posDiff;
				newPos = pStart + 1;
				MarkSelected( e.target.marks, lineInfo( cur ), startLine );
			}

			cur.PStart = prevPos;
			cur.PEnd = newPos;
		}
	};

	VISUAL.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "VISUAL", VISUAL );
})();
