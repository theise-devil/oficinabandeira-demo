using System.Security.Claims;
using System.Text.Json;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaBandeira.API.Database;
using OficinaBandeira.API.Dtos;

namespace OficinaBandeira.API.Controllers;

[ApiController]
[Route("api/anuncios")]
public class AnunciosController : ControllerBase
{
    private readonly DbConnectionFactory _db;

    public AnunciosController(DbConnectionFactory db) => _db = db;

    // ── GET /api/anuncios (público) ───────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        using var conn = _db.Create();
        var rows = await conn.QueryAsync<dynamic>(@"
            SELECT a.id, a.preco, a.descricao, a.criado_em,
                   v.marca, v.modelo, v.ano, v.cor, v.quilometragem, v.fotos
            FROM anuncios a
            JOIN veiculos v ON v.id = a.veiculo_id
            WHERE a.ativo = 1
            ORDER BY a.criado_em DESC");

        return Ok(rows.Select(ParseFotos));
    }

    // ── GET /api/anuncios/meus ────────────────────────────────────────────────
    [HttpGet("meus")]
    [Authorize]
    public async Task<IActionResult> Meus()
    {
        var usuarioId = int.Parse(User.FindFirstValue("id")!);
        using var conn = _db.Create();

        var rows = await conn.QueryAsync<dynamic>(@"
            SELECT a.id, a.preco, a.descricao, a.ativo, a.criado_em,
                   v.marca, v.modelo, v.ano, v.cor, v.quilometragem, v.fotos
            FROM anuncios a
            JOIN veiculos v ON v.id = a.veiculo_id
            WHERE a.usuario_id = @Id
            ORDER BY a.criado_em DESC",
            new { Id = usuarioId });

        return Ok(rows.Select(ParseFotos));
    }

    // ── POST /api/anuncios ────────────────────────────────────────────────────
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Criar([FromBody] CriarAnuncioRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { erros = ModelState.Values
                .SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });

        var usuarioId = int.Parse(User.FindFirstValue("id")!);
        using var conn = _db.Create();

        // Verifica se o veículo pertence ao usuário
        var veiculo = await conn.QueryFirstOrDefaultAsync<int?>(
            "SELECT id FROM veiculos WHERE id = @VeiculoId AND usuario_id = @UsuarioId",
            new { req.VeiculoId, UsuarioId = usuarioId });

        if (!veiculo.HasValue)
            return StatusCode(403, new { erro = "Veículo não encontrado ou não pertence a você." });

        // Verifica se já existe anúncio ativo para esse veículo
        var jaAnunciado = await conn.QueryFirstOrDefaultAsync<int?>(
            "SELECT id FROM anuncios WHERE veiculo_id = @VeiculoId AND ativo = 1",
            new { req.VeiculoId });

        if (jaAnunciado.HasValue)
            return Conflict(new { erro = "Este veículo já possui um anúncio ativo." });

        var id = await conn.QuerySingleAsync<int>(@"
            INSERT INTO anuncios (usuario_id, veiculo_id, preco, descricao)
            VALUES (@UsuarioId, @VeiculoId, @Preco, @Descricao)
            RETURNING id",
            new { UsuarioId = usuarioId, req.VeiculoId, req.Preco, Descricao = req.Descricao?.Trim() });

        var anuncio = await conn.QueryFirstAsync<dynamic>(
            "SELECT * FROM anuncios WHERE id = @Id", new { Id = id });

        return StatusCode(201, anuncio);
    }

    // ── DELETE /api/anuncios/{id} (desativa) ──────────────────────────────────
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Deletar(int id)
    {
        var usuarioId = int.Parse(User.FindFirstValue("id")!);
        using var conn = _db.Create();

        var anuncio = await conn.QueryFirstOrDefaultAsync<int?>(
            "SELECT id FROM anuncios WHERE id = @Id AND usuario_id = @UsuarioId",
            new { Id = id, UsuarioId = usuarioId });

        if (!anuncio.HasValue) return NotFound(new { erro = "Anúncio não encontrado." });

        await conn.ExecuteAsync(
            "UPDATE anuncios SET ativo = 0 WHERE id = @Id", new { Id = id });

        return Ok(new { mensagem = "Anúncio removido." });
    }

    // ── HELPER ────────────────────────────────────────────────────────────────
    private static object ParseFotos(dynamic row)
    {
        var fotos = JsonSerializer.Deserialize<List<string>>(
            (string)(row.fotos ?? "[]")) ?? [];

        return new
        {
            row.id, row.preco, row.descricao, row.criado_em,
            row.marca, row.modelo, row.ano, row.cor, row.quilometragem,
            fotos
        };
    }
}
