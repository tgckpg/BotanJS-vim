(function(){
	var ns = __namespace( "Components.Vim" );

	var debug = __import( "System.Debug" );

	var SHIFT = 1 << 9;
	var CTRL = 1 << 10;

	var BACKSPACE = 8;

	var _0 = 48; var _1 = 49; var _2 = 50; var _3 = 51; var _4 = 52;
	var _5 = 53; var _6 = 54; var _7 = 55; var _8 = 56; var _9 = 57;

	var A = 65; var B = 66; var C = 67; var D = 68; var E = 69;
	var F = 70; var G = 71; var H = 72; var I = 73; var J = 74;
	var K = 75; var L = 76; var M = 77; var N = 78; var O = 79;
	var P = 80; var Q = 81; var R = 82; var S = 83; var T = 84;
	var U = 85; var V = 86; var W = 87; var X = 88; var Y = 89;
	var Z = 90;

	var Controls = function( sender, e )
	{
		// Neve capture these keys
		if( e.altKey
			// F2 - F12
			|| ( 112 < e.keyCode && e.keyCode < 124 )
		) return;

		// Action Mode handled by the actions themselves
		var cfeeder = sender.contentFeeder;
		if( cfeeder.cursor.action )
		{
			// Esc OR Ctrl + c
			if( e.keyCode == 27 || ( e.ctrlKey && e.keyCode == 67 ) )
			{
				e.preventDefault();
				cfeeder.cursor.closeAction();
			}
			else
			{
				cfeeder.cursor.action.handler( e );
			}
			return;
		}

		e.preventDefault();
		var kCode = e.keyCode
			+ ( e.shiftKey || e.getModifierState( "CapsLock" ) ? SHIFT : 0 )
			+ ( e.ctrlKey ? CTRL : 0 );

		var cfeeder = sender.contentFeeder;
		var sfeeder = sender.statusFeeder;
		switch( kCode )
		{
			// Cursor movements
			case BACKSPACE: // Backspace, go back 1 char, regardless of line
				cfeeder.cursor.moveX( -1, true );
				break;
			case H: // Left
				cfeeder.cursor.moveX( -1 );
				break;
			case L: // Right
				cfeeder.cursor.moveX( 1 );
				break;
			case K: // Up
				cfeeder.cursor.moveY( -1 );
				break;
			case J: // Down
				cfeeder.cursor.moveY( 1 );
				break;

			// Insert
			case A: // Append
				cfeeder.cursor.moveX( 1, true, true );
				cfeeder.cursor.openAction( "INSERT" );
				break;
			case I: // Insert
				break;
			case U: // Undo
				cfeeder.cursor.openRunAction( "UNDO", e );
				break;
			case CTRL + R: // Redo
				cfeeder.cursor.openRunAction( "REDO", e );
				break;
			case X: // Del
				break;
			case SHIFT + A: // Append at the line end
				break;
			case SHIFT + X: // Delete before
				break;
			case SHIFT + U: // Undo previous changes in oneline
				break;
			case SHIFT + I: // Append before the line start, after spaces
				break;

			// remove characters
			case X: // Remove in cursor
				break;
			case SHIFT + X: // Remove before cursor
				break;

			case SHIFT + H: // First line buffer
				break;
			case SHIFT + L: // Last line buffer
				break;
			case SHIFT + _4: // $, End
				cfeeder.cursor.lineEnd();
				break;
			case SHIFT + _5: // %, Find next item
				break;
			case SHIFT + _6: // ^, Start
				cfeeder.cursor.lineStart();
				break;
			case SHIFT + J: // Join lines
				break;
			case SHIFT + K: // manual entry
				break;
			case 112: // F1, help
		}

	};

	ns[ NS_EXPORT ]( EX_FUNC, "Controls", Controls );
})();
