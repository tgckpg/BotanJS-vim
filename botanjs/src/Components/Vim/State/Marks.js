(function(){
	var ns = __namespace( "Components.Vim.State" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var beep = __import( "Components.Vim.Beep" );

	var Keys = "'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\"[]^.<>";

	var Marks = function()
	{
		this.__marks = {};
	};

	Marks.prototype.set = function( t, line, col )
	{
		if( Keys.indexOf( t ) == -1 )
		{
			beep();
			return false;
		}

		this.__marks[ t ] = [ line, col ];
		return true;
	};

	Marks.prototype.save = function()
	{
		var saved = {};
		// A-z
		for( var i = 1; i < 53; i ++ )
		{
			var k = Keys[ i ];
			if( this.__marks[ k ] != undefined )
			{
				saved[ k ] = this.__marks[ k ];
			}
		}

		return saved;
	};

	Marks.prototype.get = function( t )
	{
		return this.__marks[ t ];
	};

	__const( Marks, "Keys", Keys );

	ns[ NS_EXPORT ]( EX_CLASS, "Marks", Marks );

})();
