(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );
	var beep = __import( "Components.Vim.Beep" );

	/** @type {Components.Vim.State.Stator} */
	var Stator                                 = __import( "Components.Vim.State.Stator" );
	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );

	var VimError = __import( "Components.Vim.Error" );
	var Mesg = __import( "Components.Vim.Message" );

	var occurence = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.IAction}
	 *  Cursor @param {Components.Vim.Cursor}
	 *  e @param {Components.Vim.ActionEvent}
	 **/
	var SHIFT_LINES = function( Cursor, e )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__startX = Cursor.aPos;
		this.__msg = "<LINE_SHIFT>";

		this.__slineNum = Cursor.getLine().lineNum;

		this.__lines = e.count - 1;
		debug.Info( "Open shift: " + this.__lines + " line(s) from the cursor" );

		this.__direction = e.kMap( ">" ) ? 1 : -1;
		debug.Info( "Direction is: " + ( this.__direction == 1 ? ">" : "<" ) );

		Cursor.suppressEvent();
	};

	SHIFT_LINES.prototype.allowMovement = true;

	SHIFT_LINES.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	SHIFT_LINES.prototype.handler = function( e, sp )
	{
		e.preventDefault();

		if( e.ModKeys || e.kMap( "i" ) ) return;

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var Triggered = false;
		var dir = this.__direction;

		var start = this.__slineNum;
		var nline = this.__lines;
		var indentMult = 1;

		if( 1 < e.count )
		{
			nline += ( e.count - 1 );
		}

		// default: >>, <<, >l, <h
		var end = start;

		var shiftCount = 1;
		if( sp == undefined )
		{
			Triggered = true;

			sp = this.__startX;

			var currAp = cur.aPos;

			if( this.__startX != currAp )
			{
				start = 0; end = 0;

				if( nline )
				{
					if( currAp < sp )
					{
						start -= ( nline - 1 );
					}
					else
					{
						end += ( nline - 1 );
					}
				}

				if( currAp < sp )
				{
					sp = sp + currAp;
					currAp = sp - currAp;
					sp = sp - currAp;
				}

				for( var i = 0; i < currAp; i ++ )
				{
					if( feeder.content[ i ] == "\n" )
					{
						end ++;
						if( i < sp )
						{
							start ++;
						}
					}
				}
			}
			else
			{
				if( e.range )
				{
					sp = e.range.close;

					start = 1; end = -1;
					for( var i = 0; i < sp; i ++ )
					{
						if( feeder.content[ i ] == "\n" )
						{
							end ++;
							if( i < e.range.open )
							{
								start ++;
							}
						}
					}

					if( end == -1 )
					{
						start = end = 0;
					}

					if( end < start )
					{
						end = -- start;
					}

					indentMult = e.count;
				}
				else if( 0 < dir && ( e.kMap( ">" ) || e.kMap( "l" ) ) );
				else if( dir < 0 && ( e.kMap( "<" ) || e.kMap( "h" ) ) );
				else
				{
					beep();
					return true;
				}
			}
		}
		// VISUAL Mode
		else
		{
			start = 0;
			for( var i = 0; i < sp; i ++ )
			{
				if( feeder.content[ i ] == "\n" ) start ++;
			}

			end = this.__slineNum;

			indentMult = e.count;
		}

		if( end < start )
		{
			start = start + end;
			end = start - end;
			start = start - end;
		}

		// last "\n" padding
		var c = feeder.content.slice( 0, -1 );

		var indents = c.match( /^[\t ]+/gm );
		var indentChar = "\t";
		var tabwidth = feeder.firstBuffer.tabWidth;

		if( indents )
		{
			var l = indents.length - 1;

			if( 1 < l )
			{
				debug.Info( "Guessing the tabstop:" );
				var lineTabs = 0;
				var lineSpaces = 0;

				// Guess indent
				var spStat = {};
				var spIndents = [];

				for( var i = 0; i < l; i ++ )
				{
					var ind = indents[ i ];
					var k = 0;
					if( ind[0] == " " )
					{
						lineSpaces ++;
						k = occurence( ind, " " );

						if( spIndents.indexOf( k ) == -1 )
						{
							spIndents.push( k );
							spStat[ k ] = ind;
						}
					}
					else
					{
						lineTabs ++;
					}
				}

				if( lineTabs < lineSpaces )
				{
					spIndents.sort(function( a, b ) { return a - b; });
					var rHCF = 0;
					for( var i = 0, l = spIndents.length; i < l; i ++ )
					{
						var spIdx = Number( spIndents[ i ] );
						var nHCF = 1;

						// Forward count number of factors
						for( var j = i + 1; j < l; j ++ )
						{
							if( spIndents[ j ].length % spIdx == 0 )
							{
								nHCF ++;
							}
						}

						if( rHCF < nHCF )
						{
							rHCF = nHCF;
							indentChar = spStat[ spIdx ];
						}
					}
				}

				debug.Info( "\tTab lines: " + lineTabs );
				debug.Info( "\tSpace lines: " + lineSpaces );
				debug.Info( "\ti.e. indent using " + JSON.stringify( indentChar ) );
			}
			else
			{
				debug.Info( "Not enough tabs to determine the tabstop, using default" );
			}
		}

		debug.Info( "Start: " + start, "End: " + end );
		var rBlock = "";
		var nLen = 0;

		var started = false;

		var recStart = 0;

		feeder.content = "";
		nline = 0;

		var indented = "";
		for( var i = 0; i < indentMult; i ++ ) indented += indentChar;

		for( var i = 0, j = 0; 0 <= i; i = c.indexOf( "\n", i ), j ++ )
		{
			i ++;

			if( j < start ) continue;
			else if( !started )
			{
				started = true;
				feeder.content = c.substring( 0, i - 1 );
				recStart = feeder.content.length;
			}

			if( end < j ) break;

			var line = c.indexOf( "\n", i );
			if( ~line )
			{
				line = c.substring( 1 < i ? i : i - 1, line );
			}
			else
			{
				line = c.substring( 1 < i ? i : i - 1 );
			}

			if( 1 < i )
			{
				feeder.content += "\n";
				rBlock += "\n";
				nLen ++;
			}

			rBlock += line;

			if( line !== "" )
			{
				var indentedLine;
				if( 0 < dir )
				{
					indentedLine = indented + line;
				}
				else
				{
					for( var si = 0, sj = 0; si < indentMult; si ++ )
					{
						var startC = line[ sj ];
						if( startC == " " )
						{
							for( var swidth = tabwidth + ( sj ++ ); sj < swidth; sj ++ )
							{
								if( !~"\t ".indexOf( line[ sj ] ) ) break;
							}
						}
						else if( startC == "\t" )
						{
							sj ++;
						}
						else break;
					}

					indentedLine = line.substring( sj );
				}

				feeder.content += indentedLine;

				nLen += indentedLine.length;
				nline ++;
			}
		}
 
		var nPos = feeder.content.length;
		feeder.content += "\n";

		if( ~i ) feeder.content += c.substring( i ) + "\n";
		feeder.pan();

		cur.moveTo( nPos );

		var stator = new Stator( cur, recStart );
		var stack = new Stack();

		recStart ++;
		for( ; ~"\t ".indexOf( feeder.content[ recStart ] ); recStart ++ );

		var f = stator.save( nLen, rBlock );
		stack.store( function() {
			f();
			// Offset correction after REDO / UNDO
			cur.moveTo( recStart );
			cur.lineStart( true );
		} );

		cur.moveTo( recStart );

		cur.rec.record( stack );

		if( nline )
		{
			this.__msg = Mesg( "LINES_SHIFTED", nline, dir < 0 ? "<" : ">", indentMult );
		}
		else
		{
			this.__msg = Mesg( "NO_SHIFT", dir < 0 ? "<" : ">" );
		}

		return Triggered;
	};

	SHIFT_LINES.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "SHIFT_LINES", SHIFT_LINES );
})();
