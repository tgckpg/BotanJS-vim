(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var VimError = __import( "Components.Vim.Error" );

	var CMD_RANGE = 0;
	var CMD_TYPE = 1;
	var CMD_ARGS = 2;
	var CMD_ERR = 3;

	var ParseCommand = function( pattern )
	{
		var i = 1;

		var range = "";
		var out = [];

		if( ".$%".indexOf( pattern[ i ] ) != -1 )
		{
			range = pattern[ i ++ ];
		}
		else
		{
			for( ; "0123456789".indexOf( pattern[ i ] ) != -1; i ++ )
			{
				range += pattern[ i ];
			}
		}

		var command = "";

		if( "/?".indexOf( pattern[ i ] ) != -1 )
		{
			command = pattern[ i ];
		}
		else
		{
			var cmdReg = /\w/g;
			for( var j = pattern[ i ]; j = pattern[ i ]; i ++ )
			{
				if( j.match( cmdReg ) )
				{
					command += j;
				}
				else break;
			}
		}

		var allowRange = false;
		switch( command )
		{
			case "s":
			case "su":
			case "substitute":
				allowRange = true;
				out[ CMD_TYPE ] = "REPLACE";
				break;
			case "/":
				allowRange = true;
				out[ CMD_TYPE ] = "FIND";
				break;

			case "buffers":
			case "ls":
				out[ CMD_TYPE ] = "BUFFERS";
				break;
			case "w":
			case "write":
				out[ CMD_TYPE ] = "WRITE";
				break;
			case "q":
			case "quit":
				out[ CMD_TYPE ] = "QUIT";
				break;
			case "register":
			case "registers":
				out[ CMD_TYPE ] = "REGISTERS";
				break;
			case "marks":
				out[ CMD_TYPE ] = "MARKS";
				break;
			case "mark":
				out[ CMD_TYPE ] = "MARK";
				break;
			case "ver":
			case "version":
				out[ CMD_TYPE ] = "VERSION";
				break;
			case "h":
			case "help":
				out[ CMD_TYPE ] = "HELP";
				break;
			case "varec":
				out[ CMD_TYPE ] = "VA_REC";
				break;

			case "": // Range jumping
				pattern.push( true );
			case "p":
				allowRange = true;
				out[ CMD_TYPE ] = "PRINT";
				break;
		}

		if( range !== "" )
		{
			if( allowRange ) out[ CMD_RANGE ] = range;
			else out[ CMD_ERR ] = VimError( "E481" );
		}

		out[ CMD_ARGS ] = pattern.slice( i );
		return out;
	};

	/** @type {Components.Vim.IAction} */
	var EDITOR_COMMAND = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	EDITOR_COMMAND.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	EDITOR_COMMAND.prototype.handler = function( e, p )
	{
		e.preventDefault();

		var cmd = ParseCommand( p );

		if( cmd[ CMD_ERR ] )
		{
			this.__msg = cmd[ CMD_ERR ];
			return true;
		}
		else if( !cmd[ CMD_TYPE ] )
		{
			this.__msg = VimError( "E492", p.slice( 1 ).join( "" ) );
			return true;
		}

		try
		{
			ns[ NS_INVOKE ]( cmd[ CMD_TYPE ] );
		}
		catch( ex )
		{
			this.__msg = VimError( "TODO", cmd[ CMD_TYPE ] );
			return true;
		}

		try
		{
			this.__cursor.openRunAction(
				cmd[ CMD_TYPE ], e, false, cmd[ CMD_ARGS ], cmd[ CMD_RANGE ]
			);
			this.__msg = this.__cursor.message;
		}
		catch( ex )
		{
			debug.Error( ex );
		}

		return true;
	};

	EDITOR_COMMAND.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "EDITOR_COMMAND", EDITOR_COMMAND );
})();
