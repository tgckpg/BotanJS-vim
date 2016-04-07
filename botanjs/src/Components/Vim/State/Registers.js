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

	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var Register = function( str, n )
	{
		this.__str = str + "";
		this.newLine = Boolean( n );
	};

	Register.prototype.newLine = false;

	Register.prototype.toString = function() { return this.__str; };
	Register.prototype.indexOf = function( a, b ) { return this.__str.indexOf( a, b ); };

	__readOnly( Register.prototype, "length", function() { return this.__str.length; } );


	var Registers = function()
	{
		this.__registers = {};
	};

	Registers.prototype.__unnamed = function( reg )
	{
		this.__registers[ "\"" ] = reg;
	};

	Registers.prototype.yank = function( str, newLine )
	{
		var reg = new Register( str, newLine );
		this.__unnamed( reg );
		this.__registers[ this.__selRegister || 0 ] = reg;
		this.__selRegister = false;
	};

	Registers.prototype.change = function( str, newLine )
	{
		var reg = new Register( str, newLine );
		this.__unnamed( reg );
		var r = this.__registers;
		for( var i = 9; 1 < i; i -- )
		{
			if( r[ i - 1 ] != undefined )
			{
				r[ i ] = r[ i - 1 ];
			}
		}

		r[ 1 ] = reg;
		this.__selRegister = false;
	};

	Registers.prototype.get = function( r )
	{
		// 0 is one of the registers
		if( !r && r !== 0  ) r = this.__selRegister || "\"";

		this.__selRegister = false;
		return this.__registers[ r ];
	};

	Registers.prototype.select = function( r )
	{
		debug.Info( "Selecting Register: " + r );
		this.__selRegister = r;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "Registers", Registers );

})();
