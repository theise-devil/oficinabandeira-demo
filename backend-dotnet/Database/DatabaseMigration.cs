using Dapper;

namespace OficinaBandeira.API.Database;

public static class DatabaseMigration
{
    public static async Task RunAsync(DbConnectionFactory factory)
    {
        var migrationsDir = Path.Combine(AppContext.BaseDirectory, "Migrations");

        var arquivos = Directory.GetFiles(migrationsDir, "*.sql")
                                .OrderBy(f => f)
                                .ToList();

        using var conn = factory.Create();
        foreach (var arquivo in arquivos)
        {
            var sql = await File.ReadAllTextAsync(arquivo);
            await conn.ExecuteAsync(sql);
        }
    }
}
