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
	var VERSION = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	VERSION.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	VERSION.prototype.handler = function( e, p )
	{
		e.preventDefault();

		/** @type {Components.Vim.State.Registers} */
		var reg = e.target.registers;

		var msg = ":version";
		msg += "\nVim;Re - Vim; Reverse Engineered for textarea v" + VIMRE_VERSION;
		msg += "\n  + BotanJS - v" + BOTANJS_VERSION;
		msg += "\nProject home - https://github.com/tgckpg/BotanJS-vim";
		msg += "\n  by \u659F\u914C\u9D6C\u5144 (penguin) - https://blog.astropenguin.net/";
		msg += "\n";

		var lastLine = Mesg( "WAIT_FOR_INPUT" );

		var l = this.__cursor.feeder.firstBuffer.cols;
		for( var i = msg.length; i < l; i ++ ) msg += " ";

		this.__msg = msg + "\n" + lastLine;
	};

	VERSION.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "VERSION", VERSION );
})();
