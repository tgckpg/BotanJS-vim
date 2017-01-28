(function(){
	var ns = __namespace( "Components.Vim.Actions" );

	/** @type {System.Debug} */
	var debug                                     = __import( "System.Debug" );
	/** @type {System.utils.EventKey} */
	var EventKey                                  = __import( "System.utils.EventKey" );
	/** @type {Components.Vim.ActionEvent} */
	var ActionEvent                               = __import( "Components.Vim.ActionEvent" );

	var Mesg = __import( "Components.Vim.Message" );

	// Recording Sessions
	var Sessions = [];

	/** @type {Components.Vim.IAction} */
	var VA_REC = function( Cursor )
	{
		/** @type {Components.Vim.Cursor} */
		this.__cursor = Cursor;
		this.__msg = Mesg( "VA_REC_START" );
		Cursor.suppressEvent();
	};

	VA_REC.prototype.dispose = function()
	{
		this.__cursor.unsuppressEvent();
	};

	VA_REC.prototype.handler = function( e, args, range )
	{
		if( args == true )
		{
			var msg = Mesg( "VA_REC_END" );
			var lastLine = Mesg( "WAIT_FOR_INPUT" );

			var l = this.__cursor.feeder.firstBuffer.cols;
			for( var i = msg.length; i < l; i ++ ) msg += " ";

			this.__msg = msg + "\n" + lastLine;
			return;
		}

		e.preventDefault();
		var inst = this.__cursor.Vim;
		var sender = inst.stage;
		var sIndex = inst.index;

		var session;

		if( Sessions[ sIndex ] )
		{
			session = Sessions[ sIndex ];
		}
		else
		{
			session = Sessions[ sIndex ] = {};
		}

		if( session.started )
		{
			session.__dispose();
			var head = "Press Escape to conitnue edit\n===\n";
			var data = JSON.stringify( session.data );

			var element = sender.element;
			setTimeout( function() {
				inst.display(
					head + data, function(){
					element.selectionStart = head.length;
					element.selectionEnd = element.selectionStart + data.length;
				} );
			}, 1 );
			return;
		}
		else
		{
			session.started = true;
		}

		var sessData = session.data = [];
		var lastTime = Date.now();

		session.__event = new EventKey(
			"KeyDown", function( e2 )
			{
				var evt = new ActionEvent( sender, e2 );
				if( [ "Control", "Alt", "Shift" ].indexOf( e2.key ) != -1 ) return;

				var now = Date.now();
				sessData.push( now - lastTime, evt.keyCode );
				lastTime = now;
			}
		);

		var feeder = this.__cursor.feeder;

		// Handles quit event on VimArea
		session.__dispose = function() {
			debug.Info( "VA_REC: Disposing active session" );
			delete Sessions[ sIndex ];
			sender.removeEventListener( session.__event );
			inst.removeEventListener( "Dispose", session.__dispose );
		};

		inst.addEventListener( "Dispose", session.__dispose );
		sender.addEventListener( session.__event );
	};

	VA_REC.prototype.getMessage = function()
	{
		return this.__msg;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "VA_REC", VA_REC );
})();
