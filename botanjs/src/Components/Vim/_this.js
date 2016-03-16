(function(){
	var ns = __namespace( "Components.Vim" );

	var messages = {
		"INSERT": "-- INSERT --"
		, "REPLACE": "-- REPLACE --"
		, "MORE": "-- MORE --"
		, "VISLINE": "-- VISUAL LINE --"
		, "WRITE": "\"%1\" %2L, %3C written"
		, "CONTINUE": "Press ENTER or type command to continue"
		, "SEARCH_HIT_BOTTOM": "Seach hit BOTTOM, contining at TOP"
		, "TOP": "Top"
		, "BOTTOM": "Bot"
		, "ALL": "All"
		, "EXIT": "Type :quit<Enter>  to exit Vim"

		, "UNDO_LIMIT": "Already at oldest change"
	};

	var errors = {
		"E486": "E486: Pattern not found: %1"
	};

	var GetString = function( arr, key, restArgs )
	{
		if( arr[ key ] == undefined ) return key;

		var i = 0;
		return arr[ key ].replace( /%\d+/g, function( e )
		{
			return restArgs[ i ++ ];
		} );
	};

	var Message = function( key )
	{
		var restArgs = Array.prototype.slice.call( arguments, 1 );
		return GetString( messages, key, restArgs );
	};

	var Error = function( key )
	{
		var restArgs = Array.prototype.slice.call( arguments, 1 );
		return GetString( errors, key, restArgs );
	};

	ns[ NS_EXPORT ]( EX_FUNC, "Message", Message );
	ns[ NS_EXPORT ]( EX_FUNC, "Error", Error );
})();
