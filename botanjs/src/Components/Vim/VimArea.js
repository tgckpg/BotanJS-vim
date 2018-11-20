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
	/** @type {Components.Vim.State.Marks} */
	var Marks                                     = __import( "Components.Vim.State.Marks" );
	/** @type {Components.Vim.Syntax.Analyzer} */
	var SyntaxAnalyzer                            = __import( "Components.Vim.Syntax.Analyzer" );

	/** @type {Components.Vim.LineFeeder} */
	var LineFeeder = ns[ NS_INVOKE ]( "LineFeeder" );
	/** @type {Components.Vim.StatusBar} */
	var StatusBar = ns[ NS_INVOKE ]( "StatusBar" );

	var VimControls = ns[ NS_INVOKE ]( "Controls" );
	var ActionEvent = ns[ NS_INVOKE ]( "ActionEvent" );
	var Mesg = ns[ NS_INVOKE ]( "Message" );

	var Insts = [];
	var InstIndex = 0;

	var KeyHandler = function( sender, handler )
	{
		return function( e )
		{
			sender.__active = true;
			e = e || window.event;
			if ( e.keyCode ) code = e.keyCode;
			else if ( e.which ) code = e.which;

			handler( sender, new ActionEvent( sender, e ) );
		};
	};

	/* stage @param {Dandelion.IDOMElement} */
	var VimArea = function( stage, detectScreenSize )
	{
		if( !stage ) throw new Error( "Invalid argument" );

		EventDispatcher.call( this );

		stage = IDOMElement( stage );

		var element = stage.element;

		if(!( element && element.nodeName == "TEXTAREA" ))
		{
			throw new Error( "This element is not compatible for VimArea" );
		}

		for( var i = 0; i < InstIndex; i ++ )
		{
			var inst = Insts[ i ];
			if( inst && inst.stage.element == element )
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
			this.__testScreen(function() { _self.__visualize( val ); });
		}
		else
		{
			this.__visualize( element.value );
		}

		// Set buffer index
		this.__instIndex = InstIndex ++;

		// Push this instance
		Insts[ this.__instIndex ] = this;
	};

	__extends( VimArea, EventDispatcher );

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
				-- i;
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
			++ l;

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

	// Visualize the Vim Frame
	VimArea.prototype.__visualize = function( content )
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
		statusBar.stamp( -3, function(){ return Mesg( cfeeder.docPos ); } );
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
		element.value = "Please wait ...";
		Cycle.delay( Update, 70 );

		this.__visualUpdate = Update;

		this.contentFeeder = cfeeder;
		this.contentAnalyzer = contentAnalyzer;
		this.statusFeeder = sfeeder;
		this.statusBar = statusBar;
		this.registers = new Registers();
		this.marks = new Marks();

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
		this.dispatchEvent( new BotanEvent( "Visualized" ) );
	};

	VimArea.prototype.display = function( data, handler )
	{
		var _self = this;
		var stage = this.stage;
		var cursor = this.__cursor;

		var evts = this.__stagedEvents;
		for( var i in evts ) stage.removeEventListener( evts[ i ] );
		cursor.suppressEvent();
		this.__active = false;

		stage.removeAttribute( "data-vimarea" );
		setTimeout( function() {
			stage.element.value = data;
			if( handler ) handler();
		}, 100 );

		var ContinueEdit = new EventKey( "KeyDown", function( e ) {
			var evt = new ActionEvent( _self, e );
			if( evt.Escape )
			{
				stage.removeEventListener( ContinueEdit );
				stage.setAttribute( new DataKey( "vimarea", 1 ) );
				stage.addEventListeners( _self.__stagedEvents );
				cursor.unsuppressEvent();
				cursor.feeder.dispatcher.dispatchEvent( new BotanEvent( "VisualUpdate" ) );
				_self.__active = true;
				stage.element.focus();
			}
		} );

		stage.addEventListener( ContinueEdit );
	};

	VimArea.prototype.demo = function( seq )
	{
		if( this.__demoActive ) return;

		var _self = this;

		this.__demoActive = true;
		var l = seq.length;

		var s = 0;

		var controls = new VimControls( this );
		var cursor = this.__cursor;
		var statusBar = this.statusBar;

		var demoEnd = function()
		{
			statusBar.stamp( 1, false );
			controls.handler( _self, new ActionEvent( _self, "Escape" ) );
			setTimeout( function() {
				cursor.openRunAction( "VA_REC", false, false, true );
				_self.__demoActive = false;
				_self.stage.addEventListeners( _self.__stagedEvents );
			}, 100 );
		};

		var demoChain = function()
		{
			_self.stage.element.focus();

			var key = seq[ s + 1 ];
			controls.handler( _self, new ActionEvent( _self, key ) );
			s += 2;

			if( s < l )
			{
				// Wait time cannot be 0
				setTimeout( demoChain, seq[ s ] || 20 );
			}
			else
			{
				setTimeout( demoEnd, 100 );
			}
		};

		statusBar.stamp( 1, function(){ return Mesg( "VA_REC_REPLAY" ); } );

		var evts = this.__stagedEvents;
		for( var i in evts ) this.stage.removeEventListener( evts[ i ] );
		this.__active = true;

		setTimeout( demoChain, seq[ s ] );
	};

	VimArea.prototype.dispose = function()
	{
		var stage = this.stage;
		var evts = this.__stagedEvents;
		var feeder = this.contentFeeder;

		var id = stage.element.id;

		debug.Info( "Destroy instance: " + id );

		feeder.dispatcher.removeEventListener( "VisualUpdate", this.__visualUpdate );
		this.dispatchEvent( new BotanEvent( "Dispose" ) );

		stage.removeAttribute( "data-vimarea" );

		Cycle.permaRemove( "VimCursorBlinkCycle" + id );
		for( var i in evts )
		{
			stage.removeEventListener( evts[ i ] );
		}

		stage.element.value = this.content;

		delete Insts[ this.__instIndex ];
		stage.element.dispatchEvent( new Event( "change" ) );
	};

	__readOnly( VimArea.prototype, "index", function()
	{
		return this.__instIndex + 1;
	} );

	__readOnly( VimArea, "Instances", function() {
		var clone = [];

		for( var i = 0; i < InstIndex; i ++ )
		{
			if( Insts[ i ] ) clone.push( Insts[ i ] );
		}

		return clone;
	} );

	ns[ NS_EXPORT ]( EX_CLASS, "VimArea", VimArea );
})();
