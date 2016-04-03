(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var beep = __import( "Components.Vim.Beep" );

	/** @type {Components.Vim.IAction} */
	var TO = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "<TO COMMAND>";
		Cursor.suppressEvent();
	};

	TO.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	TO.prototype.handler = function( em, et )
	{
		et.preventDefault();

		var cur = this.__cursor;
		var f = cur.feeder;
		var n = cur.getLine().lineNum;

		var p = f.content.indexOf( "\n" );
		for( i = 1; p != -1 && i < n; i ++ )
		{
			p = f.content.indexOf( "\n", p + 1 );
		}

		var upperLimit = f.content.indexOf( "\n", p + 1 );

		if( 0 < n ) p ++;

		var lowerLimmit = p;

		var cX = cur.X;
		var tX = cX;

		var Char = et.key;
		if( et.kMap( "Tab" ) )
		{
			Char = "\t";
		}

		if( 1 < Char.length )
		{
			beep();
			return;
		}

		// Forward
		if( em.kMap( "t" ) || em.kMap( "f" ) )
		{
			tX = f.content.indexOf( Char, p + cX + 1 );
		}
		// backward
		else
		{
			tX = f.content.lastIndexOf( Char, p + cX - 1 );
		}

		if( lowerLimmit <= tX && tX < upperLimit )
		{
			cur.moveX( tX - lowerLimmit - cX );
		}
		else beep();
	};

	TO.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "TO", TO );
})();
