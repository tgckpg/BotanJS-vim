(function(){
	var ns = __namespace( "Components.Vim.State" );

	var Recorder = function()
	{
		this.__steps = [];
		this.__i = 0;
	};

	Recorder.prototype.undo = function()
	{
		var i = this.__i - 1;
		if( i == -1 || !this.__steps.length ) return null;


		this.__i -= 2;
		return this.__steps[ i ];
	};

	Recorder.prototype.redo = function()
	{
		var i = this.__i + 1;
		if( i == -1 || !this.__steps.length ) return null;

		var State = this.__steps[ i ];
		if( State )
		{
			this.__i += 2;
			return State;
		}

		return null;
	};

	Recorder.prototype.record = function( StateObj )
	{
		this.__steps[ this.__i ] = StateObj;
		StateObj.id = this.__i;

		delete this.__steps[ ++ this.__i ];
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Recorder", Recorder );
})();
