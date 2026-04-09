using System.Text;
using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using OficinaBandeira.API.Database;
using OficinaBandeira.API.Services;

// Dapper mapeia automaticamente snake_case -> PascalCase
DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(args);

// ── SERVIÇOS ──────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<DbConnectionFactory>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// JWT
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer          = false,
            ValidateAudience        = false,
            ClockSkew               = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// ── MIGRATION NA INICIALIZAÇÃO ────────────────────────────────────────────────
var dbFactory = app.Services.GetRequiredService<DbConnectionFactory>();
await DatabaseMigration.RunAsync(dbFactory);

// ── PIPELINE ──────────────────────────────────────────────────────────────────
app.UseCors();

// Serve /uploads/* como arquivos estáticos
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath  = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/api/ping", () => Results.Ok(new { ok = true }));

app.Run();
