(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {Dandelion} */
	var Dand                                    = __import( "Dandelion" );
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                             = __import( "Dandelion.IDOMElement" );
	/** @type {Dandelion.IDOMObject} */
	var IDOMObject                              = __import( "Dandelion.IDOMObject" );
	/** @type {System.Cycle} */
	var Cycle                                   = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                                   = __import( "System.Debug" );

	/** @type {Components.Vim.LineBuffer} */
	var LineBuffer = ns[ NS_INVOKE ]( "LineBuffer" );
	/** @type {Components.Vim.Cursor} */
	var Cursor = ns[ NS_INVOKE ]( "Cursor" );

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

		this.setRender();

		this.cursor = new Cursor( this );
		this.dispatcher = new EventDispatcher();

		this.__clseLine = null;
		this.__moreAt = -1;
		this.__rows = rows;

		this.__wrap = true;
	};

	Feeder.prototype.init = function( content, wrap )
	{
		this.content = content;
		this.setWrap( wrap );

		this.firstBuffer.Push( content, this.__wrap, 0 ); 
	};

	Feeder.prototype.setWrap = function( wrap )
	{
		if( wrap == undefined ) return;
		this.__wrap = wrap;
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

			var atSpace = false
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
	}

	Feeder.prototype.render = function( start, length )
	{
		var buffs = this.lineBuffers;

		if( start == undefined ) start = 0;
		else if( this.__rows < start ) return "";

		if( length == undefined || ( this.__rows - start ) < length ) 
			length = this.rows - start;

		if( length == 0 ) return "";

		return this.__render( buffs[ start ], length - 1 );
	};

	Feeder.prototype.pan = function( dX, dY )
	{
		if( dX == undefined ) dX = 0;
		if( dY == undefined ) dY = 0;

		if( dX == 0 && dY == 0 ) return;

		var X = this.panX + dX;
		var Y = this.panY + dY;

		var f = this.content.indexOf( "\n" );
		var i = 1;

		while( f != - 1 && i < Y )
		{
			i ++;
			f = this.content.indexOf( "\n", f + 1 );
		}

		this.firstBuffer.Push(
			this.content.substr( f + 1 )
			, this.__wrap, i );

		this.panX = X;
		this.panY = Y;
	};

	__readOnly( Feeder.prototype, "firstBuffer", function() {
		return this.lineBuffers[ 0 ];
	} );

	__readOnly( Feeder.prototype, "lastBuffer", function() {
		return this.lineBuffers[ this.__rows - 1 ];
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

		return ( this.__moreAt = i );
	} );

	__readOnly( Feeder.prototype, "lineStat", function() {
		var X = this.cursor.X;
		return ( this.cursor.getLine().lineNum + 1 ) + "," + X + "-" + ( X );
	} );

	__readOnly( Feeder.prototype, "docPos", function() {
		var pos = "ALL";

		if( this.panY == 0 )
		{
			if( this.__clseLine || !this.EOF )
			{
				pos = "TOP";
			}
		}

		return pos;
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
