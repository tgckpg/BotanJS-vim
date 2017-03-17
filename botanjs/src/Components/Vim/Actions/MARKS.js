(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                 = __import( "System.Debug" );

	var VimError = __import( "Components.Vim.Error" );
	var Mesg = __import( "Components.Vim.Message" );

	/** @type {System.Debug} */
	var Marks = __import( "Components.Vim.State.Marks" );
	var Keys = Marks.Keys;

	/** @type {Components.Vim.IAction} */
	var MARKS = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = "";
		Cursor.suppressEvent();
	};

	MARKS.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	MARKS.prototype.handler = function( e, p )
	{
		e.preventDefault();

		/** @type {Components.Vim.State.Marks} */
		var marks = e.target.marks;

		var msg = ":marks";

		/**
		 * Regarding to marks 0-9, from Vim docs
		 *   Numbered marks '0 to '9 are quite different.  They can not be set directly.
		 *   They are only present when using a viminfo file viminfo-file.  Basically '0
		 *   is the location of the cursor when you last exited Vim, '1 the last but one
		 *   time, etc.  Use the "r" flag in 'viminfo' to specify files for which no
		 *   Numbered mark should be stored.  See viminfo-file-marks.
		 * TODO: Need to redefine marks 0-9
		 **/

		// Fuck this, use silly paddings
		msg += "\nmark line  col file/text";

		var feeder = this.__cursor.feeder;
		var chopLen = feeder.firstBuffer.cols + 1;

		for( var i = 0, j = Keys[ i ]; j != undefined; i ++, j = Keys[ i ] )
		{
			var r = marks.get( j );
			if( !r ) continue;

			var line = ( r[0] + 1 ) + "";
			var col = ( r[1] + 1 ) + "";
			var t = feeder.line( r[0] - 1 ).replace( /^[\t ]+/, "" );

			var ll = 4 - line.length;
			for( var il = 0; il < ll; il ++ ) line = " " + line;

			var ll = 3 - col.length;
			for( var il = 0; il < ll; il ++ ) col = " " + col;

			msg += ( "\n " + j + "   " + line + "  " + col + " " + t ).substring( 0, chopLen );
		}

		var lastLine = Mesg( "WAIT_FOR_INPUT" );

		var l = this.__cursor.feeder.firstBuffer.cols;
		for( var i = msg.length; i < l; i ++ ) msg += " ";

		this.__msg = msg + "\n" + lastLine;
	};

	MARKS.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "MARKS", MARKS );
})();
