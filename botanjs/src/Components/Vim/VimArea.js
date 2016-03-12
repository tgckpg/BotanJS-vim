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

	/** @type {Components.VimArea.LineFeeder} */
	var LineFeeder = ns[ NS_INVOKE ]( "LineFeeder" );
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
		e.preventDefault();
		if( e.ctrlKey )
		{
			VimComboFunc( sender, e );
			return;
		}

		var kCode = e.KeyCode + ( e.shiftKey ? 1000 : 0 );
		switch( e.KeyCode )
		{
			case 65: // a
			case 1065: // A
				break;
			case 72: // h
			case 1072: // H
				break;
			case 74: // j
			case 1074: // J
				break;
			case 75: // k
			case 1075: // K
				break;
			case 76: // l
			case 1076: // L
				break;
			case 1053: // %
			case 1054: // ^
				break;
		}
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

	VimArea.prototype.cursor = function( x, y )
	{
		return this.__cursor();
	};

	VimArea.prototype.flashCursor = function()
	{
		var _self = this;
		var textarea = this.stage.element;
		Cycle.perma( "VimCursorFlashCycle", function()
		{
			var cursor = _self.cursor();
			if( cursor )
			{
				textarea.selectionStart = cursor.start;
				textarea.selectionEnd = cursor.end;
			}
		}, 600 );
	};

	VimArea.prototype.VisualizeVimFrame = function()
	{
		var element = this.stage.element;
		var r = this.rows;
		var c = this.cols;

		// Content feeder
		var cfeeder = new LineFeeder( r, c );

		cfeeder.init( this.content );

		// Status feeder
		sfeeder = new LineFeeder( r, c );
		sfeeder.setRender( false );

		var statusBar = new StatusBar( c );
		statusBar.stamp( -18, function(){
			return "1,1-1";
		});

		statusBar.stamp( -3, function(){
			return "All";
		});

		sfeeder.init( statusBar.statusText );

		element.value = cfeeder.render( 0, r - sfeeder.linesOccupied ) + "\n" + sfeeder.render();

		this.contentFeeder = cfeeder;
		this.statusFeeder = sfeeder;

		var f = true;
		this.__cursor = function()
		{
			if( f = !f )
				return this.contentFeeder.cursor( 0 );
			else return { start: 0, end: 0 };
		}

		this.flashCursor();
	};

	ns[ NS_EXPORT ]( EX_CLASS, "VimArea", VimArea );
})();
