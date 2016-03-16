(function(){
	var ns = __namespace( "Components.Vim.DateTime" );

	var Minute = 60;
	var Hour = 60 * Minute;
	var Day = 24 * Hour;
	var Week = 7 * Day;
	var Month = 30.5 * Day;
	var Year = 365 * Day;

	var Mesg = ns[ NS_INVOKE ]( "String" );

	var PluralHourStrings = [
		"XHoursAgo_2To4",
		"XHoursAgo_EndsIn1Not11",
		"XHoursAgo_EndsIn2To4Not12To14",
		"XHoursAgo_Other"
	];

	var PluralMinuteStrings = [
		"XMinutesAgo_2To4",
		"XMinutesAgo_EndsIn1Not11",
		"XMinutesAgo_EndsIn2To4Not12To14",
		"XMinutesAgo_Other"
	];

	var PluralSecondStrings = [
		"XSecondsAgo_2To4",
		"XSecondsAgo_EndsIn1Not11",
		"XSecondsAgo_EndsIn2To4Not12To14",
		"XSecondsAgo_Other"
	];

	var DayOfWeek = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

	var GetPluralMonth = function( month )
	{
		if ( month >= 2 && month <= 4 )
		{
			return Mesg( "XMonthsAgo_2To4", month );
		}
		else if ( month >= 5 && month <= 12 )
		{
			return Mesg( "XMonthsAgo_5To12", month );
		}
		else
		{
			throw new Error( "Invalid number of Months" );
		}
	};

	var GetLastDayOfWeek = function( dow )
	{
		var result;
		switch ( dow )
		{
			case DayOfWeek.Monday:
				result = Mesg( "last Monday" );
				break;
			case DayOfWeek.Tuesday:
				result = Mesg( "last Tuesday" );
				break;
			case DayOfWeek.Wednesday:
				result = Mesg( "last Wednesday" );
				break;
			case DayOfWeek.Thursday:
				result = Mesg( "last Thursday" );
				break;
			case DayOfWeek.Friday:
				result = Mesg( "last Friday" );
				break;
			case DayOfWeek.Saturday:
				result = Mesg( "last Saturday" );
				break;
			case DayOfWeek.Sunday:
				result = Mesg( "last Sunday" );
				break;
			default:
				result = Mesg( "last Sunday" );
				break;
		}

		return result;
	};

	var GetOnDayOfWeek = function( dow )
	{
		var result;

		switch( dow )
		{
			case DayOfWeek.Monday:
				result = Mesg( "on Monday" );
				break;
			case DayOfWeek.Tuesday:
				result = Mesg( "on Tuesday" );
				break;
			case DayOfWeek.Wednesday:
				result = Mesg( "on Wednesday" );
				break;
			case DayOfWeek.Thursday:
				result = Mesg( "on Thursday" );
				break;
			case DayOfWeek.Friday:
				result = Mesg( "on Friday" );
				break;
			case DayOfWeek.Saturday:
				result = Mesg( "on Saturday" );
				break;
			case DayOfWeek.Sunday:
				result = Mesg( "on Sunday" );
				break;
			default:
				result = Mesg( "on Sunday" );
				break;
		}

		return result;
	};

	var GetPluralTimeUnits = function( units, resources )
	{
		var modTen = units % 10;
		var modHundred = units % 100;

		if ( units <= 1 )
		{
			throw new Error( "Invalid number of Time units" );
		}
		else if ( 2 <= units && units <= 4 )
		{
			return Mesg( resources[ 0 ], units );
		}
		else if ( modTen == 1 && modHundred != 11 )
		{
			return Mesg( resources[ 1 ], units );
		}
		else if ( ( 2 <= modTen && modTen <= 4 ) && !( 12 <= modHundred && modHundred <= 14 ) )
		{
			return Mesg( resources[ 2 ], units );
		}
		else
		{
			return Mesg( resources[ 3 ], units );
		}
	};

	var RelativeTime = function( given )
	{
		var diffSecs = Math.round( 0.001 * ( new Date().getTime() - given.getTime() ) );

		if( Year < diffSecs )
		{
			result = Mesg( "OverAYearAgo" );
		}
		else if( ( 1.5 * Month ) < diffSecs )
		{
			var nMonths = Math.round( ( diffSecs + Month / 2 ) / Month );
			result = GetPluralMonth( nMonths );
		}
		else if( ( 3.5 * Week ) <= diffSecs )
		{
			result = Mesg( "AboutAMonthAgo" );
		}
		else if( Week <= diffSecs )
		{
			var nWeeks = Math.round( diffSecs / Week );
			if ( 1 < nWeeks )
			{
				result = Mesg( "XWeeksAgo_2To4", nWeeks );
			}
			else
			{
				result = Mesg( "AboutAWeekAgo" );
			}
		}
		else if ( ( 5 * Day ) <= diffSecs )
		{
			result = GetLastDayOfWeek( given.getDay() );
		}
		else if ( Day <= diffSecs )
		{
			result = GetOnDayOfWeek( given.getDay() );
		}
		else if ( ( 2 * Hour ) <= diffSecs )
		{
			var nHours = Math.round( diffSecs / Hour );
			result = GetPluralTimeUnits( nHours, PluralHourStrings );
		}
		else if ( Hour <= diffSecs )
		{
			result = Mesg( "AboutAnHourAgo" );
		}
		else if ( ( 2 * Minute ) <= diffSecs )
		{
			var nMinutes = Math.round( diffSecs / Minute );
			result = GetPluralTimeUnits( nMinutes, PluralMinuteStrings );
		}
		else if ( Minute <= diffSecs )
		{
			result = Mesg( "AboutAMinuteAgo" );
		}
		else
		{
			var nSeconds =  1 < diffSecs ? diffSecs : 2;
			result = GetPluralTimeUnits( nSeconds, PluralSecondStrings );
		}

		return result;
	};

	ns[ NS_EXPORT ]( EX_FUNC, "RelativeTime", RelativeTime );
})();
