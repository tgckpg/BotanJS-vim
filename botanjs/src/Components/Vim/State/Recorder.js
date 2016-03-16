(function(){
	var ns = __namespace( "Components.Vim.State" );

	var Recorder = function()
	{
		this.__steps = [];
		this.__stacks = [];
		this.__i = 0;
		this.__j = 0;
	};

	Recorder.prototype.undo = function()
	{
		var i = this.__i - 1;
		if( i == -1 || !this.__steps.length ) return null;


		return this.__steps[ this.__i = i ];
	};

	Recorder.prototype.redo = function()
	{
		var State = this.__steps[ this.__i ];

		if( State )
		{
			this.__i ++;
			return State;
		}

		return null;
	};

	Recorder.prototype.record = function( StateObj )
	{
		this.__steps[ this.__i ++ ] = StateObj;
		this.__stacks[ this.__j ++ ] = StateObj;

		delete this.__steps[ this.__i ];

		StateObj.id = this.__j;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Recorder", Recorder );
})();
