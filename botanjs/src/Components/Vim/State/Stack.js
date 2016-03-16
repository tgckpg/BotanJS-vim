(function(){
	var ns = __namespace( "Components.Vim.State" );

	/** @type {Components.Vim.DateTime} */
	var RelativeTime = __import( "Components.Vim.DateTime.RelativeTime" );

	var Stack = function() { };

	Stack.prototype.store = function( handler )
	{
		this.__handler = handler;
		this.__time = new Date();
		this.id = 0;
	};

	Stack.prototype.play = function()
	{
		if( this.__handler ) this.__handler();
	};

	__readOnly( Stack.prototype, "time", function()
	{
		return RelativeTime( this.__time );
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "Stack", Stack );
})();
