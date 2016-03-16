(function(){
	var ns = __namespace( "Components.Vim.DateTime" );

	var messages = {
		  "AboutAMinuteAgo"                 : "about a minute ago"
		, "AboutAMonthAgo"                  : "about a month ago"
		, "AboutAnHourAgo"                  : "about an hour ago"
		, "AboutAWeekAgo"                   : "about a week ago"
		, "last Friday"                     : "last Friday"
		, "last Monday"                     : "last Monday"
		, "last Saturday"                   : "last Saturday"
		, "last Sunday"                     : "last Sunday"
		, "last Thursday"                   : "last Thursday"
		, "last Tuesday"                    : "last Tuesday"
		, "last Wednesday"                  : "last Wednesday"
		, "on Friday"                       : "on Friday"
		, "on Monday"                       : "on Monday"
		, "on Saturday"                     : "on Saturday"
		, "on Sunday"                       : "on Sunday"
		, "on Thursday"                     : "on Thursday"
		, "on Tuesday"                      : "on Tuesday"
		, "on Wednesday"                    : "on Wednesday"
		, "OverAYearAgo"                    : "over a year ago"
		, "XHoursAgo_2To4"                  : "%1 hours ago"
		, "XHoursAgo_EndsIn1Not11"          : "%1 hours ago"
		, "XHoursAgo_EndsIn2To4Not12To14"   : "%1 hours ago"
		, "XHoursAgo_Other"                 : "%1 hours ago"
		, "XMinutesAgo_2To4"                : "%1 minutes ago"
		, "XMinutesAgo_EndsIn1Not11"        : "%1 minutes ago"
		, "XMinutesAgo_EndsIn2To4Not12To14" : "%1 minutes ago"
		, "XMinutesAgo_Other"               : "%1 minutes ago"
		, "XMonthsAgo_2To4"                 : "%1 months ago"
		, "XMonthsAgo_5To12"                : "%1 months ago"
		, "XSecondsAgo_2To4"                : "%1 seconds ago"
		, "XSecondsAgo_EndsIn1Not11"        : "%1 seconds ago"
		, "XSecondsAgo_EndsIn2To4Not12To14" : "%1 seconds ago"
		, "XSecondsAgo_Other"               : "%1 seconds ago"
		, "XWeeksAgo_2To4"                  : "%1 weeks ago"
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

	var DateTimeString = function( key )
	{
		var restArgs = Array.prototype.slice.call( arguments, 1 );
		return GetString( messages, key, restArgs );
	};

	ns[ NS_EXPORT ]( EX_FUNC, "String", DateTimeString );
})();
