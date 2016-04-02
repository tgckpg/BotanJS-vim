(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	/** @type {Components.Vim.Ex.Command} */
	var ExCommand = __import( "Components.Vim.Ex.Command" );

	var beep = ns[ NS_INVOKE ]( "Beep" );

	var SHIFT = 1 << 9;
	var CTRL = 1 << 10;
	var ALT = 1 << 11;

	var KEY_SHIFT = 16;
	var KEY_CTRL = 17;
	var KEY_ALT = 18;

	var BACKSPACE = 8;
	var TAB = 9;
	var ENTER = 13;
	var DELETE = 46;

	var UP = 38; var DOWN = 40; var LEFT = 37; var RIGHT = 39;

	var _0 = 48; var _1 = 49; var _2 = 50; var _3 = 51; var _4 = 52;
	var _5 = 53; var _6 = 54; var _7 = 55; var _8 = 56; var _9 = 57;

	var SEMI_COLON = 59;

	var A = 65; var B = 66; var C = 67; var D = 68; var E = 69;
	var F = 70; var G = 71; var H = 72; var I = 73; var J = 74;
	var K = 75; var L = 76; var M = 77; var N = 78; var O = 79;
	var P = 80; var Q = 81; var R = 82; var S = 83; var T = 84;
	var U = 85; var V = 86; var W = 87; var X = 88; var Y = 89;
	var Z = 90;

	var S_BRACKET_L = 219; var S_BRACKET_R = 221;

	var ESC = 27;

	var F1 = 112; var F2 = 113; var F3 = 114; var F4 = 115; var F5 = 116;
	var F6 = 117; var F7 = 118; var F8 = 119; var F9 = 120; var F10 = 121;
	var F11 = 122; var F12 = 123;

	var COMMA = 188; var FULLSTOP = 190;
	var SLASH = 191; var BACK_SLASH = 220;

	var __maps = {};
	var Map = function( str )
	{
		if( __maps[ str ] ) return __maps[ str ];

		// C-Left, A-Up ...
		var Code = str.split( "-" );
		var sCode = Code[0];

		var Mod = 0;
		if( Code.length == 2 )
		{
			var m = true;
			switch( Code[0] )
			{
				case "C": Mod = CTRL; break;
				case "A": Mod = ALT; break;
				case "S": Mod = SHIFT; break;
				default:
					m = false;
			}

			if( m )
			{
				sCode = Code[1];
			}
		}

		var kCode;
		switch( sCode )
		{
			case "BS": kCode = Mod + BACKSPACE; break;
			case "Del": kCode = Mod + DELETE; break;
			case "Enter": kCode = Mod + ENTER; break;
			case "Tab": kCode = Mod + TAB; break;

			case "Up": kCode = Mod + UP; break;
			case "Down": kCode = Mod + DOWN; break;
			case "Left": kCode = Mod + LEFT; break;
			case "Right": kCode = Mod + RIGHT; break;

			case "A": Mod = SHIFT; case "a": kCode = Mod + A; break;
			case "B": Mod = SHIFT; case "b": kCode = Mod + B; break;
			case "C": Mod = SHIFT; case "c": kCode = Mod + C; break;
			case "D": Mod = SHIFT; case "d": kCode = Mod + D; break;
			case "E": Mod = SHIFT; case "e": kCode = Mod + E; break;
			case "F": Mod = SHIFT; case "f": kCode = Mod + F; break;
			case "G": Mod = SHIFT; case "g": kCode = Mod + G; break;
			case "H": Mod = SHIFT; case "h": kCode = Mod + H; break;
			case "I": Mod = SHIFT; case "i": kCode = Mod + I; break;
			case "J": Mod = SHIFT; case "j": kCode = Mod + J; break;
			case "K": Mod = SHIFT; case "k": kCode = Mod + K; break;
			case "L": Mod = SHIFT; case "l": kCode = Mod + L; break;
			case "M": Mod = SHIFT; case "m": kCode = Mod + M; break;
			case "N": Mod = SHIFT; case "n": kCode = Mod + N; break;
			case "O": Mod = SHIFT; case "o": kCode = Mod + O; break;
			case "P": Mod = SHIFT; case "p": kCode = Mod + P; break;
			case "Q": Mod = SHIFT; case "q": kCode = Mod + Q; break;
			case "R": Mod = SHIFT; case "r": kCode = Mod + R; break;
			case "S": Mod = SHIFT; case "s": kCode = Mod + S; break;
			case "T": Mod = SHIFT; case "t": kCode = Mod + T; break;
			case "U": Mod = SHIFT; case "u": kCode = Mod + U; break;
			case "V": Mod = SHIFT; case "v": kCode = Mod + V; break;
			case "W": Mod = SHIFT; case "w": kCode = Mod + W; break;
			case "X": Mod = SHIFT; case "x": kCode = Mod + X; break;
			case "Y": Mod = SHIFT; case "y": kCode = Mod + Y; break;
			case "Z": Mod = SHIFT; case "z": kCode = Mod + Z; break;

			case "!": Mod = SHIFT; case "1": kCode = Mod + _1; break;
			case "@": Mod = SHIFT; case "2": kCode = Mod + _2; break;
			case "#": Mod = SHIFT; case "3": kCode = Mod + _3; break;
			case "$": Mod = SHIFT; case "4": kCode = Mod + _4; break;
			case "%": Mod = SHIFT; case "5": kCode = Mod + _5; break;
			case "^": Mod = SHIFT; case "6": kCode = Mod + _6; break;
			case "&": Mod = SHIFT; case "7": kCode = Mod + _7; break;
			case "*": Mod = SHIFT; case "8": kCode = Mod + _8; break;
			case "(": Mod = SHIFT; case "9": kCode = Mod + _9; break;
			case ")": Mod = SHIFT; case "0": kCode = Mod + _0; break;
			case "<": Mod = SHIFT; case ",": kCode = Mod + COMMA; break;
			case ">": Mod = SHIFT; case ".": kCode = Mod + FULLSTOP; break;

			default:
				throw new Error( "Unsupport keys: " + str );
		}

		return __maps[ str ] = kCode;
	};

	var Controls = function( vimArea )
	{
		/** @type {Components.Vim.VimArea} */
		this.__vimArea = vimArea

		this.__cfeeder = vimArea.contentFeeder;
		this.__sfeeder = vimArea.statusFeeder;

		this.__ccur = this.__cfeeder.cursor;

		// Dived composite command handler
		// Has full control of the key input, except Esc
		this.__divedCCmd = null;
	};

	Controls.prototype.__composite = function( e, handler )
	{
		if( handler )
		{
			if( !this.__compositeReg ) this.__compositeReg = [];
			this.__compositeReg.push({
				keys: Array.prototype.slice.call( arguments, 2 )
				, handler: handler
				, i: 0
			});
			return true;
		}

		var kCode = e.keyCode;

		for( var i = 0; i < this.__compositeReg.length; i ++ )
		{
			var compReg = this.__compositeReg[i];
			var keys = compReg.keys;

			if( keys[ compReg.i ++ ] == kCode )
			{
				if( compReg.i == keys.length )
				{
					compReg.handler( e );
					this.__compositeReg = null;
					this.__cMovement = false;
				}

				return true;
			}
		}

		if( this.__compositeReg ) beep();
		this.__compositeReg = null;
		this.__cMovement = false;
		return false;
	};

	Controls.prototype.__actionCommand = function( e )
	{
		var ActionHandled = true;
		var ccur = this.__ccur;

		// Action Command
		switch( e.keyCode )
		{
			case SHIFT + A: // Append at the line end
				ccur.lineEnd();
			case A: // Append
				ccur.moveX( 1, true, true );
			case I: // Insert
				ccur.openAction( "INSERT" );
				break;

			case S: // Delete Char and start insert
				if( ccur.getLine().content != "" )
				{
					ccur.openRunAction( "DELETE", e, ccur.aPos );
				}
				ccur.openAction( "INSERT" );
				break;

			case SHIFT + O: // new line before insert
				ccur.lineStart();
				ccur.openAction( "INSERT" );
				ccur.action.handler( new InputEvent( e.sender, "Enter" ) );
				ccur.moveY( -1 );
				break;
			case O: // new line insert
				ccur.lineEnd( true );
				ccur.openAction( "INSERT" );
				ccur.action.handler( new InputEvent( e.sender, "Enter" ) );
				break;

			case U: // Undo
				ccur.openRunAction( "UNDO", e );
				break;
			case CTRL + R: // Redo
				ccur.openRunAction( "REDO", e );
				break;

			case D: // Del with motion
				ccur.openAction( "DELETE" );
				break;
			case Y: // Yank with motion
				ccur.openAction( "YANK" );
				break;

			case P: // Put
				ccur.suppressEvent();
				ccur.moveX( 1, false, true );
				ccur.unsuppressEvent();
			case SHIFT + P: // Put before
				ccur.openRunAction( "PUT", e );
				break;

			case SHIFT + X: // Delete before
				if( !this.__cMoveX( -1 ) ) break;
			case X: // Del
				if( ccur.getLine().content == "" )
				{
					beep();
					break;
				}
				ccur.openRunAction( "DELETE", e, ccur.aPos );
				break;
			case SHIFT + U: // Undo previous changes in oneline
				break;
			case SHIFT + I: // Append before the line start, after spaces
				break;
			case SHIFT + J: // Join lines
				break;
			case SHIFT + K: // Find the manual entry
				break;

			case V: // Visual
				ccur.openAction( "VISUAL" );
				break;
			case SHIFT + V: // Visual line
				ccur.openAction( "VISUAL_LINE" );
				break;

			case SHIFT + SEMI_COLON: // ":" Command line
				this.__divedCCmd = new ExCommand( ccur, ":" );
				this.__divedCCmd.handler( e );
				break;

			case F1: // F1, help
				break;
			default:
				ActionHandled = false;
		}

		return ActionHandled;
	};

	Controls.prototype.__cMoveX = function( a, b, c )
	{
		var ccur = this.__ccur;

		var x = ccur.X;
		ccur.moveX( a, b, c || ccur.pSpace );
		if( ccur.X == x )
		{
			beep();
			return false;
		}
		return true;
	};

	Controls.prototype.__cMoveY = function( a )
	{
		var ccur = this.__ccur;
		var cfeeder = this.__cfeeder;

		var y = ccur.Y + cfeeder.panY;
		ccur.moveY( a );
		if( y == ( ccur.Y + cfeeder.panY ) )
		{
			if( 0 < a && !cfeeder.EOF ) return true;
			beep();
		}

		return false;
	};

	Controls.prototype.__cursorCommand = function( e )
	{
		var kCode = e.keyCode;

		if( this.__cMovement )
		{
			if( !e.ModKeys )
			{
				this.__composite( e );
				return true;
			}
		}

		var ccur = this.__ccur;
		var vima = this.__vimArea;
		var cfeeder = ccur.feeder;

		var cursorHandled = true;
		switch( kCode )
		{
			case BACKSPACE: this.__cMoveX( -1, true ); break; // Backspace, go back 1 char
			case H: this.__cMoveX( -1 ); break; // Left
			case L: this.__cMoveX( 1 ); break; // Right
			case K: this.__cMoveY( -1 ); break; // Up
			case J: this.__cMoveY( 1 ); break; // Down

			case CTRL + F: // Page Down
				if( cfeeder.firstBuffer.nextLine.placeholder )
				{
					beep();
					break;
				}

				var oPan = cfeeder.panY;
				cfeeder.pan( undefined, cfeeder.moreAt );
				cfeeder.softReset();

				ccur.moveY( -ccur.Y );

				break;
			case CTRL + B: // Page Up
				if( cfeeder.panY == 0 )
				{
					beep();
					break;
				}
				cfeeder.pan( undefined, -cfeeder.moreAt );
				cfeeder.softReset();

				ccur.moveY( -ccur.Y );
				if( !cfeeder.EOF ) ccur.moveY( cfeeder.moreAt );
				break;

			case SHIFT + H: // First line buffer
				break;
			case SHIFT + L: // Last line buffer
				break;
			case SHIFT + _6: // ^, Start
				ccur.lineStart();
				break;
			case SHIFT + _4: // $, End
				ccur.lineEnd( ccur.pSpace );
				break;
			case SHIFT + G: // Goto last line
				ccur.moveY( Number.MAX_VALUE );
				ccur.moveX( Number.MAX_VALUE, true );
				break

			case SHIFT + _5: // %, Find next item
				var analyzer = this.__vimArea.contentAnalyzer;

				/** @type {Components.Vim.Syntax.TokenMatch} */
				var bracketMatch = analyzer.bracketAt( ccur.aPos );

				if( bracketMatch.open == -1 )
				{
					beep();
					break;
				}

				ccur.moveTo(
					bracketMatch.selected == bracketMatch.close
						? bracketMatch.open
						: bracketMatch.close
				);

				break;
			case T: // To
				break;
			case I: // In between boundary
				if( !ccur.action )
				{
					cursorHandled = false;
					break;
				}

				var analyzer = this.__vimArea.contentAnalyzer;

				this.__cMovement = true;

				// Word boundary
				this.__composite( e, function( e2 ) {
					var WordMatch = analyzer.wordAt( ccur.aPos );
					e2.__range = WordMatch;
				}, W );

				var bracket = function( e2 ) {
					var BracketMatch = analyzer.bracketIn( "(", ccur.aPos );
					e2.__range = BracketMatch;
				};
				var curlyBracket = function( e2 ) {
					var BracketMatch = analyzer.bracketIn( "{", ccur.aPos );
					e2.__range = BracketMatch;
				};
				var squareBracket = function( e2 ) {
					var BracketMatch = analyzer.bracketIn( "[", ccur.aPos );
					e2.__range = BracketMatch;
				};

				// Bracket boundaries
				this.__composite( e, bracket , SHIFT + _0 );
				this.__composite( e, bracket, SHIFT + _9 );
				this.__composite( e, squareBracket, S_BRACKET_L );
				this.__composite( e, squareBracket, S_BRACKET_R );
				this.__composite( e, curlyBracket, SHIFT + S_BRACKET_L );
				this.__composite( e, curlyBracket, SHIFT + S_BRACKET_R );
				break;

			case G: // Go to top
				this.__cMovement = true;
				this.__composite( e, function(){
					ccur.moveY( -Number.MAX_VALUE );
					ccur.moveX( -Number.MAX_VALUE, true );
				}, G );
				this.__composite( e, function(){
					ccur.openRunAction( "PRINT_HEX", e );
				}, _8 );
				break;

			case SHIFT + N: // Next Search
			case N: // Next Search
				ccur.openRunAction( "FIND", e );
				break;

			case SLASH: // "/" Search movement
				this.__cMovement = true;

				this.__divedCCmd = new ExCommand( ccur, "/" );
				this.__divedCCmd.handler( e );
				break;
			default:
				cursorHandled = false;
		}

		return cursorHandled;
	};

	/**
	 * sender @param  {Components.Vim.VimArea}
	 * e @param {Components.Vim.Controls.InputEvent}
	 * */
	Controls.prototype.handler = function( sender, e )
	{
		// Never capture these keys
		if( e.keyCode == ( ALT + D )
			// F2 - F12
			|| ( F1 < e.keyCode && e.keyCode <= F12 )
		) return;

		// Clear composite command
		if( e.Escape )
		{
			var b = false;
			this.__cMovement = false;

			if( this.__compositeReg )
			{
				b = true;
				this.__compositeReg = null;
			}
			else if( this.__divedCCmd )
			{
				b = true;
				this.__divedCCmd.dispose();
				this.__divedCCmd = null;
			}

			if( b )
			{
				beep();
				return;
			}
		}

		if( this.__divedCCmd )
		{
			if( this.__divedCCmd.handler( e ) )
			{
				this.__divedCCmd.dispose();
				this.__cMovement = false;
				this.__divedCCmd = null;
			}

			if( e.canceled ) return;
		}

		var cfeeder = this.__cfeeder;
		var ccur = this.__ccur;

		var kCode = e.keyCode;

		// Action commands are handled by the actions themselves
		if( ccur.action )
		{
			if( e.Escape )
			{
				e.preventDefault();
				ccur.closeAction();
			}
			else
			{
				if( ccur.action.allowMovement )
				{
					var SubCommand = !this.__compositeReg;
					this.__cursorCommand( e, kCode );
					if( SubCommand && this.__compositeReg )
					{
						e.preventDefault();
						return;
					}
				}

				if( ccur.action.handler( e ) )
				{
					ccur.closeAction();
				}
			}
			return;
		}

		e.preventDefault();

		if( this.__cursorCommand( e ) ) return;
		if( this.__actionCommand( e ) ) return;
	};

	var InputEvent = function( sender, e )
	{
		this.__target = sender;
		this.__canceled = false;

		if( typeof( e ) == "string" )
		{
			this.__key = e;
			this.__modKeys = 0;
			this.__kCode = Map( e );
			this.__escape = this.__kCode == ESC;
		}
		else
		{
			this.__e = e;

			// KeyCode HotFix
			if( e.key == ";" || e.key == ":" )
			{
				SEMI_COLON = e.keyCode;
			}

			var c = this.__e.keyCode;

			this.__escape = c == ESC || ( e.ctrlKey && c == C );
			this.__kCode = c
				+ ( e.shiftKey || e.getModifierState( "CapsLock" ) ? SHIFT : 0 )
				+ ( e.ctrlKey ? CTRL : 0 )
				+ ( e.altKey ? ALT : 0 );

			this.__modKeys = c == KEY_SHIFT || c == KEY_CTRL || c == KEY_ALT;
			this.__key = e.key;
		}

		this.__range = null;
	};

	InputEvent.prototype.cancel = function() { this.__canceled = true; };

	__readOnly( InputEvent.prototype, "target", function() { return this.__target; } );
	__readOnly( InputEvent.prototype, "key", function() { return this.__key; } );
	__readOnly( InputEvent.prototype, "keyCode", function() { return this.__kCode; } );
	__readOnly( InputEvent.prototype, "ModKeys", function() { return this.__modKeys; } );
	__readOnly( InputEvent.prototype, "Escape", function() { return this.__escape; } );
	__readOnly( InputEvent.prototype, "canceled", function() { return this.__canceled; } );

	__readOnly( InputEvent.prototype, "range", function() {

		/** @type {Components.Vim.Syntax.TokenMatch} */
		var r = this.__range;

		if( r && r.open == -1 && r.close == -1 )
		{
			return null;
		}

		return r;
	} );

	InputEvent.prototype.kMap = function( map )
	{
		return this.__kCode == Map( map );
	};

	InputEvent.prototype.preventDefault = function()
	{
		if( this.__e ) this.__e.preventDefault();
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Controls", Controls );
	ns[ NS_EXPORT ]( EX_CLASS, "InputEvent", InputEvent );
})();
