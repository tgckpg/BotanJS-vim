(function(){
/*  From Vim, :help registers
	There are ten types of registers:
	1. The unnamed register ""
	2. 10 numbered registers "0 to "9
	3. The small delete register "-
	4. 26 named registers "a to "z or "A to "Z
	5. three read-only registers ":, "., "%
	6. alternate buffer register "#
	7. the expression register "=
	8. The selection and drop registers "*, "+ and "~ 
	9. The black hole register "_
	10. Last search pattern register "/
	i.e. 0123456789-abcdefghijklmnopqrstuvwxyz:.%$=*+~_/
*/
	var ns = __namespace( "Components.Vim.State" );

	var Registers = function()
	{
		this.__registers = {};
	};

	Registers.prototype.unnamed = function( str )
	{
		this.__registers[ "\"" ] = str;
	};

	Registers.prototype.yank = function( str )
	{
		this.unnamed( str );
		this.__registers[ 0 ] = str;
	};

	Registers.prototype.change = function( str )
	{
		this.unnamed( str );
		var r = this.__registers;
		for( var i = 9; 1 < i; i -- )
		{
			if( r[ i - 1 ] != undefined )
			{
				r[ i ] = r[ i - 1 ];
			}
		}

		r[ 1 ] = str;
	};

	Registers.prototype.get = function( r )
	{
		// 0 is one of the registers
		if( !r && r !== 0  ) r = "\"";

		return this.__registers[ r ];
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Registers", Registers );
})();
