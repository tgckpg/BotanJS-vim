(function(){
	var ns = __namespace( "Components.Vim" );

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );
	var beep = ns[ NS_INVOKE ]( "Beep" );

	var SHIFT = 1 << 9;
	var CTRL = 1 << 10;
	var ALT = 1 << 11;

	var KEY_SHIFT = 16;
	var KEY_CTRL = 17;
	var KEY_ALT = 18;

	var BACKSPACE = 8;

	var _0 = 48; var _1 = 49; var _2 = 50; var _3 = 51; var _4 = 52;
	var _5 = 53; var _6 = 54; var _7 = 55; var _8 = 56; var _9 = 57;

	var A = 65; var B = 66; var C = 67; var D = 68; var E = 69;
	var F = 70; var G = 71; var H = 72; var I = 73; var J = 74;
	var K = 75; var L = 76; var M = 77; var N = 78; var O = 79;
	var P = 80; var Q = 81; var R = 82; var S = 83; var T = 84;
	var U = 85; var V = 86; var W = 87; var X = 88; var Y = 89;
	var Z = 90;

	var ESC = 27;

	var F1 = 112; var F2 = 113; var F3 = 114; var F4 = 115; var F5 = 116;
	var F6 = 117; var F7 = 118; var F8 = 119; var F9 = 120; var F10 = 121;
	var F11 = 122; var F12 = 123;

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
			default:
				throw new Error( "No such keys: " + str );
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
	};

	Controls.prototype.__comp = function( kCode, handler )
	{
		if( handler )
		{
			if( !this.__compReg ) this.__compReg = [];
			this.__compReg.push({
				keys: Array.prototype.slice.call( arguments, 2 )
				, handler: handler
				, i: 0
			});
			return true;
		}

		for( var i = 0; i < this.__compReg.length; i ++ )
		{
			var compReg = this.__compReg[i];
			var keys = compReg.keys;

			if( keys[ compReg.i ++ ] == kCode )
			{
				if( compReg.i == keys.length )
				{
					compReg.handler();
					this.__compReg = null;
					this.__cMovement = false;
				}

				return true;
			}
		}

		if( this.__compReg ) beep();
		this.__compReg = null;
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
				this.__cMoveX( 1, true, true );
			case I: // Insert
				ccur.openAction( "INSERT" );
				break;
			case U: // Undo
				ccur.openRunAction( "UNDO", e );
				break;
			case CTRL + R: // Redo
				ccur.openRunAction( "REDO", e );
				break;
			case X: // Del
				break;
			case SHIFT + X: // Delete before
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
		ccur.moveX( a, b, c );
		if( ccur.X == x ) beep();
	};

	Controls.prototype.__cMoveY = function( a )
	{
		var ccur = this.__ccur;
		var cfeeder = this.__cfeeder;

		var y = ccur.Y + cfeeder.panY;
		ccur.moveY( a );
		if( y == ( ccur.Y + cfeeder.panY ) )
		{
			if( 0 < a && !cfeeder.EOF ) return;
			beep();
		}
	};

	Controls.prototype.__cursorCommand = function( e )
	{
		var kCode = e.keyCode;

		if( this.__cMovement && this.__comp )
		{
			if( !e.ModKeys )
			{
				this.__comp( kCode );
				return true;
			}
		}

		var ccur = this.__ccur;

		var cursorHandled = true;
		switch( kCode )
		{
			case BACKSPACE: this.__cMoveX( -1, true ); break; // Backspace, go back 1 char, regardless of line
			case H: this.__cMoveX( -1 ); break; // Left
			case L: this.__cMoveX( 1 ); break; // Right
			case K: this.__cMoveY( -1 ); break; // Up
			case J: this.__cMoveY( 1 ); break; // Down

			case SHIFT + H: // First line buffer
				break;
			case SHIFT + L: // Last line buffer
				break;
			case SHIFT + _6: // ^, Start
				ccur.lineStart();
				break;
			case SHIFT + _4: // $, End
				ccur.lineEnd();
				break;
			case SHIFT + G: // Goto last line
				ccur.moveY( Number.MAX_VALUE );
				ccur.moveX( Number.MAX_VALUE, true );
				break

			case SHIFT + _5: // %, Find next item
				break;

			case G: // Go to top
				this.__cMovement = true;
				this.__comp( kCode, function(){
					ccur.moveY( -Number.MAX_VALUE );
					ccur.moveX( -Number.MAX_VALUE, true );
				}, G );
				this.__comp( kCode, function(){
					ccur.openRunAction( "PRINT_HEX", e );
				}, _8 );
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
		// Neve capture these keys
		if( e.ModKeys
			// F2 - F12
			|| ( F1 < e.keyCode && e.keyCode < 124 )
		) return;

		// Clear composite command
		if( e.Escape && this.__compReg )
		{
			this.__compReg = null;
			this.__cMovement = false;
			beep();
			return;
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
					this.__cursorCommand( e, kCode );

				if( ccur.action.handler( e ) )
				{
					ccur.closeAction();
				}
			}
			return;
		}

		if( this.__cursorCommand( e ) )
		{
			e.preventDefault();
			return;
		}

		if( this.__actionCommand( e ) )
		{
			e.preventDefault();
			return;
		}
	};

	var InputEvent = function( e )
	{
		this.__e = e;

		var c = this.__e.keyCode;

		this.__escape = c == ESC || ( e.ctrlKey && c == C );
		this.__kCode = c
			+ ( e.shiftKey || e.getModifierState( "CapsLock" ) ? SHIFT : 0 )
			+ ( e.ctrlKey ? CTRL : 0 );

		this.__modKeys = c == KEY_SHIFT || c == KEY_CTRL || c == KEY_ALT;
		this.__key = e.key;
	};

 	__readOnly( InputEvent.prototype, "key", function() { return this.__key; } );
 	__readOnly( InputEvent.prototype, "keyCode", function() { return this.__kCode; } );
	__readOnly( InputEvent.prototype, "ModKeys", function() { return this.__modKeys; } );
	__readOnly( InputEvent.prototype, "Escape", function() { return this.__escape; } );

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
