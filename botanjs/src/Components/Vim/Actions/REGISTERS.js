(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var VimError = __import( "Components.Vim.Error" );
	var Mesg = __import( "Components.Vim.Message" );

	var ESCAPE = function( reg )
	{
		var str = reg.toString();
		return str.replace( "\t", "^I" ).replace( "\n", "^J" );
	};

	/** @type {Components.Vim.IAction} */
	var REGISTERS = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	REGISTERS.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	REGISTERS.prototype.handler = function( e, p )
	{
		e.preventDefault();

		/** @type {Components.Vim.State.Registers} */
		var reg = e.target.registers;

		var msg = ":register";
		msg += "\n" + Mesg( "REGISTERS" );

		var regs = "\"0123456789-.:%/=";
		for( var i = 0, j = regs[ i ]; j != undefined; i ++, j = regs[ i ] )
		{
			var r = reg.get( j );
			if( r )
			{
				msg += "\n\"" + j + "   " + ESCAPE( r );
			}
		}

		var lastLine = Mesg( "WAIT_FOR_INPUT" );

		var l = this.__cursor.feeder.firstBuffer.cols;
		for( var i = msg.length; i < l; i ++ ) msg += " ";

		this.__msg = msg + "\n" + lastLine;
	};

	REGISTERS.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "REGISTERS", REGISTERS );
})();
