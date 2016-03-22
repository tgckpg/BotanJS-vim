(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );
	/** @type {Components.Vim.Controls} */
	var Controls = __import( "Components.Vim.Controls" );

	/** @type {Components.Vim.Cursor.IAction} */
	var YANK = ns[ NS_INVOKE ]( "YANK" );
	/** @type {Components.Vim.Cursor.IAction} */
	var DELETE = ns[ NS_INVOKE ]( "DELETE" );

	/** @type {Components.Vim.Cursor.IAction} */
	var VISUAL = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__startaP = Cursor.aPos;
		this.__start = Cursor.PStart;
		this.__selStart = Cursor.PStart;
		this.__msg = Mesg( "VISUAL" );
		this.__leaveMesg = "";

		Cursor.blink = false;
	};

	VISUAL.prototype.allowMovement = true;

	VISUAL.prototype.dispose = function()
	{
		this.__msg = this.__leaveMesg;
		this.__cursor.blink = true;
		this.__cursor.PStart = this.__selStart;
		this.__cursor.PEnd = this.__selStart + 1;
	};

	VISUAL.prototype.handler = function( e, done )
	{
		e.preventDefault();

		if( Controls.ModKeys( e ) ) return;

		var Action = null;
		switch( true )
		{
			case Controls.KMap( e, "y" ):
				Action = new YANK( this.__cursor );
				break;
			case Controls.KMap( e, "d" ):
				Action = new DELETE( this.__cursor );
				break;
		}

		if( Action )
		{
			Action.handler( e );
			this.__leaveMesg = Action.getMessage();
			Action.dispose();

			return true;
		}

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
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "VISUAL", VISUAL );
})();
