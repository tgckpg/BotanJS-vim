(function(){ var ns = __namespace( "Components.Vim" );

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

	/** @type {Components.VimArea.LineFeeder} */
	var LineFeeder = ns[ NS_INVOKE ]( "LineFeeder" );

	var StatusBar = function( cols )
	{
		this.cols = cols;
		this.statStamp = {};
	};

	StatusBar.prototype.stamp = function( pos, func )
	{
		this.statStamp[ pos ] = func;
	};

	__readOnly( StatusBar.prototype, "statusText", function()
	{
		var display = "";
		var l = this.cols;

		for( var i = 0; i < l; i ++ )
		{
			var avail = l - i;
			var text = this.statStamp[ i ] || this.statStamp[ - avail ];
			if( text )
			{
				text = text();
				display += text.substr( 0, avail );
				i = display.length - 1;
			}
			else display += " ";
		}

		return display;
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "StatusBar", StatusBar );
})();
