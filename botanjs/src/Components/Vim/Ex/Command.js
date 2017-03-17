(function(){
	var ns = __namespace( "Components.Vim.Ex" );

	/** @type {System.Cycle} */
	var Cycle                        = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                        = __import( "System.Debug" );
	/** @type {System.utils.Perf} */
	var Perf                         = __import( "System.utils.Perf" );

	/** @type {Components.Vim.State.History} */
	var History                                 = __import( "Components.Vim.State.History" );
	var Mesg                                    = __import( "Components.Vim.Message" );
	var beep                                    = __import( "Components.Vim.Beep" );

	// This is for security & privacy concerns?
	var ZMap = {
		"/": Perf.uuid
		, ":" : Perf.uuid
	};

	/** @type {Components.Vim.IAction} */
	var Command = function( Cursor, Mode )
	{
		var _self = this;
		if( !ZMap[ Mode ] ) throw new Error( "Unsupport mode: " + Mode );

		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;

		this.__statusBar = Cursor.Vim.statusBar;

		this.__mode = Mode;
		this.__hist = new History( ZMap[ Mode ] );

		this.__command = [];
		this.__currentCommand = null;
		this.__blinkId = "ExCommandBlinkCycle" + Perf.uuid;
		this.__curPos = 0;

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

	Command.prototype.dispose = function()
	{
		this.__statusBar.override = null;

		Cycle.permaRemove( this.__blinkId );
		var feeder = this.__cursor.feeder;
		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	Command.prototype.handler = function( e )
	{
		e.preventDefault();

		if( e.ModKeys ) return;

		this.__blink();

		var InputKey = null;

		var histNav = false;

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
			if( this.__curPos == 1 && 1 < this.__command.length )
				return false;

			this.__command.splice( --this.__curPos, 1 );
			if( this.__command.length == 0 )
			{
				e.cancel();
				return true;
			}
		}
		else if( e.kMap( "Del" ) )
		{
			this.__command.splice( this.__curPos, 1 );
		}
		else if( e.kMap( "Enter" ) )
		{
			this.__process( e );
			return true;
		}
		else if( e.kMap( "Left" ) )
		{
			if( 1 < this.__curPos ) this.__curPos --;
		}
		else if( e.kMap( "Right" ) )
		{
			if( this.__curPos < this.__command.length )
				this.__curPos ++;
		}

		// History stepping
		else if( histNav = e.kMap( "Up" ) ) // History navigations
		{
			if( !this.__currentCommand )
			{
				this.__currentCommand = this.__command;
			}

			var n = this.__hist.prev( this.__currentCommand );

			if( n )
			{
				this.__command = n;
				this.__curPos = n.length;
			}
			else
			{
				beep();
			}
		}
		else if( histNav = e.kMap( "Down" ) )
		{
			var n = this.__hist.next( this.__currentCommand );

			if( n )
			{
				this.__command = n;
				this.__curPos = n.length;
			}
			else if( this.__currentCommand )
			{
				this.__command = this.__currentCommand;
				this.__currentCommand = null;
			}

			else beep();
		}
		else
		{
			InputKey = e.key;
		}

		if( InputKey != null )
		{
			this.__command.splice( this.__curPos ++, 0, InputKey );
		}

		if( !histNav )
		{
			this.__hist.reset();
			if( this.__currentCommand ) this.__currentCommand = this.__command;
		}

		e.cancel();

		var feeder = this.__cursor.feeder;
		feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
	};

	Command.prototype.__process = function( e )
	{
		this.__hist.push( this.__command );

		var action = "";
		switch( this.__mode )
		{
			case "/":
				action = "FIND";
				break;
			case ":":
				action = "EDITOR_COMMAND";
				break;
		}

		var cur = this.__cursor;

		cur.suppressEvent();
		this.__cursor.openRunAction( action, e, false, this.__command.slice() );
		cur.unsuppressEvent();
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Command", Command );
})();
