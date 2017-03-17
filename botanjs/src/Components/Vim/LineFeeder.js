(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	/** @type {Components.Vim.LineBuffer} */
	var LineBuffer = ns[ NS_INVOKE ]( "LineBuffer" );
	/** @type {Components.Vim.Cursor} */
	var Cursor = ns[ NS_INVOKE ]( "Cursor" );

	var occurence = __import( "System.utils.Perf.CountSubstr" );
	var C_LINE = 0;

	var Feeder = function( rows, cols )
	{
		var lineBuffers = [];

		// Last line, hidden buffer that won't be rendered
		this.__xBuffer = lineBuffers[ rows ] = new LineBuffer( cols );

		for( var i = rows - 1; 0 <= i; i -- )
		{
			lineBuffers[ i ] = new LineBuffer( cols, lineBuffers[ i + 1 ] );
		}

		this.lineBuffers = lineBuffers;

		this.panX = 0;
		this.panY = 0;

		this.wrap = true;

		this.setRender();

		this.cursor = new Cursor( this );
		this.dispatcher = new EventDispatcher();

		this.__lineCache = [];
		this.__clseLine = null;
		this.__moreAt = -1;
		this.__rows = rows;
	};

	Feeder.prototype.init = function( content, wrap )
	{
		this.__content = content;
		this.setWrap( wrap );

		this.firstBuffer.Push( content, this.wrap, 0 ); 
	};

	Feeder.prototype.setWrap = function( wrap )
	{
		if( wrap == undefined ) return;
		this.wrap = wrap;

		// TODO: Update
	};

	Feeder.prototype.setRender = function( placeholder )
	{
		if( placeholder == undefined ) placeholder = true;

		var _self = this;

		var placeholdCond = placeholder
			? function( line ) { return true; }
			:  function( line ) { return !line.placeholder; }
			;

			this.__render = function( line, steps )
			{
				var display = ( line == undefined ? "" : line ) + "";

				var atSpace = false;

				for( var i = 0;
						line && i < steps && ( line = line.next ) && placeholdCond( line );
						i ++ )
				{
					if( atSpace || ( line.br && steps < ( i + line.visualLines.length ) ) )
					{
						if( !atSpace ) _self.__clseLine = line;
						atSpace = true;
						display += "\n@";
						continue;
					}

					display += "\n" + line;
				}

				return display;
			};

			this.__softRender = function()
			{
				var line = _self.lineBuffers[ _self.__rStart ];
				var steps = _self.__rLength + 1;

				for( var i = 0;
						line && i < steps && ( line = line.next ) && placeholdCond( line );
						i ++ )
				{
					if( line.br && steps < ( i + line.visualLines.length ) )
					{
						_self.__clseLine = line;
						break;
					}
				}
			};
	}

	Feeder.prototype.render = function( start, length )
	{
		var buffs = this.lineBuffers;

		if( start == undefined ) start = 0;
		else if( this.__rows < start ) return "";

		if( length == undefined || ( this.__rows - start ) < length ) 
			length = this.rows - start;

		if( length == 0 ) return "";

		this.__rStart = start;
		this.__rLength = length - 1;
		return this.__render( buffs[ start ], this.__rLength );
	};

	// Performs a line panning
	Feeder.prototype.pan = function( dX, dY )
	{
		if( dX == undefined ) dX = 0;
		if( dY == undefined ) dY = 0;

		var X = this.panX + dX;
		var Y = this.panY + dY;

		var f = -1;
		var i = 0;

		// Y cannot be negative
		if( Y < 0 ) Y = 0;

		// Compensate the last "\n" content placeholder
		var cont = this.__content.slice( 0, -1 );
		if( 0 < Y )
		{
			f = cont.indexOf( "\n" );
			for( i = 1; f != -1 && i < Y; i ++ )
			{
				var a = cont.indexOf( "\n", f + 1 );
				if( a == -1 )
				{
					Y = i;
					break;
				}
				f = a;
			}
		}

		this.firstBuffer.Push( this.__content.substr( f + 1 ), this.wrap, i );

		this.panX = X;
		this.panY = Y;
	};

	Feeder.prototype.softReset = function()
	{
		this.__moreAt = -1;
		this.__clseLine = null;
		this.__softRender();
	};

	Feeder.prototype.line = function( n )
	{
		if( this.__lineCache[ n ] )
			return this.__lineCache[ n ];
		var str = this.__content;
		var i = str.indexOf( "\n" ), j = 0;

		for( ; 0 <= i; i = str.indexOf( "\n", i ), j ++ )
		{
			if( n == j ) break;
			i ++;
		}

		if( j == 0 && i == -1 ) i = 0;

		var end = str.indexOf( "\n", i + 1 );
		return ( this.__lineCache[ n ] = str.substring( i + 1, end ) );
	};

	__readOnly( Feeder.prototype, "linesTotal", function() {
		return occurence( this.__content, "\n" );
	} );

	__readOnly( Feeder.prototype, "firstBuffer", function() {
		return this.lineBuffers[ 0 ];
	} );

	__readOnly( Feeder.prototype, "lastBuffer", function() {
		return this.lineBuffers[ this.__rows - 1 ];
	} );

	__readOnly( Feeder.prototype, "EOF", function() {
		return this.lineBuffers[ this.__rows ].placeholder;
	} );

	__readOnly( Feeder.prototype, "moreAt", function() {
		if( 0 < this.__moreAt ) return this.__moreAt;

		var line = this.firstBuffer;
		if( line.placeholder ) return 0;

		var i = 0;
		do
		{
			if( this.__clseLine == line ) break;
			if( line.br ) i ++;
		}
		while( line = line.next );

		if( line == undefined ) i --;

		return ( this.__moreAt = i );
	} );

	__readOnly( Feeder.prototype, "lineStat", function() {
		var X = this.cursor.aX + 1;
		var line = this.cursor.getLine();
		var tabStat = "";

		var tabs = 0;
		var l = this.cursor.aPos;
		var i = l - X;
		do
		{
			if( this.__content[ i + 1 ] == "\t" ) tabs ++;
			i ++;
		}
		while( i < l )

		if( tabs )
		{
			tabStat = "-" + ( X + tabs * ( line.tabWidth - 1 ) );
		}

		return ( line.lineNum + 1 ) + "," + X + tabStat;
	} );

	__readOnly( Feeder.prototype, "docPos", function() {
		var pos = "ALL";

		if( 0 < this.panY )
		{
			if( this.EOF )
			{
				pos = "BOTTOM";
			}
			else
			{
				pos = Math.floor( ( this.panY / ( this.linesTotal - ( this.__rows - 1 ) ) ) * 100 ) + "%";
			}
		}
		else
		{
			if( this.__clseLine || !this.EOF )
			{
				pos = "TOP";
			}
		}

		return pos;
	} );

	Object.defineProperty( Feeder.prototype, "content", {
		get: function() { return this.__content; }
		, set: function( v )
		{
			this.__lineCache = [];
			this.__content = v;
		}
	} );

	__readOnly( Feeder.prototype, "linesOccupied", function() {
		var line = this.firstBuffer;
		if( line.placeholder ) return 0;

		var i = 0;
		do i ++;
		while( ( line = line.next ) && !line.placeholder );
		return i;
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "LineFeeder", Feeder );
})();
