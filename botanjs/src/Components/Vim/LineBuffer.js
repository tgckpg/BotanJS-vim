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

	var LineBuffer = function( cols, nextLineBuffer )
	{
		this.prev = null;
		this.cols = cols;
		this.next = nextLineBuffer;
		this.br = false;
		this.placeholder = true;
		this.lineNum = 0;
		this.tabWidth = 8;

		if( nextLineBuffer )
		{
			nextLineBuffer.prev = this;
		}
	};

	LineBuffer.prototype.Push = function( content, wrap, n )
	{
		this.lineNum = n;
		if( content == undefined || content === "" )
		{
			this.content = "~";
			this.br = true;
			this.placeholder = true;
			if( this.next ) this.next.Push( content, wrap, n + 1 );
			return;
		}

		this.placeholder = false;

		var line = "";
		var br = false;

		var i = 0;
		var numTabs = 0;
		if( wrap )
		{
			for( ; i < this.cols - numTabs * this.tabWidth; i ++ )
			{
				var c = content[i];
				if( c === undefined ) break;

				if( c == "\n" )
				{
					br = true;
					i ++;
					break;
				}
				else if( c == "\t" )
				{
					numTabs ++;
				}

				line += c;
			}
		}
		else
		{
			br = true;
			for( ; true; i ++ )
			{
				var c = content[i];
				if( c === undefined ) break;

				if( c == "\n" )
				{
					i ++;
					break;
				}
				else if( c == "\t" )
				{
					numTabs ++;
				}

				if( i < this.cols - numTabs * this.tabWidth )
				{
					line += c;
				}
			}
		}

		if( this.next )
		{
			this.next.br = br;
			this.next.Push( content.substr( i ), wrap, br ? n + 1 : n );
		}

		this.content = line;
	};

	LineBuffer.prototype.toString = function()
	{
		return this.content || " ";
	};

	__readOnly( LineBuffer.prototype, "visualLines", function()
	{
		var lines = [ this ];
		var line = this;
		while( ( line = line.next ) && !line.br )
		{
			lines.push( line );
		}

		return lines;
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "LineBuffer", LineBuffer );
})();
