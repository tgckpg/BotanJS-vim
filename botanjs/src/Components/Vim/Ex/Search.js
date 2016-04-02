(function(){
	var ns = __namespace( "Components.Vim.Ex" );

	/** @type {System.Cycle} */
	var Cycle                        = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                        = __import( "System.Debug" );
	/** @type {System.utils.Perf} */
	var Perf                         = __import( "System.utils.Perf" );

	var Mesg = __import( "Components.Vim.Message" );

	/** @type {Components.Vim.Cursor.IAction} */
	var Search = function( Cursor )
	{
		var _self = this;

		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;

		this.__statusBar = Cursor.Vim.statusBar;

		this.__command = [];
		this.__blinkId = "ExSearchBlinkCycle" + Perf.uuid;
		this.__curPos = 0;

		this.__disp = function()
		{
		};

        var feeder = Cursor.feeder;

		var __blink = false;
		var __holdBlink = false;
		this.__blink = function()
		{
			__blink = true;
			__holdBlink = true
		};

		Cycle.perma( this.__blinkId, function()
		{
			if( __holdBlink ) __holdBlink = false;
			else __blink = !__blink;

			feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
		}, 600 );

		this.__doBlink = function()
		{
			var c = "";
			var comm = _self.__command;
			var pos = _self.__curPos;
			var cLen = comm.length;
			var faced = true;

			for( var i = 0; i < cLen; i ++ )
			{
				var v = comm[i];
				if( __blink && i == pos )
				{
					face = true;
					v = Cursor.face + v.substr( 1 );
				}

				c+= v;
			}

			if( __blink && cLen <= pos )
			{
				c += Cursor.face;
			}

			return c;
		};

		this.__statusBar.override = this.__doBlink;
	};

	Search.prototype.dispose = function()
	{
		this.__statusBar.override = null;

		Cycle.permaRemove( this.__blinkId );
		var feeder = this.__cursor.feeder;
		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	Search.prototype.handler = function( e )
	{
		e.preventDefault();

		if( e.ModKeys ) return;

		this.__blink();

		var InputKey = null;

		if( e.kMap( "Tab" ) )
		{
			InputKey = "^I";
		}
		else if( e.kMap( "C-v" ) )
		{
			this.__direct = true;
		}
		else if( e.kMap( "BS" ) )
		{
			this.__command.splice( --this.__curPos, 1 );
			if( this.__command.length == 0 ) return true;
		}
		else if( e.kMap( "Del" ) )
		{
			this.__command.splice( this.__curPos, 1 );
		}
		else if( e.kMap( "Enter" ) )
		{
			return true;
		}
		else if( e.kMap( "Up" ) ) // History navigations
		{
		}
		else if( e.kMap( "Down" ) )
		{
		}
		else if( e.kMap( "Left" ) )
		{
			if( 0 < this.__curPos ) this.__curPos --;
		}
		else if( e.kMap( "Right" ) )
		{
			if( this.__curPos < this.__command.length )
				this.__curPos ++;
		}
		else
		{
			InputKey = e.key;
		}

		if( InputKey != null )
		{
			this.__command.splice( this.__curPos ++, 0, InputKey );
		}

		var feeder = this.__cursor.feeder;
		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	}

	ns[ NS_EXPORT ]( EX_CLASS, "Search", Search );
})();
