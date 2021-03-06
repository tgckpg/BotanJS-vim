(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );

	var occurance = __import( "System.utils.Perf.CountSubstr" );

	/** @type {Components.Vim.IAction} */
	var WRITE = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	WRITE.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	WRITE.prototype.handler = function( e, p )
	{
		e.preventDefault();

		var wtarget = "DEFAULT";
		if( p )
		{
			wtarget = p.join( "" ).trim().toUpperCase();
		}

		var quit = false;

		var cur = this.__cursor;
		var Vim = cur.Vim;
		switch( wtarget )
		{
			case "C":
				var data = cur.feeder.content.slice( 0, -1 );
				var tail = "/* Press Ctrl + C to copy the contents. Escape to continue editing. */"
				setTimeout( function() {
					Vim.display(
						data + tail, function(){
						Vim.stage.element.selectionStart = 0;
						Vim.stage.element.selectionEnd = data.length;
					} );
				}, 1 );
				break;
			case "Q":
				quit = true;
			default:
				Vim.content = cur.feeder.content.slice( 0, -1 );
		}

		if( quit )
		{
			Vim.dispose();
			return true;
		}

		var msg = Mesg( "WRITE", Vim.stage.element.id, occurance( Vim.content, "\n" ), Vim.content.length );
		cur.rec.save();

		var l = this.__cursor.feeder.firstBuffer.cols;
		for( var i = msg.length; i < l; i ++ ) msg += " ";

		this.__msg = msg;
	};

	WRITE.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "WRITE", WRITE );
})();
