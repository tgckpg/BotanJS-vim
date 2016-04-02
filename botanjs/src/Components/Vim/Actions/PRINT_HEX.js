(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	/** @type {Components.Vim.IAction} */
	var PRINT_HEX = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
	};

	PRINT_HEX.prototype.dispose = function()
	{
	};

	PRINT_HEX.prototype.handler = function( e )
	{
		e.preventDefault();
		var str = unescape( encodeURIComponent( this.__cursor.feeder.content[ this.__cursor.aPos ] ) );
		var l = str.length;
		var msg = [];
		for( var i = 0; i < l; i ++ )
		{
			 msg[i] = str[i] == "\n"
				 ? "a"
				 : str.charCodeAt( i ).toString( 16 )
				 ;

			 if( msg[i].length == 1 )
			 {
				 msg[i] = "0" + msg[i];
			 }
			 else if( msg[i].length == 0 )
			 {
				 msg[i] = "00";
			 }
		}

		this.__msg = msg.join( " " );
	};

	PRINT_HEX.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "PRINT_HEX", PRINT_HEX );
})();
