(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                             = __import( "System.Debug" );
	/** @type {Dandelion} */
	var Dand                              = __import( "Dandelion" );

	var Mesg = __import( "Components.Vim.Message" );

	var occurance = __import( "System.utils.Perf.CountSubstr" );

	var shadowImport = __import;

	var ESCAPE = function( reg )
	{
		var str = reg.toString();
		return str.replace( "\t", "^I" ).replace( "\n", "^J" );
	};

	/** @type {Components.Vim.IAction} */
	var BUFFERS = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	BUFFERS.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	BUFFERS.prototype.handler = function( e, p )
	{
		e.preventDefault();

		var areas = Dand.tag( "textarea" );

		var cur = this.__cursor;
		var Vim = cur.Vim;

		/** @type {Components.Vim.VimArea} */
		var VimArea = shadowImport( "Components.Vim.VimArea" );
		var Insts = VimArea.Instances;


		var msg = ":buffers";

		var l = Insts.length;
		for( var i = 0; i < l; i ++ )
		{
			/** @type {Components.Vim.VimArea} */
			var inst = Insts[ i ];
			if( !inst ) continue;

			var b = inst.index + " ";
			var icur = inst.contentFeeder.cursor;
			b += ( inst == Vim ? "%a" : "  " ) + " ";
			b += ( icur.rec.changed ? "+" : " " ) + " ";

			b += "\"" + inst.stage.element.id + "\"" + " line " + ( icur.getLine().lineNum + 1 );


			msg += "\n  " + b;
		}

		var lastLine = Mesg( "WAIT_FOR_INPUT" );

		var l = this.__cursor.feeder.firstBuffer.cols;
		for( var i = msg.length; i < l; i ++ ) msg += " ";

		this.__msg = msg + "\n" + lastLine;
	};

	BUFFERS.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "BUFFERS", BUFFERS );
})();
