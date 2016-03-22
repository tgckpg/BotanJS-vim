(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                             = __import( "Dandelion.IDOMElement" );
	/** @type {System.utils.DataKey} */
	var DataKey                                 = __import( "System.utils.DataKey" );
	/** @type {System.Cycle} */
	var Cycle                                   = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                                   = __import( "System.Debug" );

	/** @type {Components.Vim.State.Registers} */
	var Registers                               = __import( "Components.Vim.State.Registers" );

	/** @type {Components.Vim.LineFeeder} */
	var LineFeeder = ns[ NS_INVOKE ]( "LineFeeder" );
	/** @type {Components.Vim.StatusBar} */
	var StatusBar = ns[ NS_INVOKE ]( "StatusBar" );

	var VimControls = ns[ NS_INVOKE ]( "Controls" );
	var mesg = ns[ NS_INVOKE ]( "Message" );

	var Insts = [];

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

		this.__active = false;

		var _self = this;

		stage.addEventListener( "Focus", function() { _self.__active = true; } );
		stage.addEventListener( "Blur", function() { _self.__active = false; } );

		// Init
		this.VisualizeVimFrame( element.value );

		// Push this instance
		Insts.push( this );
	};

	VimArea.prototype.select = function( sel )
	{
		if( !this.__active ) return;
		var textarea = this.stage.element;

		if( sel )
		{
			textarea.selectionStart = sel.start;
			textarea.selectionEnd = sel.end;
		}
	};

	VimArea.prototype.VisualizeVimFrame = function( content )
	{
		var _self = this;

		var element = this.stage.element;
		var r = this.rows;
		var c = this.cols;

		// StatusFeeder always consumes at least 1 line
		var cRange = r - 1;

		// Content feeder
		var cfeeder = new LineFeeder( cRange, c );

		// Feed the contents to content feeder
		// This "\n" fixes the last line "\n" not displaying
		// it will be trimmed after saving
		cfeeder.init( content + "\n" );

		// Status can consumes up to full screen, I think
		sfeeder = new LineFeeder( r, c );
		sfeeder.setRender( false );

		// Set the Vim instance
		cfeeder.cursor.Vim = this;
		sfeeder.cursor.Vim = this;

		// Set the stamps
		var statusBar = new StatusBar( c );
		statusBar.stamp( -18, function(){ return cfeeder.lineStat; } );
		statusBar.stamp( -3, function(){ return mesg( cfeeder.docPos ); } );
		statusBar.stamp( 0, function(){ return cfeeder.cursor.message; } );

		sfeeder.init( statusBar.statusText );

		var Update = function()
		{
			sfeeder.init( statusBar.statusText );

			element.value =
				cfeeder.render( 0, r - sfeeder.linesOccupied )
				+ "\n" + sfeeder.render();

			_self.__blink = false;
			_self.select( cfeeder.cursor.position );
		};

		cfeeder.dispatcher.addEventListener( "VisualUpdate", Update );
		Update();

		this.contentFeeder = cfeeder;
		this.statusFeeder = sfeeder;
		this.statusBar = statusBar;
		this.registers = new Registers();

		this.__cursor = cfeeder.cursor;

		this.__blink = true;
		Cycle.perma( "VimCursorBlinkCycle" + element.id, function()
		{
			_self.select(
				!_self.__cursor.blink || ( _self.__blink = !_self.__blink )
					? _self.__cursor.position
					: { start: 0, end: 0 }
			);
		}, 600 );

		var controls = new VimControls( this );
		this.stage.addEventListener(
			"KeyDown"
			, KeyHandler( this, controls.handler.bind( controls ) )
		);
	};

	__readOnly( VimArea, "Instances", function() {
		return Insts.slice();
	} );

	__readOnly( VimArea.prototype, "content", function() {
		return this.contentFeeder.content.slice( 0, -1 );
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "VimArea", VimArea );
})();
