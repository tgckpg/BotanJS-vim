(function(){
	var ns = __namespace( "Components.Vim" );

	var debug = __import( "System.Debug" );

	/** @type {Components.VimArea.LineFeeder} */
	var LineFeeder = ns[ NS_INVOKE ]( "LineFeeder" );

	var StatusBar = function( cols )
	{
		this.cols = cols;
		this.statStamp = {};
		this.override = null;
	};

	StatusBar.prototype.stamp = function( pos, func )
	{
		this.statStamp[ pos ] = func;
	};

	StatusBar.prototype.override;

	__readOnly( StatusBar.prototype, "statusText", function()
	{
		if( this.override ) return this.override();

		var display = "";
		var l = this.cols;

		for( var i = 0; i < l; i ++ )
		{
			var avail = l - i;
			var text = this.statStamp[ i ] || this.statStamp[ - avail ];
			if( text )
			{
				text = text();
				if( text == undefined || text === "" ) continue;

				if( i == 0 && l <= text.length ) return text;

				display += text.substr( 0, avail );
				i = display.length;
			}
			else display += " ";
		}

		return display;
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "StatusBar", StatusBar );
})();
