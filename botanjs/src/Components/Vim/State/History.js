(function(){
	var ns = __namespace( "Components.Vim.State" );

	/** @type {System.Debug} */
	var debug                        = __import( "System.Debug" );

	// private static
	var Zones = {};

	var PartialBA = function( a, b )
	{
		var l = b.length;
		if( a.length < l ) return false;

		for( var i = 0; i < l; i ++ )
		{
			if( a[ i ] != b[ i ] ) return false;
		}

		return true;
	};

	var ExactAB = function( a, b )
	{
		var l = a.length < b.length ? b.length : a.length;
		for( var i = 0; i < l; i ++ )
		{
			if( a[ i ] != b[ i ] ) return false;
		}

		return true;
	}

	var History = function( z )
	{
		if( !Zones[ z ] ) Zones[ z ] = [];

		this.__pi = 0;
		this.__zone = Zones[ z ];
		this.reset();
	};

	History.prototype.push = function( stack )
	{
		if( this.__zone.length
			&& ExactAB( this.__zone[ this.__zone.length - 1 ], stack )
		) {
			debug.Info( "This is the previous command, skipping" );
			return;
		}
		this.__zone.push( stack );
	};

	History.prototype.prev = function( stack )
	{
		if( this.__zone.length <= this.__i ) this.reset();

		while( -1 < this.__i )
		{
			var st = this.__zone[ this.__i -- ];
			if( st && PartialBA( st, stack ) )
			{
				return st.slice();
			}
		}

		return null;
	};

	History.prototype.next = function( stack )
	{
		if( this.__i < 0 )
		{
			this.__i ++;
			this.next( stack );
		}

		while( this.__i < this.__zone.length )
		{
			var st = this.__zone[ this.__i ++ ];
			if( st && PartialBA( st, stack ) )
			{
				return st.slice();
			}
		}

		return null;
	};

	History.prototype.reset =  function()
	{
		this.__i = this.__zone.length - 1;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "History", History );
})();
