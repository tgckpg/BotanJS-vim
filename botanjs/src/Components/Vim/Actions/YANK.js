(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );
	var beep = __import( "Components.Vim.Beep" );

	var occurence = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.Cursor.IAction} */
	var YANK = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__startX = Cursor.aPos;
		this.__msg = "";

		Cursor.suppressEvent();
	};

	YANK.prototype.allowMovement = true;

	YANK.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	YANK.prototype.handler = function( e, sp )
	{
		e.preventDefault();

		if( e.ModKeys || e.kMap( "i" ) ) return;

		/** @type {Components.Vim.State.Registers} */
		var reg = e.target.registers;

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var Triggered = false;

		var newLine = false;
		if( sp == undefined )
		{
			Triggered = true;

			sp = this.__startX;

			var currAp = cur.aPos;
			if( this.__startX != currAp )
			{
				// Remove to start
				if( e.kMap( "^" ) )
				{
					sp --;
				}
				// Remove char in cursor
				else if( e.kMap( "l" ) )
				{
					cur.moveX( -1 );
				}
				// Remove char before cursor
				else if( e.kMap( "h" ) )
				{
					sp = currAp;
				}
				// Remove the current and the following line
				else if( e.kMap( "j" ) )
				{
					newLine = true;
					cur.lineEnd( true );
					sp = cur.aPos;
					cur.moveY( -1 );
					cur.lineStart();
					this.__startX = cur.aPos;
				}
				// Remove the current and the preceding line
				else if( e.kMap( "k" ) )
				{
					newLine = true;
					cur.moveY( 1 );
					cur.lineEnd( true );
					sp = cur.aPos;
					cur.moveY( -1 );
					cur.lineStart();
				}
				else if( this.__startX < currAp )
				{
					// Swap the movement
					// This is to move the REDO / UNDO Cursor
					// position to the earlier position
					sp = currAp;
					cur.moveTo( this.__startX );
				}
			}
			// Remove the current line
			else
			{
				if( e.kMap( "y" ) )
				{
					newLine = true;
					cur.lineEnd( true );
					sp = cur.aPos;
					cur.lineStart();
				}
				else if( e.range )
				{
					sp = e.range.close;
					cur.moveTo( e.range.open, true );
				}
				else if( e.kMap( "^" ) )
				{
					// Do nothing as nothing can be removed
					// since there is no successful movement
					return true;
				}
				// this is the same as kMap( "h" ) above
				else if( e.kMap( "$" ) )
				{
					sp = cur.aPos;
				}
				else
				{
					beep();
					return true;
				}
			}
		}

		var s = sp;
		var e = cur.aPos;

		if( e < s )
		{
			s = cur.aPos;
			e = sp;
		}

		cur.moveTo( s );

		var yText = cur.feeder.content.substring( s, e + 1 );

		reg.yank( yText, newLine );

		var nline = occurence( yText, "\n" );
		if( nline )
		{
			this.__msg = Mesg( "LINES_YANKED", nline );
		}

		return Triggered;
	};

	YANK.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "YANK", YANK );
})();
