(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {Components.Vim.State.Stator} */
	var Stator                                 = __import( "Components.Vim.State.Stator" );
	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );

	var Mesg = __import( "Components.Vim.Message" );
	var occurence = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.IAction} */
	var PUT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	PUT.prototype.allowMovement = false;

	PUT.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	PUT.prototype.handler = function( e )
	{
		e.preventDefault();

		// TODO: Get the input for determinating registers
		var inputStack = false;

		var cput = this.__cursor.Vim.registers.get( inputStack );
		if( !cput ) return true;

		var clen = cput.length;
		var nLines = occurence( cput, "\n" );

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var newLine = cput.newLine;

		// Compensation
		var c = e.kMap( "P" ) ? 0 : -1;

		if( newLine )
		{
			cur.moveY( -c );
			cur.lineStart();
		}

		var stator = new Stator( cur );
		var aP = cur.aPos;

		feeder.content = feeder.content.substring( 0, aP )
			+ cput
			+ feeder.content.substring( aP );

		feeder.pan();

		cur.moveTo( 0 < nLines ? aP : aP + clen, true );

		var stack = new Stack();

		if( newLine )
		{
			var f = stator.save( clen, "" );
			stack.store( function()
			{
				f();
				cur.moveY( c );
			} );
		}
		else
		{
			stack.store( stator.save( clen, "" ) );
		}
		cur.rec.record( stack );

		this.__put = cput;

		if( nLines )
		{
			this.__msg = Mesg( "LINES_MORE", nLines );
		}

		cur.moveX( -1 );

		return true;
	};

	PUT.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "PUT", PUT );
})();
