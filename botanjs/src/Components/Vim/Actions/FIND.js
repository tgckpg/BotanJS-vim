(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var VimError = __import( "Components.Vim.Error" );
	var Mesg = __import( "Components.Vim.Message" );

	// Private static
	var PATTERN = [];

	var ParsePattern = function( pattern )
	{
		var parsed = "";
		var l = pattern.length;

		for( var i = 1; i < l; i ++ )
		{
			switch( pattern[ i ] )
			{
				case "^I":
					parsed += "\t";
					break;
				case "\\":
					var tok = pattern[ ++ i ];
					if( "nrts.[]()^".indexOf( tok ) != -1 )
					{
						parsed += "\\" + tok;
					}
					else
					{
						throw new Error( "Missing token impl: \"" + tok + "\"" );
					}
					break;
				default:
					parsed += pattern[ i ];
			}
		}

		// The root bracket as back ref 0
		var RegEx = new RegExp( "(" +  parsed + ")", "gm" );

		return RegEx;
	};

	/** @type {Components.Vim.IAction} */
	var FIND = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	FIND.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	FIND.prototype.handler = function( e, p )
	{
		e.preventDefault();

		if( p )
		{
			if( p.length < 2 )
			{
				if( PATTERN.length < 1 )
				{
					this.__msg = VimError( "E35" );
					return true;
				}
				else p = PATTERN;
			}

			PATTERN = p;
		}

		if( PATTERN.length < 1 )
		{
			this.__msg = VimError( "E35" );
			return true;
		}

		var search;
		try
		{
			search = ParsePattern( PATTERN );
		}
		catch( ex )
		{
			this.__msg = VimError( "EX1", ex.message );
			return true;
		}

		var content = this.__cursor.feeder.content;

		var cur = this.__cursor;
		var p = cur.aPos;

		var r;
		var Hit;
		var FirstHit;
		var PrevStack = [];

		var LoopGuard;
		while( ( r = search.exec( content ) ) !== null )
		{
			if( FirstHit == undefined )
			{
				FirstHit = r.index;
			}

			if( LoopGuard == r.index )
			{
				this.__msg = VimError( "EX2", PATTERN.slice( 1 ).join( "" ) );
				return true;
			}

			if( p < r.index )
			{
				Hit = r.index;
				break;
			}

			PrevStack.push( r.index );
			LoopGuard = r.index;
		}

		if( e.kMap( "N" ) )
		{
			Hit = PrevStack[ PrevStack.length - 2 ];
			if( Hit == undefined )
			{
				this.__msg = Mesg( "SEARCH_HIT_TOP" );

				while( ( r = search.exec( content ) ) !== null ) Hit = r.index;
			}
		}
		else if( FirstHit != undefined && Hit == undefined )
		{
			// Search Hit Bottom
			Hit = FirstHit;
			this.__msg = Mesg( "SEARCH_HIT_BOTTOM" );
		}
		else
		{
			this.__msg = PATTERN.join( "" )
		}

		if( Hit == undefined )
		{
			this.__msg = VimError( "E486", PATTERN.slice( 1 ).join( "" ) );
		}
		else
		{
			cur.moveTo( Hit );
		}
	};

	FIND.prototype.getMessage = function()
	{
		return this.__msg;
	};

	__static_method( FIND, "Pattern", ParsePattern );

	ns[ NS_EXPORT ]( EX_CLASS, "FIND", FIND );
})();
