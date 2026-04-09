using System.Security.Claims;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaBandeira.API.Database;
using OficinaBandeira.API.Dtos;
using OficinaBandeira.API.Models;
using OficinaBandeira.API.Services;

namespace OficinaBandeira.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly DbConnectionFactory _db;
    private readonly TokenService        _token;

    public AuthController(DbConnectionFactory db, TokenService token)
    {
        _db    = db;
        _token = token;
    }

    // ── POST /api/auth/cadastro ───────────────────────────────────────────────
    [HttpPost("cadastro")]
    public async Task<IActionResult> Cadastro([FromBody] CadastroRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { erros = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage) });

        // Valida regras extras de senha
        var errosSenha = new List<string>();
        if (!req.Senha.Any(char.IsUpper))  errosSenha.Add("Senha deve conter ao menos uma letra maiúscula.");
        if (!req.Senha.Any(char.IsDigit))  errosSenha.Add("Senha deve conter ao menos um número.");
        if (errosSenha.Count > 0) return BadRequest(new { erros = errosSenha });

        using var conn = _db.Create();

        var existe = await conn.QueryFirstOrDefaultAsync<int?>(
            "SELECT id FROM usuarios WHERE email = @Email", new { Email = req.Email.ToLower() });
        if (existe.HasValue)
            return Conflict(new { erro = "E-mail já cadastrado." });

        var hash = BCrypt.Net.BCrypt.HashPassword(req.Senha, 12);
        var id   = await conn.QuerySingleAsync<int>(
            "INSERT INTO usuarios (nome, email, senha_hash) VALUES (@Nome, @Email, @Hash) RETURNING id",
            new { Nome = req.Nome.Trim(), Email = req.Email.ToLower(), Hash = hash });

        var usuario = new Usuario { Id = id, Nome = req.Nome.Trim(), Email = req.Email.ToLower() };
        var token   = _token.Gerar(usuario);

        return StatusCode(201, new { token, usuario = new { usuario.Id, usuario.Nome, usuario.Email } });
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { erro = "Dados inválidos." });

        const string ERRO = "E-mail ou senha incorretos.";

        using var conn = _db.Create();
        var usuario = await conn.QueryFirstOrDefaultAsync<Usuario>(
            "SELECT * FROM usuarios WHERE email = @Email", new { Email = req.Email.ToLower() });

        if (usuario is null)
        {
            // dummy hash para evitar timing attack
            BCrypt.Net.BCrypt.HashPassword("dummy_para_timing_attack", 12);
            return Unauthorized(new { erro = ERRO });
        }

        if (!BCrypt.Net.BCrypt.Verify(req.Senha, usuario.SenhaHash))
            return Unauthorized(new { erro = ERRO });

        var token = _token.Gerar(usuario);
        return Ok(new { token, usuario = new { usuario.Id, usuario.Nome, usuario.Email } });
    }

    // ── GET /api/auth/perfil ──────────────────────────────────────────────────
    [HttpGet("perfil")]
    [Authorize]
    public async Task<IActionResult> Perfil()
    {
        var usuarioId = int.Parse(User.FindFirstValue("id")!);

        using var conn = _db.Create();
        var usuario = await conn.QueryFirstOrDefaultAsync<object>(
            "SELECT id, nome, email, criado_em FROM usuarios WHERE id = @Id",
            new { Id = usuarioId });

        if (usuario is null) return NotFound(new { erro = "Usuário não encontrado." });
        return Ok(usuario);
    }
}
