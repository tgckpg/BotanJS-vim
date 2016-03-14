(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {Dandelion} */
	var Dand                                    = __import( "Dandelion" );
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                             = __import( "Dandelion.IDOMElement" );
	/** @type {Dandelion.IDOMObject} */
	var IDOMObject                              = __import( "Dandelion.IDOMObject" );
	/** @type {System.Cycle} */
	var Cycle                                   = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                                   = __import( "System.Debug" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.Cursor.IAction} */
	var INSERT = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.cursor = Cursor;
	};

	INSERT.prototype.dispose = function()
	{
	};

	INSERT.prototype.getMessage = function()
	{
		var l = this.cursor.feeder.firstBuffer.cols;
		var msg = Mesg( "INSERT" );

		for( var i = msg.length; i < l; i ++ ) msg += " ";
		return msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "INSERT", INSERT );
})();
