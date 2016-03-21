(function(){
	var ns = __namespace( "Components.Vim" );

	var debug = __import( "System.Debug" );
	var beep = ns[ NS_INVOKE ]( "Beep" );

	var SHIFT = 1 << 9;
	var CTRL = 1 << 10;

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
					compReg = null;
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

	Controls.prototype.__actionCommand = function( e, kCode )
	{
		var ActionHandled = true;
		var ccur = this.__ccur;

		// Action Command
		switch( kCode )
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

	Controls.prototype.__cursorCommand = function( e, kCode )
	{
		if( this.__cMovement && this.__comp )
		{
			var k = e.keyCode;
			if(!( k == KEY_SHIFT || k == KEY_CTRL  || k == KEY_ALT ))
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

	Controls.prototype.handler = function( sender, e )
	{
		// Neve capture these keys
		if( e.altKey
			// F2 - F12
			|| ( F1 < e.keyCode && e.keyCode < 124 )
		) return;

		// Esc OR Ctrl + c
		var Escape = e.keyCode == ESC || ( e.ctrlKey && e.keyCode == C );

		// Clear composite command
		if( Escape && this.__compReg )
		{
			this.__compReg = null;
			this.__cMovement = false;
			beep();
			return;
		}

		var cfeeder = this.__cfeeder;
		var ccur = this.__ccur;

		var kCode = e.keyCode
			+ ( e.shiftKey || e.getModifierState( "CapsLock" ) ? SHIFT : 0 )
			+ ( e.ctrlKey ? CTRL : 0 );

		// Action commands are handled by the actions themselves
		if( ccur.action )
		{
			if( Escape )
			{
				e.preventDefault();
				ccur.closeAction();
			}
			else
			{
				if( ccur.action.allowMovement )
					this.__cursorCommand( e, kCode );

				ccur.action.handler( e );
			}
			return;
		}

		e.preventDefault();

		if( this.__cursorCommand( e, kCode ) ) return;
		if( this.__actionCommand( e, kCode ) ) return;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Controls", Controls );
})();
