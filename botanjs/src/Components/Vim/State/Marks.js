(function(){
	var ns = __namespace( "Components.Vim.State" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var Keys = "'ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxy\"[]^.<>";

	var Marks = function()
	{
		this.__marks = {};
	};

	Marks.prototype.set = function( t, line, col )
	{
		if( Keys.indexOf( t ) == -1 ) return false;

		this.__marks[ t ] = [ line, col ];
		return true;
	};

	Marks.prototype.get = function( t )
	{
		return this.__marks[ t ];
	};

	__readOnly( Marks, "Keys", function() { return Keys; } );

	ns[ NS_EXPORT ]( EX_CLASS, "Marks", Marks );

})();
