(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	/** @type {Components.Vim.State.Stator} */
	var Stator                                 = __import( "Components.Vim.State.Stator" );
	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );

	var Mesg = __import( "Components.Vim.Message" );

	var occurence = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.Cursor.IAction} */
	var DELETE = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__nline = 0;
		this.__startX = Cursor.aPos;
	};

	DELETE.prototype.allowMovement = true;

	DELETE.prototype.dispose = function()
	{

	};

	DELETE.prototype.handler = function( e, sp )
	{
		e.preventDefault();


		/** @type {Components.Vim.State.Registers} */
		var reg = e.target.registers;

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var Triggered = false;

		if( sp == undefined )
		{
			if( this.__startX != cur.aPos )
			{
				Triggered = true;

				if( e.kMap( "l" ) )
				{
					cur.moveX( -1 );
				}

				sp = this.__startX;
			}
			else return;
		}

		var c = feeder.content;

		var s = sp;
		var e = cur.aPos;

		if( e < s )
		{
			s = cur.aPos;
			e = sp;
		}

		var removed = c.substring( s, e + 1 );
		reg.change( removed );

		this.__nline = occurence( removed, "\n" );

		feeder.content = c.substring( 0, s ) + c.substring( e + 1 );

		var stator = new Stator( cur, s );
		var stack = new Stack();

		c = c[ e + 1 ];
		if( c == "\n" || c == undefined )
		{
			cur.suppressEvent();
			cur.moveX( -1 );
			cur.unsuppressEvent();
		}

		var f = stator.save( 0, removed );
		stack.store( function() {
			f();
			// Offset correction after REDO / UNDO
			cur.moveX( 1 );
		} );

		cur.rec.record( stack );

		feeder.pan();

		return Triggered;
	};

	DELETE.prototype.getMessage = function()
	{
		if( this.__nline )
		{
			return Mesg( "LINE_FEWER", this.__nline );
		}

		return "";
	};

	ns[ NS_EXPORT ]( EX_CLASS, "DELETE", DELETE );
})();
