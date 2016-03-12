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

	var Line = function( cols, nextLine )
	{
		this.cols = cols;
		this.next = nextLine;
		this.br = false;
		this.placeholder = true;
	};

	Line.prototype.Push = function( content, wrap )
	{
		if( content == undefined || content === "" )
		{
			this.content = "~";
			this.placeholder = true;
			if( this.next ) this.next.Push( content, wrap );
			return;
		}

		this.placeholder = false;

		var line = "";
		var br = false;

		if( wrap )
		{
			for( var i = 0; i < this.cols; i ++ )
			{
				var c = content[i];
				if( c === undefined ) break;

				if( c == "\n" )
				{
					br = true;
					i ++;
					break;
				}

				line += c;
			}
		}
		else
		{
			br = true;
			for( var i = 0; true; i ++ )
			{
				var c = content[i];
				if( c === undefined ) break;

				if( c == "\n" )
				{
					i ++;
					break;
				}

				if( i < this.cols )
				{
					line += c;
				}
			}
		}

		if( this.next )
		{
			this.next.br = br;
			this.next.Push( content.substr( i ), wrap );
		}

		this.content = line;
	};

	Line.prototype.toString = function()
	{
		return this.content;
	};

	var Feeder = function( rows, cols )
	{
		var lines = [];

		// Last line
		lines[ rows - 1 ] = new Line( cols );

		for( var i = rows - 2; 0 <= i; i -- )
		{
			lines[i] = new Line( cols, lines[ i + 1 ] );
		}

		this.lines = lines;
		this.setRender();
	};

	Feeder.prototype.init = function( content, wrap )
	{
		if( wrap == undefined ) wrap = true;
		if( this.lines.length )
		{
			this.lines[0].Push( content, wrap ); 
		}
	};

	// Advance the text to number of lines
	Feeder.prototype.feed = function( num )
	{
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

	Feeder.prototype.cursor = function( direction )
	{
		switch( direction )
		{
			case 0:
				return { start: 0, end: 1 };
		}
	};

	Feeder.prototype.render = function( start, length )
	{
		if( start == undefined ) start = 0;
		else if( this.lines.length < start ) return "";

		if( length == undefined || ( this.lines.length - start ) < length ) 
			length = this.lines.length - start;

		if( length == 0 ) return "";

		return this.__render( this.lines[ start ], length - 1 );
	};

	__readOnly( Feeder.prototype, "linesOccupied", function() {
		var line = this.lines[0];
		if( line.placeholder ) return 0;

		var i = 0;
		do i ++;
		while( ( line = line.next ) && !line.placeholder );
		return i;
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "LineFeeder", Feeder );
})();
