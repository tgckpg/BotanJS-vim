(function(){
	var ns = __namespace( "Components.Vim" );

	var debug = __import( "System.Debug" );

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
			// Esc OR Ctrl+c
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

		if( e.ctrlKey )
		{
			VimComboFunc( sender, e );
			return;
		}

		var kCode = e.keyCode + ( e.shiftKey ? 1000 : 0 );

		var cfeeder = sender.contentFeeder;
		var sfeeder = sender.statusFeeder;
		switch( kCode )
		{
			// Cursor movements
			case 8: // Backspace, go back 1 char, regardless of line
				break;
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

			// Insert
			case 65: // a
				cfeeder.cursor.openAction( "INSERT" );
				break;

			case 1065: // A, append at the line end
				break;
			case 73: // i
				break;
			case 1073: // I, append before the line start, after spaces
				break;

			// remove characters
			case 88: // x, remove in cursor
				break;
			case 1088: // X, remove before cursor
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

	};

	ns[ NS_EXPORT ]( EX_FUNC, "Controls", Controls );
})();
