(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.State.Stator} */
	var Stator                                 = __import( "Components.Vim.State.Stator" );
	/** @type {Components.Vim.State.Stack} */
	var Stack                                  = __import( "Components.Vim.State.Stack" );

	var Mesg = __import( "Components.Vim.Message" );
	var occurence = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.Cursor.IAction} */
	var PUT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__stator = new Stator( Cursor );
		this.__msg = "";
	};

	PUT.prototype.allowMovement = false;

	PUT.prototype.dispose = function()
	{
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

		var aP = cur.aPos;

		feeder.content = feeder.content.substring( 0, aP )
			+ cput
			+ feeder.content.substring( aP );

		cur.suppressEvent();
		feeder.pan();

		cur.moveTo( 0 < nLines ? aP : aP + clen, true );

		var stack = new Stack();

		stack.store( this.__stator.save( clen, "" ) );
		cur.rec.record( stack );

		this.__put = cput;

		if( nLines )
		{
			this.__msg = Mesg( "LINE_MORE", nLines );
		}

		cur.moveX( -1 );
		cur.unsuppressEvent();

		return true;
	};

	PUT.prototype.getMessage = function()
	{
		console.log( this.__msg );
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "PUT", PUT );
})();
