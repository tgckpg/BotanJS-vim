(function(){
	var ns = __namespace( "Components.Vim.State" );

	var Stack = function()
	{
	};

	Stack.prototype.store = function( handler )
	{
		this.__handler = handler;
	};

	Stack.prototype.play = function()
	{
		if( this.__handler ) this.__handler();
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Stack", Stack );
})();
