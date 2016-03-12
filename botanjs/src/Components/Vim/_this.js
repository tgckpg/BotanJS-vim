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

	var messages = {
		"INSERT": "-- INSERT --"
		, "MORE": "-- MORE --"
		, "WRITE": "\"%1\" %2L, %3C written"
		, "CONTINUE": "Press ENTER or type command to continue"
		, "SEARCH_HIT_BOTTOM": "Seach hit BOTTOM, contining at TOP"
		, "TOP": "Top"
		, "BOTTOM": "Bot"
		, "ALL": "All"
		, "EXIT": "Type :quit<Enter>  to exit Vim"
	};

	var errors = {
		"E486": "E486: Pattern not found: %1"
	};

	var Message = function( key )
	{
		var restArgs = Array.prototype.slice.apply( arguments, 1 );
		var i = 0;
		return messages[ key ].replace( /%\d+/g, function( e )
		{
			return restArgs[ i ++ ];
		} );
	};

	ns[ NS_EXPORT ]( EX_FUNC, "Message", Message );
})();
