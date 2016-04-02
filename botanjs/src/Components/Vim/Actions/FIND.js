(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );

	// Private static
	var PATTERN = "";

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
					debug.Error( "Unknown escaped token: " + tok );
					++ i;
				default:
					parsed += pattern[ i ];
			}
		}

		var RegEx = null;

		try
		{
			var RegEx = new RegExp( parsed, "gm" );
		}
		catch( ex )
		{
			debug.Error( ex );
		}

		return RegEx;
	};

	/** @type {Components.Vim.Cursor.IAction} */
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

		if( p ) PATTERN = p;

		var search = ParsePattern( PATTERN );

		var content = this.__cursor.feeder.content;

		var cur = this.__cursor;
		var p = cur.aPos;

		var r;
		var Hit;
		var FirstHit;
		var PrevStack = [];

		while( ( r = search.exec( content ) ) !== null )
		{
			if( !FirstHit ) FirstHit = r.index;
			if( p < r.index )
			{
				Hit = r.index;
				break;
			}

			PrevStack.push( r.index );
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

	ns[ NS_EXPORT ]( EX_CLASS, "FIND", FIND );
})();
