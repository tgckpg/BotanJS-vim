(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	/** @type {Components.Vim.State.Stator} */
	var Stator                                 = __import( "Components.Vim.State.Stator" );
	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );

	var Mesg = __import( "Components.Vim.Message" );
	var beep = __import( "Components.Vim.Beep" );

	var occurence = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.IAction} */
	var DELETE = function( Cursor, e )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__nline = 0;
		this.__startX = Cursor.aPos;
		this.__panY = this.__cursor.feeder.panY;

		this.__cMode = e && e.kMap( "c" );
		this.__cMode_c = false;
		this.__enterEvent = e;

		Cursor.suppressEvent();
	};

	DELETE.prototype.allowMovement = true;

	DELETE.prototype.dispose = function()
	{
		var cur = this.__cursor;
		cur.unsuppressEvent();

		if( this.__cMode )
		{
			if( this.__cMode_c ) // Append, a
			{
				cur.fixTab();
				cur.moveX( 1, false, true, true );
			}
			else // Insert, i
			{
				cur.moveX( -1, true );
				cur.moveX( 1, true, true, true );
			}

			setTimeout( function() {
				cur.openAction( "INSERT", this.__enterEvent );
			}, 20 );
		}
	};

	DELETE.prototype.handler = function( e, sp, newLine )
	{
		e.preventDefault();

		if( e.ModKeys ) return;

		/** @type {Components.Vim.State.Registers} */
		var reg = e.target.registers;

		var cur = this.__cursor;
		var feeder = cur.feeder;

		// Do nothing if content is considered empty
		if( feeder.firstBuffer.next.placeholder && feeder.content.length < 2 )
		{
			debug.Info( "Content is empty" );
			return true;
		}

		var Triggered = false;

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
				// Remove to Cursor jumps
				else if( this.__startX < currAp )
				{
					// Swap the movement
					// This is to move the REDO / UNDO Cursor
					// position to the earlier position
					sp = currAp;
					cur.moveTo( this.__startX );

					// Special case for cw dn cursor jumps that
					// does not remove the start position
					if( e.kMap( "w" ) || e.kMap( "n" ) ) sp --;
				}
			}
			// Remove the current line
			else
			{
				if( e.kMap( "d" ) )
				{
					newLine = true;
					cur.lineEnd( true );
					sp = cur.aPos;
					cur.lineStart();
				}
				else if( this.__cMode && e.kMap( "c" ) )
				{
					cur.lineEnd();
					sp = cur.aPos;
					cur.lineStart( true );
					this.__cMode_c = true;
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

		// last "\n" padding
		var c = feeder.content.slice( 0, -1 );

		var s = sp;
		var e = cur.aPos;

		if( e < s )
		{
			s = cur.aPos;
			e = sp;
		}

		// For removing the very last line
		if( c[ sp ] == undefined ) s --;

		var removed = c.substring( s, e + 1 );
		reg.change( removed, newLine );

		this.__nline = occurence( removed, "\n" );

		feeder.content = c.substring( 0, s ) + c.substring( e + 1 ) + "\n";

		// Try to keep the original panning if possible
		feeder.pan( undefined
			, this.__panY < feeder.panY
				? this.__panY - feeder.panY
				: undefined
		);
		cur.moveTo( s );

		var stator = new Stator( cur, s );
		var stack = new Stack();

		var f = stator.save( 0, removed );
		stack.store( function() {
			f();
			// Offset correction after REDO / UNDO
			cur.moveX( 1 );
		} );

		cur.rec.record( stack );

		return Triggered;
	};

	DELETE.prototype.getMessage = function()
	{
		if( this.__nline )
		{
			return Mesg( "LINES_FEWER", this.__nline );
		}

		return "";
	};

	ns[ NS_EXPORT ]( EX_CLASS, "DELETE", DELETE );
})();
