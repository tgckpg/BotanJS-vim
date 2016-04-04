(function(){
	var ns = __namespace( "Components.Vim.State" );

	var Stator = function( cur, start )
	{
		this.__cursor = cur;
		this.__startPosition = start == undefined ? cur.aPos : start;
		this.__startState = this.__saveCur();
	};

	Stator.prototype.save = function( insertLength, contentUndo, removeLen )
	{
		if( removeLen == undefined ) removeLen = 0;
		var cur = this.__cursor;
		var feeder = cur.feeder;
		var startPos = this.__startPosition - removeLen;

		var sSt = this.__startState;
		var eSt = this.__saveCur();

		var st = sSt;
		// Calling this repeatedly will swap between UNDO / REDO state
		return function() {
			var contentRedo = feeder.content.substr( startPos, insertLength );
			feeder.content =
				feeder.content.substring( 0, startPos )
				+ contentUndo
				+ feeder.content.substring( startPos + insertLength );
			insertLength = contentUndo.length;
			contentUndo = contentRedo;

			cur.PStart = st.p;
			cur.PEnd = st.p + 1;
			cur.X = st.x;
			cur.Y = st.y;
			cur.pX = st.cpX - 1;
			feeder.panX = st.px;
			feeder.panY = st.py;

			feeder.pan();

			st = ( st == sSt ) ? eSt : sSt;
		};
	};

	Stator.prototype.__saveCur = function()
	{
		var c = this.__cursor;
		var obj = {
			p: c.PStart
			, x: c.X
			, y: c.Y
			, cpX: c.pX
			, px: c.feeder.panX
			, py: c.feeder.panY
		};

		if( 0 < obj.x )
		{
			obj.p -= 1;
			obj.x -= 1;
		}

		return obj;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Stator", Stator );
})();
