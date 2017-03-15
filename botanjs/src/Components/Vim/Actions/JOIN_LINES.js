(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                  = __import( "System.Debug" );
	/** @type {Components.Vim.State.Stator} */
	var Stator                                 = __import( "Components.Vim.State.Stator" );
	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );

	var beep = __import( "Components.Vim.Beep" );
	var Mesg = __import( "Components.Vim.Message" );

	var occurance = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.IAction} */
	var JOIN_LINES = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	JOIN_LINES.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	JOIN_LINES.prototype.handler = function( e, range )
	{
		e.preventDefault();

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var start;
		var end;

		var stack;
		var stator;

		var contentUndo;
		if( range )
		{
			start = range.start;
			end = range.close;
		}
		else
		{
			var oPos = cur.aPos;
			cur.lineEnd( true );
			stator = new Stator( cur );
			start = cur.aPos;
			cur.moveY( 1 );
			cur.lineStart();
			end = cur.aPos;

			// This happens on the last line
			if( end < start )
			{
				cur.moveTo( oPos );
				beep();
				return true;
			}

			var content = feeder.content;

			var l = content.length;
			while( "\t ".indexOf( content[ end ] ) != -1 && end < l ) end ++;

			contentUndo = content.substring( start, end );
			feeder.content = content.substring( 0, start ) + " " + content.substr( end );
		}

		feeder.pan();

		cur.moveTo( start );

		var stack = new Stack();
		stack.store( stator.save( 1, contentUndo ) );

		cur.rec.record( stack );
	};

	JOIN_LINES.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "JOIN_LINES", JOIN_LINES );
})();
