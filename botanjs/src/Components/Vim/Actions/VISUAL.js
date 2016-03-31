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

		Cursor.blink = false;
		Cursor.pSpace = true;
	};

	VISUAL.prototype.__reset = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__startaP = Cursor.aPos;
		this.__start = Cursor.PStart;
		this.__selStart = Cursor.PStart;
	};

	VISUAL.prototype.allowMovement = true;

	VISUAL.prototype.dispose = function()
	{
		var c = this.__cursor;

		c.blink = true;
		c.pSpace = false;
		c.PStart = this.__selStart;
		c.PEnd = this.__selStart + 1;

		// This fix the highlighting position of missing phantomSpace
		// for maximum filled line
		if( c.feeder.wrap && 0 < c.X )
		{
			c.suppressEvent();
			c.moveX( -1 );
			c.moveX( 1 );
			c.unsuppressEvent();
		}
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
				var o = cur.aPos;
				cur.moveTo( this.__startaP, true );
				this.__startaP = o;
			}

			Action.handler( e, this.__startaP );

			if( Action.constructor != DELETE )
			{
				cur.moveTo( this.__startaP );
			}

			this.__msg = Action.getMessage();

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
					cur.moveTo( r.open, true );
					this.__reset( cur );
				}

				cur.unsuppressEvent();
				cur.moveTo( r.close, true );
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
