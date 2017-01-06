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

	PUT.prototype.handler = function( e, sp, newLine )
	{
		e.preventDefault();

		var cput = this.__cursor.Vim.registers.get();
		if( !cput ) return true;

		var cur = this.__cursor;
		var feeder = cur.feeder;

		var newLine = cput.newLine;

		if( 1 < e.count )
		{
			var oput = cput;
			for( var i = 1; i < e.count; i ++ )
			{
				oput += cput;
			}

			cput = oput;
			oput = null;
		}

		var nLines = occurence( cput, "\n" );
		var clen = cput.length;

		// Compensation
		var c = e.kMap( "P" ) ? 0 : -1;

		if( newLine )
		{
			cur.moveY( -c );
			cur.lineStart();
		}

		var stator = new Stator( cur );
		var aP = cur.aPos;
		var contentUndo = "";

		if( sp == undefined )
		{
			feeder.content = feeder.content.substring( 0, aP )
				+ cput + feeder.content.substring( aP );

			feeder.pan();
			cur.moveTo( 0 < nLines ? aP : aP + clen, true );
		}
		else
		{
			sp ++;
			contentUndo = feeder.content.substring( aP, sp );
			feeder.content = feeder.content.substring( 0, aP )
				+ cput + feeder.content.substring( sp );

			feeder.pan();
			cur.moveTo( aP + clen, true );
		}

		var stack = new Stack();

		if( newLine )
		{
			var f = stator.save( clen, contentUndo );
			stack.store( function()
			{
				f();
				cur.moveY( c );
			} );
		}
		else
		{
			stack.store( stator.save( clen, contentUndo ) );
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
