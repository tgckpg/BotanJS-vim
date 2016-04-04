(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                               = __import( "Dandelion.IDOMElement" );
	/** @type {System.utils.DataKey} */
	var DataKey                                   = __import( "System.utils.DataKey" );
	/** @type {System.utils.EventKey} */
	var EventKey                                  = __import( "System.utils.EventKey" );
	/** @type {System.Cycle} */
	var Cycle                                     = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                                     = __import( "System.Debug" );

	/** @type {Components.Vim.State.Registers} */
	var Registers                                 = __import( "Components.Vim.State.Registers" );
	/** @type {Components.Vim.Syntax.Analyzer} */
	var SyntaxAnalyzer                            = __import( "Components.Vim.Syntax.Analyzer" );

	/** @type {Components.Vim.LineFeeder} */
	var LineFeeder = ns[ NS_INVOKE ]( "LineFeeder" );
	/** @type {Components.Vim.StatusBar} */
	var StatusBar = ns[ NS_INVOKE ]( "StatusBar" );

	var VimControls = ns[ NS_INVOKE ]( "Controls" );
	var InputEvent = ns[ NS_INVOKE ]( "InputEvent" );
	var mesg = ns[ NS_INVOKE ]( "Message" );

	var Insts = [];
	var InstIndex = 0;

	var KeyHandler = function( sender, handler )
	{
		return function( e )
		{
			e = e || window.event;
			if ( e.keyCode ) code = e.keyCode;
			else if ( e.which ) code = e.which;

			handler( sender, new InputEvent( sender, e ) );
		};
	};

	/* stage @param {Dandelion.IDOMElement} */
	var VimArea = function( stage, detectScreenSize )
	{
		if( !stage ) throw new Error( "Invalid argument" );

		stage = IDOMElement( stage );

		var element = stage.element;

		if(!( element && element.nodeName == "TEXTAREA" ))
		{
			throw new Error( "This element is not compatible for VimArea" );
		}

		for( var i in Insts )
		{
			var inst = Insts[ i ];
			if( inst.stage.element == element )
			{
				debug.Info( "Instance exists" );
				return inst;
			}
		}

		stage.setAttribute( new DataKey( "vimarea", 1 ) );

		this.stage = stage;
		this.rows = element.rows;
		this.cols = element.cols;

		this.__active = false;

		var _self = this;

		this.__stagedEvents = [
			new EventKey( "Focus", function() { _self.__active = true; }  )
			, new EventKey( "Blur", function() { _self.__active = false; } )
		];


		if( detectScreenSize )
		{
			var val = element.value;
			this.__testScreen(function() { _self.VisualizeVimFrame( val ); });
		}
		else
		{
			this.VisualizeVimFrame( element.value );
		}

		// Set buffer index
		this.__instIndex = InstIndex ++;

		// Push this instance
		Insts[ this.__instIndex ] = this;
	};

	VimArea.prototype.__testScreen = function( handler )
	{
		var area = this.stage.element;
		area.value = "";

		var msg = "Please wait while Vim;Re is testing for screen dimensions";
		var m = function() { return msg[ i ++ ] || "."; };

		var i = 0;

		var oX = area.style.overflowX;
		var oY = area.style.overflowY;

		area.style.whiteSpace = "nowrap";

		var oWidth = area.scrollWidth;
		var testWidth = function()
		{
			area.value += m();
			if( oWidth == area.scrollWidth )
			{
				Cycle.next( testWidth );
			}
			else
			{
				var t = "";
				i -= 3;
				for( var k = 0; k < i; k ++ ) t += ".";
				area.value = t;

				area.style.whiteSpace = "";
				m = function() { return "\n" + t; };
				testHeight();
			}
		};

		testWidth();

		var oHeight = area.scrollHeight;

		var l = 0;

		var _self = this;

		var testHeight = function() {
			area.value += m();
			l ++;

			if( oHeight == area.scrollHeight )
			{
				Cycle.next( testHeight );
			}
			else
			{
				_self.rows = l;
				_self.cols = i;

				handler();
			}
		};
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
		this.content = content;

		var element = this.stage.element;
		var r = this.rows;
		var c = this.cols;

		// StatusFeeder always consumes at least 1 line
		var cRange = r - 1;

		// Content feeder
		var cfeeder = new LineFeeder( cRange, c );
		var contentAnalyzer = new SyntaxAnalyzer( cfeeder );

		// Feed the contents to content feeder
		// This "\n" fixes the last line "\n" not displaying
		// it will be trimmed after saving
		cfeeder.init( content + "\n" );

		// Status can consumes up to full screen, I think
		var sfeeder = new LineFeeder( r, c );
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

			var sLine = sfeeder.linesOccupied;
			element.value =
				cfeeder.render( sLine - 1, r - sLine )
				+ "\n" + sfeeder.render( 0, sLine < r ? sLine : r );

			_self.__blink = false;
			_self.select( cfeeder.cursor.position );
		};

		cfeeder.dispatcher.addEventListener( "SelectionChanged", function()
		{
			_self.select( cfeeder.cursor.position );
		} );

		cfeeder.dispatcher.addEventListener( "VisualUpdate", Update );
		Update();

		this.__visualUpdate = Update;

		this.contentFeeder = cfeeder;
		this.contentAnalyzer = contentAnalyzer;
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

		this.__stagedEvents.push(
			new EventKey( "KeyDown", KeyHandler( this, controls.handler.bind( controls ) ) )
		);

		this.stage.addEventListeners( this.__stagedEvents );
	};

	VimArea.prototype.dispose = function()
	{
		var stage = this.stage;
		var evts = this.__stagedEvents;
		var feeder = this.contentFeeder;

		var id = stage.element.id;

		debug.Info( "Destroy instance: " + id );

		feeder.dispatcher.removeEventListener( "VisualUpdate", this.__visualUpdate );

		stage.removeAttribute( "data-vimarea" );

		Cycle.permaRemove( "VimCursorBlinkCycle" + id );
		for( var i in evts )
		{
			stage.removeEventListener( evts[ i ] );
		}

		stage.element.value = this.content;

		delete Insts[ this.__instIndex ];
	};

	__readOnly( VimArea.prototype, "index", function()
	{
		return this.__instIndex + 1;
	} );

	__readOnly( VimArea, "Instances", function() {
		var clone = [];
		for( var i in Insts ) clone.push( Insts[ i ] );
		return clone;
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "VimArea", VimArea );
})();
