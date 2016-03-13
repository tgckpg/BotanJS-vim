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

		// Last line
		lineBuffers[ rows - 1 ] = new LineBuffer( cols );

		for( var i = rows - 2; 0 <= i; i -- )
		{
			lineBuffers[i] = new LineBuffer( cols, lineBuffers[ i + 1 ] );
		}

		this.cursor = new Cursor( lineBuffers );

		this.lineBuffers = lineBuffers;
		this.setRender();
	};

	Feeder.prototype.init = function( content, wrap )
	{
		if( wrap == undefined ) wrap = true;
		if( this.lineBuffers.length )
		{
			this.lineBuffers[0].Push( content, wrap ); 
		}
	};

	Feeder.prototype.wrap = function( setwrap )
	{
	};

	Feeder.prototype.setRender = function( placeholder )
	{
		if( placeholder == undefined ) placeholder = true;

		if( placeholder )
		{
			this.__render = function( line, steps )
			{
				var display = ( line == undefined ? "" : line ) + "";

				for( var i = 0;
					line && i < steps && ( line = line.next );
					i ++ )
				{
					display += "\n" + line;
				}

				return display;
			};
		}
		else
		{
			this.__render = function( line, steps )
			{
				var display = ( line == undefined ? "" : line ) + "";

				for( var i = 0;
					line && i < steps && ( line = line.next ) && !line.placeholder;
					i ++ )
				{
					display += "\n" + line;
				}

				return display;
			};
		}
	}

	Feeder.prototype.render = function( start, length )
	{
		var buffs = this.lineBuffers;

		if( start == undefined ) start = 0;
		else if( buffs.length < start ) return "";

		if( length == undefined || ( buffs.length - start ) < length ) 
			length = buffs.length - start;

		if( length == 0 ) return "";

		return this.__render( buffs[ start ], length - 1 );
	};

	__readOnly( Feeder.prototype, "linesOccupied", function() {
		var line = this.lineBuffers[0];
		if( line.placeholder ) return 0;

		var i = 0;
		do i ++;
		while( ( line = line.next ) && !line.placeholder );
		return i;
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "LineFeeder", Feeder );
})();
