(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );

	var VimError = __import( "Components.Vim.Error" );
	var Mesg = __import( "Components.Vim.Message" );

	var occurence = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.Actions.FIND} */
	var FIND = ns[ NS_INVOKE ]( "FIND" );

	var REPL_BEFORE = 0;
	var REPL_OFFSET = 1;
	var REPL_LENGTH = 2;

	var ParseReplace = function( repl )
	{
		var parsed = "";
		var l = repl.length;
		var rStack = [ "" ]

		for( var i = 1; i < l; i ++ )
		{
			switch( repl[ i ] )
			{
				case "^I":
					parsed += "\t";
					break;

				case "\\":
					i ++;

					var j = repl[ i ];
					if( "$nrt\\".indexOf( j ) != -1 )
					{
						parsed += JSON.parse( "\"\\" + j + "\"" );
						break;
					}

					// 9 is shifted by 0
					// which I think is more important
					if( "012345678".indexOf( j ) != -1 )
					{
						rStack.push( parsed.length );
						parsed += j;
					}
					else if( j == "9" )
					{
						throw new Error( "Back ref 9 is reserved for back ref 0" );
					}
					else
					{
						throw new Error( "Missing token impl: \"" + tok + "\"" );
					}
					break;

				default:
					parsed += repl[ i ];
			}
		}

		rStack[0] = parsed;
		return rStack;
	};

	/** @type {Components.Vim.IAction} */
	var REPLACE = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";

		this.__repl = "";
		this.__replLen = 0;
		this.__replCallback = this.__replCallback.bind( this );

		this.__pOffset = 0;

		this.__replacedGroups = [];

		Cursor.suppressEvent();
	};

	REPLACE.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	REPLACE.prototype.handler = function( e, p )
	{
		e.preventDefault();

		var search;
		var spattern;

		try
		{
			var slash = p.indexOf( "/", 0 );
			var secSlash = p.indexOf( "/", slash + 1 );
			if( slash == -1 )
			{
				this.__msg = VimError( "MISSING_FEATURE", "REPLACE %s" );
				return true;
			}
			else if( secSlash == -1 )
			{
				search = FIND.Pattern( p );
				spattern = p;
			}
			else
			{
				spattern = p.slice( slash, secSlash );
				search = FIND.Pattern( spattern );

				var thdSlash = p.indexOf( "/", secSlash + 1 );
				if( thdSlash == -1 )
				{
					this.__repl = ParseReplace( p.slice( secSlash ) );
				}
				else
				{
					this.__repl = ParseReplace( p.slice( secSlash, thdSlash ) );
				}

				this.__replLen = this.__repl[0].length;
			}
		}
		catch( ex )
		{
			this.__msg = VimError( "EX1", ex.message );
			return true;
		}

		debug.Info( "Replace: " + search + ", [ " + this.__repl + " ]" );

		var feeder = this.__cursor.feeder;
		var content = feeder.content.slice( 0, -1 )
			.replace( search, this.__replCallback ) + "\n";

		var numSubs = this.__replacedGroups.length;
		if( !numSubs )
		{
			this.__msg = VimError( "E486", spattern.join( "" ) );
		}

		feeder.content = content;

		this.__msg = Mesg( "REPLACE", numSubs, "<TODO>" );

		// Record this step for UNDO / REDO
		this.__rec();

		/* Move the cursor to last replaced line
		var cur = this.__cursor;
		var p = cur.aPos;
		*/

		feeder.pan();
		feeder.softReset();

		return true;
	};

	REPLACE.prototype.__replCallback = function()
	{
		var match = arguments[0];
		var backRefs = Array.prototype.slice.call( arguments, 1, -2 );

		var offset = this.__pOffset + arguments[ arguments.length - 2 ];

		var replacedStr = "";
		var replCand = this.__repl[0];

		for( var i = 0; i < this.__replLen; i ++ )
		{
			var j = this.__repl.indexOf( i, 1 );
			if( j == -1 )
			{
				replacedStr += replCand[ i ];
			}
			else
			{
				replacedStr += backRefs[ replCand[ this.__repl[ j ] ] ];
			}
		}

		var rLen = replacedStr.length;
		this.__pOffset += rLen - match.length;

		var ReplObj = [];
		ReplObj[ REPL_BEFORE ] = match;
		ReplObj[ REPL_OFFSET ] = offset;
		ReplObj[ REPL_LENGTH ] = rLen;

		this.__replacedGroups.push( ReplObj );

		return replacedStr;
	};

	REPLACE.prototype.__rec = function()
	{
		var stack = new Stack();

		var reGroups = this.__replacedGroups;
		var l = reGroups.length;
		var cur = this.__cursor;
		var feeder = cur.feeder;

		stack.store( function()
		{
			var cont = feeder.content;
			var newCont = "";
			var st = 0;

			var curStart = -1;
			for( var i = 0; i < l; i ++ )
			{
				var grp = reGroups[ i ];

				var RO = grp[ REPL_OFFSET ];
				var RL = grp[ REPL_LENGTH ];
				var RB = grp[ REPL_BEFORE ];

				var NRL = RB.length;
				newCont += cont.substring( st, RO ) + RB;

				st = grp[ REPL_OFFSET ] + RL;

				grp[ REPL_BEFORE ] = cont.substr( RO, RL );

				grp[ REPL_OFFSET ] = newCont.length - NRL;
				grp[ REPL_LENGTH ] = NRL;

				if( curStart == -1 )
				{
					curStart = RO;
				}
			}

			newCont += cont.substring( st );

			feeder.content = newCont;
			cur.moveTo( curStart );
			feeder.pan();

		} );

		cur.rec.record( stack );
	};

	REPLACE.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "REPLACE", REPLACE );
})();
