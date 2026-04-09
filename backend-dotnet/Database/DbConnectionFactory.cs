using Npgsql;
using System.Data;

namespace OficinaBandeira.API.Database;

public class DbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException("Connection string 'Postgres' not found.");
    }

    public IDbConnection Create() => new NpgsqlConnection(_connectionString);
}
