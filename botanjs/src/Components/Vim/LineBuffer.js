(function(){
	var ns = __namespace( "Components.Vim" );

	var debug = __import( "System.Debug" );

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
			this.lineNum = ++n;
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
		var tabw = this.tabWidth - 1;
		if( wrap )
		{
			for( ; i < this.cols - numTabs * tabw; i ++ )
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

				if( i < this.cols - numTabs * tabw )
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
		if( this.content.length < this.cols )
		{
			return this.content + " ";
		}

		return this.content || " ";
	};

	__readOnly( LineBuffer.prototype, "nextLine", function()
	{
		var line = this;
		var thisLine = this.lineNum;

		while( ( line = line.next ) && line.lineNum == thisLine );

		return line;
	} );

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
