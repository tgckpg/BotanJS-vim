(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.Cursor.IAction} */
	var YANK = ns[ NS_INVOKE ]( "YANK" );
	/** @type {Components.Vim.Cursor.IAction} */
	var DELETE = ns[ NS_INVOKE ]( "DELETE" );

	/** @type {Components.Vim.Cursor.IAction} */
	var VISUAL = function( Cursor )
	{
		this.__reset( Cursor );
		this.__msg = Mesg( "VISUAL" );
		this.__leaveMesg = "";

		Cursor.blink = false;
		Cursor.pSpace = true;
	};

	VISUAL.prototype.__reset = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__startaP = Cursor.aPos;
		this.__startP = { x: Cursor.X, y: Cursor.Y, p: Cursor.P };
		this.__start = Cursor.PStart;
		this.__selStart = Cursor.PStart;
	};

	VISUAL.prototype.allowMovement = true;

	VISUAL.prototype.dispose = function()
	{
		this.__msg = this.__leaveMesg;
		this.__cursor.blink = true;
		this.__cursor.pSpace = false;
		this.__cursor.PStart = this.__selStart;
		this.__cursor.PEnd = this.__selStart + 1;
	};

	VISUAL.prototype.handler = function( e, done )
	{
		e.preventDefault();

		if( e.ModKeys ) return;

		var cur = this.__cursor;
		var Action = null;

		if( e.kMap( "y" ) )
		{
			Action = new YANK( cur );
		}
		else if( e.kMap( "d" ) )
		{
			Action = new DELETE( cur );
		}

		if( Action )
		{
			cur.suppressEvent();

			// Low-level cursor position adjustment
			// this swap the cursor direction from LTR to RTL
			// i.e. treat all delete as "e<----s" flow
			// to keep the cursor position as the top on UNDO / REDO
			if( Action.constructor == DELETE && this.__startaP < cur.aPos )
			{
				this.__startaP = cur.aPos;
				cur.X = this.__startP.x;
				cur.Y = this.__startP.y;
				cur.P = this.__startP.p;
			}

			Action.handler( e, this.__startaP );
			this.__leaveMesg = Action.getMessage();

			Action.dispose();
			cur.unsuppressEvent();

			this.__selStart = cur.PStart;

			return true;
		}
		else
		{
			if( e.range )
			{
				cur.suppressEvent();

				var r = e.range;

				if( cur.aPos == this.__startaP )
				{
					cur.moveX( r.open - this.__startaP );
					this.__reset( cur );
				}

				cur.unsuppressEvent();
				cur.moveX( r.close - cur.aPos );
			}

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
		}
	};

	VISUAL.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "VISUAL", VISUAL );
})();
