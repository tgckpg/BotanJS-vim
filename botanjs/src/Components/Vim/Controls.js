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
	var SPACE = 32;

	var UP = 38; var DOWN = 40; var LEFT = 37; var RIGHT = 39;

	var _0 = 48; var _1 = 49; var _2 = 50; var _3 = 51; var _4 = 52;
	var _5 = 53; var _6 = 54; var _7 = 55; var _8 = 56; var _9 = 57;

	var SEMI_COLON = 59; var GECKO_SEMI_COLON = 186;

	var EQUAL = 61; var GECKO_EQUAL = 187;

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

	var DASH = 173; var GECKO_DASH = 189;
	var COMMA = 188; var FULLSTOP = 190;
	var SLASH = 191; var BACK_SLASH = 220;

	var QUOTE = 222;

	var ANY_KEY = -1;

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

	// Polyfill for Chrome < 51
	var RMap = function( kCode )
	{
		switch( kCode )
		{
			case SPACE: return " ";
			case A: return "a"; case B: return "b"; case C: return "c"; case D: return "d";
			case E: return "e"; case F: return "f"; case G: return "g"; case H: return "h";
			case I: return "i"; case J: return "j"; case K: return "k"; case L: return "l";
			case M: return "m"; case N: return "n"; case O: return "o"; case P: return "p";
			case Q: return "q"; case R: return "r"; case S: return "s"; case T: return "t";
			case U: return "u"; case V: return "v"; case W: return "w"; case X: return "x";
			case Y: return "y"; case Z: return "z";
			case _1: return "1"; case _2: return "2"; case _3: return "3";
			case _4: return "4"; case _5: return "5"; case _6: return "6"; case _7: return "7";
			case _8: return "8"; case _9: return "9"; case _0: return "0";

			case S_BRACKET_L: return "["; case S_BRACKET_R: return "]";
			case SEMI_COLON: case GECKO_SEMI_COLON: return ";";
			case QUOTE: return "'"; case COMMA: return ",";
			case FULLSTOP: return "."; case SLASH: return "/"; case BACK_SLASH: return "\\";
			case DASH: case GECKO_DASH: return "-"; case EQUAL: case GECKO_EQUAL: return "=";

			case SHIFT + _1: return "!"; case SHIFT + _2: return "@"; case SHIFT + _3: return "#";
			case SHIFT + _4: return "$"; case SHIFT + _5: return "%"; case SHIFT + _6: return "^";
			case SHIFT + _7: return "&"; case SHIFT + _8: return "*"; case SHIFT + _9: return "(";
			case SHIFT + _0: return ")";

			case SHIFT + S_BRACKET_L: return "{"; case SHIFT + S_BRACKET_R: return "}";
			case SHIFT + SEMI_COLON: case SHIFT + GECKO_SEMI_COLON: return ":";
			case SHIFT + QUOTE: return "\"";
			case SHIFT + COMMA: return "<"; case SHIFT + FULLSTOP: return ">";
			case SHIFT + SLASH: return "?"; case SHIFT + BACK_SLASH: return "|";
			case SHIFT + DASH: case SHIFT + GECKO_DASH: return "_";
			case SHIFT + EQUAL: case SHIFT + GECKO_EQUAL: return "+";

			case SHIFT + A: return "A"; case SHIFT + B: return "B"; case SHIFT + C: return "C";
			case SHIFT + D: return "D"; case SHIFT + E: return "E"; case SHIFT + F: return "F";
			case SHIFT + G: return "G"; case SHIFT + H: return "H"; case SHIFT + I: return "I";
			case SHIFT + J: return "J"; case SHIFT + K: return "K"; case SHIFT + L: return "L";
			case SHIFT + M: return "M"; case SHIFT + N: return "N"; case SHIFT + O: return "O";
			case SHIFT + P: return "P"; case SHIFT + Q: return "Q"; case SHIFT + R: return "R";
			case SHIFT + S: return "S"; case SHIFT + T: return "T"; case SHIFT + U: return "U";
			case SHIFT + V: return "V"; case SHIFT + W: return "W"; case SHIFT + X: return "X";
			case SHIFT + Y: return "Y"; case SHIFT + Z: return "Z";
			case ESC: return "Escape"; case BACKSPACE: return "Backspace"; case DELETE: return "Delete";
			case SHIFT: return "Shift"; case ALT: return "Alt"; case CTRL: return "Control";
			case ENTER: return "Enter"; case TAB: return "Tab";
		}

		return "?";
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
			var key = keys[ compReg.i ++ ];

			if( key == ANY_KEY || key == kCode )
			{
				if( compReg.i == keys.length )
				{
					this.__compositeReg = null;
					compReg.handler( e );
				}

				return true;
			}
		}

		if( this.__compositeReg ) beep();
		this.__compositeReg = null;
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
				ccur.moveX( 1, false, true, true );
				ccur.openAction( "INSERT", e );
				break;
			case I: // Insert
				if( 0 < ccur.X )
				{
					ccur.moveX( -1, true );
					ccur.moveX( 1, true, true, true );
				}
				ccur.openAction( "INSERT", e );
				break;
			case A: // Append
				ccur.fixTab();
				ccur.moveX( 1, false, true, true );
				ccur.openAction( "INSERT", e );
				break;
			case SHIFT + I: // Append at line start
				ccur.lineStart( true );
				ccur.openAction( "INSERT", e );
				break;

			case S: // Delete Char and start insert
				if( ccur.getLine().content != "" )
				{
					ccur.openRunAction( "DELETE", e, ccur.aPos );
				}
				ccur.openAction( "INSERT", e );
				break;

			case SHIFT + O: // new line before insert
				ccur.lineStart();
				ccur.openAction( "INSERT", e );
				ccur.action.handler( new ActionEvent( e.sender, "Enter" ) );
				ccur.moveY( -1 );
				break;
			case O: // new line insert
				ccur.lineEnd( true );
				ccur.openAction( "INSERT", e );
				ccur.action.handler( new ActionEvent( e.sender, "Enter" ) );
				break;

			case U: // Undo
				ccur.openRunAction( "UNDO", e );
				break;
			case CTRL + R: // Redo
				ccur.openRunAction( "REDO", e );
				break;

			case D: // Del with motion
				ccur.openAction( "DELETE", e );
				break;
			case Y: // Yank with motion
				ccur.openAction( "YANK", e );
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
				ccur.openRunAction( "JOIN_LINES", e );
				break;
			case SHIFT + K: // Find the manual entry
				break;

			case V: // Visual
			case SHIFT + V: // Visual line
				ccur.openAction( "VISUAL", e );
				ccur.action.handler( e );
				break;

			case SHIFT + SEMI_COLON: // ":" Command line
			case SHIFT + GECKO_SEMI_COLON:
				this.__divedCCmd = new ExCommand( ccur, ":" );
				this.__divedCCmd.handler( e );
				break;

			case SHIFT + COMMA: // <
			case SHIFT + FULLSTOP: // >
				ccur.openAction( "SHIFT_LINES", e );
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
		var y = ccur.Y;
		ccur.moveX( a, b, c || ccur.pSpace );
		if( ccur.X == x && ccur.Y == y )
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

	Controls.prototype.__modCommand = function( e )
	{
		if( this.__mod )
		{
			e.preventDefault();
			this.__composite( e );
			return;
		}

		var _self = this;
		var mod = true;

		var cur = this.__cursor;
		switch( e.keyCode )
		{
			case SHIFT + QUOTE:
				this.__composite( e, function( e2 ) {
					e2.target.registers.select( e2.key );
					e2.cancel();

					_self.__mod = false;
				}, ANY_KEY );
				break;
			case _0: // No 0 for first count
				if( !this.__compositeReg )
				{
					mod = false;
					break;
				}
			case _1: case _2: case _3: case _4:
			case _5: case _6: case _7: case _8: case _9:

				var Count = e.key;
				var recurNum = function( e )
				{
					var intercept = e.ModKeys;
					switch( e.keyCode )
					{
						case _0: case _1: case _2:
						case _3: case _4: case _5:
						case _6: case _7: case _8: case _9:
							Count += e.key;
							intercept = true;
					}

					if( intercept )
					{
						_self.__composite( e, recurNum, ANY_KEY );
						e.cancel();
						return;
					}

					e.__count = Number( Count );
					debug.Info( "Count is: " + Count );
					_self.__mod = false;
				};

				this.__composite( e, recurNum, ANY_KEY );
				break;
			default:
				mod = false;
		}

		this.__mod = mod;
		if( mod )
		{
			e.cancel();
		}
	};

	Controls.prototype.__cursorCommand = function( e )
	{
		var kCode = e.keyCode;

		if( this.__cMovement )
		{
			if( !e.ModKeys )
			{
				this.__composite( e );
				this.__cMovement = false;
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
			case H: this.__cMoveX( - e.count ); break; // Left
			case L: this.__cMoveX( e.count ); break; // Right
			case DASH: case GECKO_DASH:
			case K: this.__cMoveY( - e.count ); break; // Up
			case ENTER:
			case J: this.__cMoveY( e.count ); break; // Down

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

			case _0: // Really line Start
				ccur.lineStart();
				break;
			case SHIFT + _6: // ^, line Start at word
				ccur.lineStart( true );
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


			case SHIFT + T: // To
			case T: // To
				this.__cMovement = true;

				this.__composite( e, function( e2 ) {
					var oX = ccur.X;
					ccur.openRunAction( "TO", e, e2 );

					if( ccur.X < oX )
					{
						ccur.moveX( 1 );
					}
					else if( oX < ccur.X )
					{
						ccur.moveX( -1 );
					}
				}, ANY_KEY );

				break;
			case SHIFT + F: // To
			case F: // To
				this.__cMovement = true;

				this.__composite( e, function( e2 ) {
					ccur.openRunAction( "TO", e, e2 );
				}, ANY_KEY );

				break;

			case W: // word
			case SHIFT + W:
			case B:
			case SHIFT + B:
				ccur.openRunAction( "WORD", e );
				break


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
				var singleQuote = function( e2 ) {
					var BracketMatch = analyzer.quoteIn( "'", ccur.aPos );
					e2.__range = BracketMatch;
				};
				var doubleQuote = function( e2 ) {
					var BracketMatch = analyzer.quoteIn( "\"", ccur.aPos );
					e2.__range = BracketMatch;
				};

				// Bracket boundaries
				this.__composite( e, bracket, SHIFT + _0 );
				this.__composite( e, bracket, SHIFT + _9 );
				this.__composite( e, squareBracket, S_BRACKET_L );
				this.__composite( e, squareBracket, S_BRACKET_R );
				this.__composite( e, curlyBracket, SHIFT + S_BRACKET_L );
				this.__composite( e, curlyBracket, SHIFT + S_BRACKET_R );

				// Quote boundaries
				this.__composite( e, singleQuote, QUOTE );
				this.__composite( e, doubleQuote, SHIFT + QUOTE );
				break;

			case G:

				this.__cMovement = true;

				// Go to top
				this.__composite( e, function() {
					ccur.moveY( -Number.MAX_VALUE );
					ccur.moveX( -Number.MAX_VALUE, true );
				}, G );

				// Print Hex
				this.__composite( e, function() {
					ccur.openRunAction( "PRINT_HEX", e );
				}, _8 );

				// to lowercase
				this.__composite( e, function( e2 ) {
					if( ccur.action ) { beep(); return; }
					// TODO
				}, U );

				// to uppercase
				this.__composite( e, function( e2 ) {
					if( ccur.action ) { beep(); return; }
					// TODO
				}, SHIFT + U );
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
	 * e @param {Components.Vim.Controls.ActionEvent}
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
				return;
			}

			if( e.canceled ) return;
		}

		var cfeeder = this.__cfeeder;
		var ccur = this.__ccur;

		if( !this.__cMovement && ( !ccur.action || ccur.action.allowMovement ) )
		{
			this.__modCommand( e );
			if( e.canceled ) return;
		}

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

	var ActionEvent = function( sender, e )
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
			this.__key = e.key || RMap( this.__kCode );
		}

		this.__count = 1;
		this.__range = null;
	};

	__readOnly( ActionEvent.prototype, "target", function() { return this.__target; } );
	__readOnly( ActionEvent.prototype, "key", function() { return this.__key; } );
	__readOnly( ActionEvent.prototype, "keyCode", function() { return this.__kCode; } );
	__readOnly( ActionEvent.prototype, "ModKeys", function() { return this.__modKeys; } );
	__readOnly( ActionEvent.prototype, "Escape", function() { return this.__escape; } );
	__readOnly( ActionEvent.prototype, "canceled", function() { return this.__canceled; } );

	__readOnly( ActionEvent.prototype, "range", function() {

		/** @type {Components.Vim.Syntax.TokenMatch} */
		var r = this.__range;

		if( r && r.open == -1 && r.close == -1 )
		{
			return null;
		}

		return r;
	} );

	__readOnly( ActionEvent.prototype, "count", function() {
		return this.__count;
	} );

	ActionEvent.prototype.kMap = function( map )
	{
		return this.__kCode == Map( map );
	};

	ActionEvent.prototype.cancel = function()
	{
		this.preventDefault();
		this.__canceled = true;
	};

	ActionEvent.prototype.preventDefault = function()
	{
		if( this.__e ) this.__e.preventDefault();
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Controls", Controls );
	ns[ NS_EXPORT ]( EX_CLASS, "ActionEvent", ActionEvent );
})();
