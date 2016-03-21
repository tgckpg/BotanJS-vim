(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {Components.Vim.State.Stack} */
	var Stack                                 = __import( "Components.Vim.State.Stack" );
	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.Cursor.IAction} */
	var VISUAL = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__startaP = Cursor.aPos;
		this.__start = Cursor.PStart;
		this.__selStart = Cursor.PStart;

		Cursor.blink = false;
	};

	VISUAL.prototype.allowMovement = true;

	VISUAL.prototype.dispose = function()
	{
		this.__cursor.blink = true;
		this.__cursor.PStart = this.__selStart;
		this.__cursor.PEnd = this.__selStart + 1;
	};


	VISUAL.prototype.handler = function( e )
	{
		e.preventDefault();

		if( [ 16, 17, 18 ].indexOf( e.keyCode ) != -1 ) return;
		var cur = this.__cursor;
		var prevPos = this.__start;
		var newPos = cur.PStart;

		var posDiff = newPos - prevPos;
		if( 0 <= posDiff )
		{
			this.__selStart = newPos;
			newPos = newPos + 1;
		}
		else if( posDiff < 0 )
		{
			prevPos += posDiff;
			newPos = this.__start + 1;
			this.__selStart = prevPos;
		}

		cur.PStart = prevPos;
		cur.PEnd = newPos;
	};

	VISUAL.prototype.getMessage = function()
	{
		var msg = Mesg( "VISUAL" );

		return msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "VISUAL", VISUAL );
})();
