(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	/** @type {Components.Vim.IAction} */
	var PRINT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
	};

	PRINT.prototype.dispose = function() { };
	PRINT.prototype.handler = function( e, args, range )
	{
		e.preventDefault();

		if( args[0] === true )
		{
			switch( range )
			{
				case "%":
				case "$":
					this.__cursor.moveY( Number.MAX_VALUE );
					return;
				case ".":
					this.__cursor.lineStart( true );
					break;
				case "":
				default:
					var lineNum = parseInt( range ) - 1;
					if( lineNum )
					{
						this.__cursor.gotoLine( 0 < lineNum ? lineNum : 0 );
					}
			}
		}
	};

	PRINT.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "PRINT", PRINT );
})();
