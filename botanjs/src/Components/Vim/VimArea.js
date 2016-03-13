(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {Dandelion} */
	var Dand                                    = __import( "Dandelion" );
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                             = __import( "Dandelion.IDOMElement" );
	/** @type {Dandelion.IDOMObject} */
	var IDOMObject                              = __import( "Dandelion.IDOMObject" );
	/** @type {System.utils.DataKey} */
	var DataKey                                 = __import( "System.utils.DataKey" );
	/** @type {System.Cycle} */
	var Cycle                                   = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                                   = __import( "System.Debug" );

	/** @type {Components.Vim.LineFeeder} */
	var LineFeeder = ns[ NS_INVOKE ]( "LineFeeder" );
	/** @type {Components.Vim.StatusBar} */
	var StatusBar = ns[ NS_INVOKE ]( "StatusBar" );

	var KeyHandler = function( sender, handler )
	{
		return function( e )
		{
			e = e || window.event;
			if ( e.keyCode ) code = e.keyCode;
			else if ( e.which ) code = e.which;

			handler( sender, e );
		};
	};

	var VimControls = function( sender, e )
	{
		if( e.altKey
			// F2 - F12
			|| ( 112 < e.keyCode && e.keyCode < 124 )
		) return;

		e.preventDefault();
		if( e.ctrlKey )
		{
			VimComboFunc( sender, e );
			return;
		}

		var kCode = e.keyCode + ( e.shiftKey ? 1000 : 0 );

		var cfeeder = sender.contentFeeder;
		switch( kCode )
		{
			// Cursor movements
			case 72: // h
				cfeeder.cursor.moveX( -1 );
				break;
			case 74: // j
				cfeeder.cursor.moveY( 1 );
				break;
			case 75: // k
				cfeeder.cursor.moveY( -1 );
				break;
			case 76: // l
				cfeeder.cursor.moveX( 1 );
				break;

			case 65: // a
			case 1065: // A
				break;
			case 1072: // H, First line buffer
				break;
			case 1076: // L, Last line buffer
				break;
			case 1052: // $
				cfeeder.cursor.lineEnd();
				break;
			case 1053: // %
				break;
			case 1054: // ^
				cfeeder.cursor.lineStart();
				break;
			case 1074: // J, Join lines
				break;
			case 1075: // K, manual entry
				break;
			case 112: // F1, help
		}

		sender.__blink = false;
		sender.select( cfeeder.cursor.position );
	};

	/* stage @param {Dandelion.IDOMElement} */
	var VimArea = function( stage )
	{
		if( !stage ) return;

		var element = stage.element;

		if( element.nodeName != "TEXTAREA" )
		{
			debug.Error( "Element is not compatible for VimArea" );
			return;
		}

		stage.setAttribute( new DataKey( "vimarea", 1 ) );

		this.stage = stage;
		this.rows = element.rows;
		this.cols = element.cols;

		this.PosX = 1;
		this.PosY = 1;

		stage.addEventListener( "KeyDown", KeyHandler( this, VimControls ) );

		// Init
		this.content = element.value;
		this.VisualizeVimFrame();
	};

	VimArea.prototype.startInput = function( mode )
	{
	};

	VimArea.prototype.select = function( sel )
	{
		var textarea = this.stage.element;

		if( sel )
		{
			textarea.selectionStart = sel.start;
			textarea.selectionEnd = sel.end;
		}
	};

	VimArea.prototype.VisualizeVimFrame = function()
	{
		var _self = this;

		var element = this.stage.element;
		var r = this.rows;
		var c = this.cols;

		// Content feeder
		var cfeeder = new LineFeeder( r, c );

		cfeeder.init( this.content );

		// Status feeder
		sfeeder = new LineFeeder( r, c );
		sfeeder.setRender( false );

		// XXX: Placeholder
		var statusBar = new StatusBar( c );
		statusBar.stamp( -18, function(){
			return "1,1-1";
		});

		statusBar.stamp( -3, function(){
			return "All";
		});

		sfeeder.init( statusBar.statusText );

		element.value =
			cfeeder.render( 0, r - sfeeder.linesOccupied )
			+ "\n" + sfeeder.render();

		this.contentFeeder = cfeeder;
		this.statusFeeder = sfeeder;

		this.__cursor = cfeeder.cursor;

		this.__blink = true;
		Cycle.perma( "VimCursorBlinkCycle" + element.id, function()
		{
			_self.select(
				( _self.__blink = !_self.__blink )
					? _self.__cursor.position
					: { start: 0, end: 0 }
			);
		}, 600 );
	};

	ns[ NS_EXPORT ]( EX_CLASS, "VimArea", VimArea );
})();
