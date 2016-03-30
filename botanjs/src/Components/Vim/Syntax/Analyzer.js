(function(){
	var ns = __namespace( "Components.Vim.Syntax" );

	/** @type {System.Debug} */
	var debug                                   = __import( "System.Debug" );

	/** @type {Components.Vim.Syntax.Word} */
	var Word = ns[ NS_INVOKE ]( "Word" );

	var TOK_OPEN = 0;
	var TOK_CLOSED = 1;
	var TOK_LEVEL = 2;
	var TOK_PARENT = 3;

	var TOK_SEP = "\n";

	var TOK_JOIN = function( a, b ) { return a + TOK_SEP + b; };

	/*{{{ Private Class */
	var TokenPairs = function( tok, content, esc )
	{
		var l = content.length;
		var toks = tok.split( TOK_SEP );
		var openToken = toks[0];
		var closeToken = toks[1];

		var opStack = [];

		var unmatchedEd = [];

		var lv = 0;

		var pairs = [];

		var lvUp = function( i )
		{
			opStack[ lv ] = i;
			lv ++;
		};

		var lvDown = function( i )
		{
			if( lv == 0 )
			{
				// Cannot level down. i.e. Unmatched tokens
				unmatchedEd.push( i );
				return;
			}

			var Token = [];
			Token[ TOK_OPEN ] = opStack[ -- lv ];
			Token[ TOK_CLOSED ] = i;
			Token[ TOK_LEVEL ] = lv;
			Token[ TOK_PARENT ] =  0 < lv ? opStack[ lv - 1 ] : -1;

			pairs.push( Token );
		};

		var opLen = openToken.length;
		var edLen = closeToken.length;
		for( var i = 0; i < l; i ++ )
		{
			var opTok = content.substr( i, opLen );
			var edTok = content.substr( i, edLen );
			if( opTok == openToken )
			{
				lvUp( i );
				i += opLen - 1;
			}
			else if( edTok == closeToken )
			{
				lvDown( i );
				i += edLen - 1;
			}
		}

		if( unmatchedEd.length )
		{
			debug.Info( "Unmatched opening \"" + openToken + "\"@" + unmatchedEd.join( ", " ) );
		}

		if( 0 < lv )
		{
			debug.Info( "Unmatched closing \"" + closeToken + "\"@" + opStack.slice( 0, lv ) );
		}

		this.__pairs = pairs;
		this.token = toks;
	};

	TokenPairs.prototype.token = "";

	TokenPairs.prototype.matched = function()
	{
		return this.__pairs.sort(
				function( a, b ) { return a[ TOK_OPEN ] - b[ TOK_OPEN ]; }
				);
	};

	TokenPairs.prototype.find = function( pos, state )
	{
		if( state == undefined ) state = TOK_OPEN;

		var pairs = this.__pairs;
		var l = pairs.length;

		for( var i = 0; i < l; i ++ )
		{
			var pair = pairs[i];
			if( pair[ state ] == pos )
			{
				return pair;
			}
		}

		return null;
	};
	/* End Private Class }}}*/

	var Analyzer = function( feeder )
	{
		/* @type {Components.Vim.LineFeeder} */
		this.__feeder = feeder;
		this.__tokpairs = {};
	};

	Analyzer.prototype.bracketAt = function( p )
	{
		var c = this.__feeder.content;
		var tokState = TOK_CLOSED;

		var BracketPairs = null;
		var cTok = c[ p ];

		switch( cTok )
		{
			case "{": tokState = TOK_OPEN;
			case "}":
					  BracketPairs = this.GetPairs( TOK_JOIN( "{", "}" ) );
				break;

			case "[": tokState = TOK_OPEN;
			case "]":
				BracketPairs = this.GetPairs( TOK_JOIN( "[", "]" ) );
				break;

			case "(": tokState = TOK_OPEN;
			case ")":
				BracketPairs = this.GetPairs( TOK_JOIN( "(", ")" ) );
				break;

			case "/":
				if( c[ p - 1 ] == "*" )
				{
					cTok = "*/";
					p --;
					break;
				}
				else if( c[ p + 1 ] == "*" )
				{
					cTok = "/*";
					break;
				}
				return new TokenMatch();

			case "*":
				if( c[ p - 1 ] == "/" )
				{
					cTok = "/*";
					p --;
					break;
				}
				else if( c[ p + 1 ] == "/" )
				{
					cTok = "*/";
					break;
				}
				return new TokenMatch();

			default:
				return new TokenMatch();
		}

		// Long Switch
		if( !BracketPairs ) switch( cTok )
		{
			case "/*": tokState = TOK_OPEN;
			case "*/":
				BracketPairs = this.GetPairs( TOK_JOIN( "/*", "*/" ) );
				break;

			default:
				return new TokenMatch();
		}

		var SetParent = function( pair )
		{
			if( !pair ) throw new Error( "Parent not found" );

			var tMatch = new TokenMatch();
			tMatch.__level = pair[ TOK_LEVEL ];
			tMatch.__open = pair[ TOK_OPEN ];
			tMatch.__close = pair[ TOK_CLOSED ];

			if( -1 < pair[ TOK_PARENT ] )
			{
				var rPair = BracketPairs.find( pair[ TOK_PARENT ] );
				tMatch.__parent = SetParent( rPair );
			}

			return tMatch;
		};

		var rPair = BracketPairs.find( p, tokState );
		var tMatch = SetParent( rPair )
		tMatch.__selected = p;

		return tMatch;
	};

	Analyzer.prototype.GetPairs = function( def, reload )
	{
		if( !reload && this.__tokpairs[ def ] )
		{
			return this.__tokpairs[ def ];
		}

		var c = this.__feeder.content;
		var pairs = new TokenPairs( def, c );

		this.__tokpairs[ def ] = pairs;

		return pairs;
	};

	Analyzer.prototype.quoteAt = function( p )
	{
		var c = this.__feeder.content;
		switch( c[ p ] )
		{
			case "`":
			case "\"":
			case "\'":
			default:
				return {
					level: 0
					, open: -1
					, close: -1
				};
		}
	};

	Analyzer.prototype.wordAt = function( p )
	{
		var c = this.__feeder.content;
		var Len = c.length;
		var i = p, j = p;

		var word = new Word( c[ p ] );

		if( 0 < p ) while( word.test( c[ -- i ] ) );
		if( p < Len ) while( word.test( c[ ++ j ] ) );

		var tMatch = new TokenMatch();
		tMatch.__open = 0 < i ? i + 1 : 0;
		tMatch.__close = j - 1;

		return tMatch;
	};

	var TokenMatch = function()
	{
		this.__open = -1;
		this.__close = -1;
		this.__selected = -1;
		this.__level = -1;
		this.__parent = null;
	};

	__readOnly( TokenMatch.prototype, "parent", function() { return this.__parent; } );
	__readOnly( TokenMatch.prototype, "open", function() { return this.__open; } );
	__readOnly( TokenMatch.prototype, "close", function() { return this.__close; } );
	__readOnly( TokenMatch.prototype, "level", function() { return this.__level; } );
	__readOnly( TokenMatch.prototype, "selected", function() { return this.__selected; } );

	ns[ NS_EXPORT ]( EX_CLASS, "Analyzer", Analyzer );
	ns[ NS_EXPORT ]( EX_CLASS, "TokenMatch", TokenMatch );
})();
