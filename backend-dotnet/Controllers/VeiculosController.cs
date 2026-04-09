using System.Security.Claims;
using System.Text.Json;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaBandeira.API.Database;
using OficinaBandeira.API.Dtos;
using OficinaBandeira.API.Models;

namespace OficinaBandeira.API.Controllers;

[ApiController]
[Route("api/veiculos")]
public class VeiculosController : ControllerBase
{
    private readonly DbConnectionFactory _db;
    private readonly IWebHostEnvironment _env;

    private static readonly Dictionary<string, string[]> Marcas = new()
    {
        ["Chevrolet"]  = ["Onix","Onix Plus","Cruze","Tracker","S10","Spin","Equinox","Montana","Cobalt","Prisma","Agile","Celta","Classic","Corsa","Vectra","Zafira","Captiva","Trailblazer","Blazer","Camaro"],
        ["Fiat"]       = ["Argo","Cronos","Pulse","Fastback","Strada","Toro","Mobi","Uno","Palio","Siena","Bravo","Linea","500","Doblo","Ducato","Fiorino","Grand Siena","Idea","Punto","Tipo"],
        ["Ford"]       = ["Ka","Ka Sedan","EcoSport","Territory","Ranger","Bronco Sport","Maverick","Fusion","Edge","Mustang","F-150","Transit","Fiesta","Focus","Mondeo"],
        ["Volkswagen"] = ["Gol","Polo","Virtus","T-Cross","Taos","Nivus","Saveiro","Amarok","Tiguan","Jetta","Passat","Fox","Golf","Up","Voyage","SpaceFox","CrossFox"],
        ["Toyota"]     = ["Corolla","Corolla Cross","Yaris","Hilux","SW4","RAV4","Camry","Prius","Land Cruiser","Etios","Fielder"],
        ["Honda"]      = ["Civic","City","City Hatch","HR-V","CR-V","WR-V","Fit","Accord","Pilot","Ridgeline"],
        ["Hyundai"]    = ["HB20","HB20S","Creta","Tucson","Santa Fe","Elantra","Azera","i30","ix35","Veloster"],
        ["Renault"]    = ["Kwid","Sandero","Logan","Duster","Captur","Oroch","Zoe","Clio","Megane","Fluence","Koleos"],
        ["Jeep"]       = ["Renegade","Compass","Commander","Wrangler","Grand Cherokee","Cherokee"],
        ["Nissan"]     = ["Kicks","Versa","Sentra","Frontier","March","Leaf","Murano","Pathfinder"],
        ["Peugeot"]    = ["208","2008","3008","5008","408","308","Partner","Expert","Boxer"],
        ["Citroën"]    = ["C3","C4 Cactus","C4 Lounge","Aircross","Berlingo","Jumper","C5"],
        ["Mitsubishi"] = ["Outlander","Eclipse Cross","ASX","L200 Triton","Pajero","Pajero Sport","Lancer"],
        ["Kia"]        = ["Sportage","Stinger","Sorento","Carnival","Cerato","Picanto","Soul","Telluride"],
        ["BMW"]        = ["Série 1","Série 2","Série 3","Série 4","Série 5","X1","X2","X3","X4","X5","X6","Z4","M3","M5"],
        ["Mercedes"]   = ["Classe A","Classe B","Classe C","Classe E","Classe S","GLA","GLB","GLC","GLE","GLS","AMG GT"],
        ["Audi"]       = ["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q5","Q7","Q8","TT","R8"],
        ["Volvo"]      = ["XC40","XC60","XC90","S60","S90","V60","V90","C40"],
        ["Subaru"]     = ["Impreza","Legacy","Outback","Forester","XV","BRZ","WRX"],
        ["Land Rover"] = ["Defender","Discovery","Discovery Sport","Range Rover","Range Rover Sport","Range Rover Evoque","Range Rover Velar"],
        ["Porsche"]    = ["911","Cayenne","Macan","Panamera","Taycan","718"],
        ["Caoa Chery"] = ["Tiggo 2","Tiggo 3X","Tiggo 5X","Tiggo 7","Tiggo 8","Arrizo 6"],
        ["BYD"]        = ["Dolphin","Seal","Han","Tang","Song Plus","Atto 3"],
        ["GWM"]        = ["Haval H6","Haval H2","Ora 03","Poer","Wingle"],
    };

    private static readonly HashSet<string> ExtensõesPermitidas = [".jpg", ".jpeg", ".png", ".webp"];

    public VeiculosController(DbConnectionFactory db, IWebHostEnvironment env)
    {
        _db  = db;
        _env = env;
    }

    // ── GET /api/veiculos/marcas ──────────────────────────────────────────────
    [HttpGet("marcas")]
    public IActionResult GetMarcas() => Ok(Marcas);

    // ── GET /api/veiculos ─────────────────────────────────────────────────────
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Listar()
    {
        var usuarioId = int.Parse(User.FindFirstValue("id")!);
        using var conn = _db.Create();

        var veiculos = await conn.QueryAsync<Veiculo>(
            "SELECT * FROM veiculos WHERE usuario_id = @Id ORDER BY criado_em DESC",
            new { Id = usuarioId });

        return Ok(veiculos.Select(Serializar));
    }

    // ── POST /api/veiculos ────────────────────────────────────────────────────
    [HttpPost]
    [Authorize]
    [RequestSizeLimit(60 * 1024 * 1024)] // 60MB total
    public async Task<IActionResult> Criar([FromForm] CriarVeiculoRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { erros = ModelState.Values
                .SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });

        var usuarioId  = int.Parse(User.FindFirstValue("id")!);
        var fotos      = new List<string>();
        var arquivosSalvos = new List<string>();

        try
        {
            if (req.Fotos is { Count: > 0 })
            {
                foreach (var file in req.Fotos.Take(10))
                {
                    var ext = Path.GetExtension(file.FileName).ToLower();
                    if (!ExtensõesPermitidas.Contains(ext)) continue;
                    if (file.Length > 5 * 1024 * 1024) continue;

                    var nome    = $"veiculo_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid():N}{ext}";
                    var caminho = Path.Combine(_env.ContentRootPath, "uploads", nome);

                    await using var stream = System.IO.File.Create(caminho);
                    await file.CopyToAsync(stream);

                    arquivosSalvos.Add(caminho);
                    fotos.Add($"/uploads/{nome}");
                }
            }

            using var conn = _db.Create();
            var id = await conn.QuerySingleAsync<int>(@"
                INSERT INTO veiculos (usuario_id, marca, modelo, ano, cor, quilometragem, descricao, fotos)
                VALUES (@UsuarioId, @Marca, @Modelo, @Ano, @Cor, @Quilometragem, @Descricao, @Fotos)
                RETURNING id",
                new
                {
                    UsuarioId     = usuarioId,
                    Marca         = req.Marca.Trim(),
                    Modelo        = req.Modelo.Trim(),
                    Ano           = req.Ano.Trim(),
                    Cor           = req.Cor.Trim(),
                    Quilometragem = req.Quilometragem.Trim(),
                    Descricao     = req.Descricao?.Trim(),
                    Fotos         = JsonSerializer.Serialize(fotos)
                });

            var veiculo = await conn.QueryFirstAsync<Veiculo>(
                "SELECT * FROM veiculos WHERE id = @Id", new { Id = id });

            return StatusCode(201, Serializar(veiculo));
        }
        catch
        {
            // Remove arquivos salvos em caso de erro no banco
            foreach (var f in arquivosSalvos)
                if (System.IO.File.Exists(f)) System.IO.File.Delete(f);
            throw;
        }
    }

    // ── DELETE /api/veiculos/{id} ─────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Deletar(int id)
    {
        var usuarioId = int.Parse(User.FindFirstValue("id")!);
        using var conn = _db.Create();

        var veiculo = await conn.QueryFirstOrDefaultAsync<Veiculo>(
            "SELECT * FROM veiculos WHERE id = @Id AND usuario_id = @UsuarioId",
            new { Id = id, UsuarioId = usuarioId });

        if (veiculo is null) return NotFound(new { erro = "Veículo não encontrado." });

        // Remove fotos do disco
        var listFotos = JsonSerializer.Deserialize<List<string>>(veiculo.Fotos) ?? [];
        foreach (var foto in listFotos)
        {
            var path = Path.Combine(_env.ContentRootPath, foto.TrimStart('/'));
            if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
        }

        await conn.ExecuteAsync("DELETE FROM veiculos WHERE id = @Id", new { Id = id });
        return Ok(new { mensagem = "Veículo removido." });
    }

    // ── HELPER ────────────────────────────────────────────────────────────────
    private static object Serializar(Veiculo v) => new
    {
        v.Id, v.UsuarioId, v.Marca, v.Modelo, v.Ano,
        v.Cor, v.Quilometragem, v.Descricao, v.CriadoEm,
        Fotos = JsonSerializer.Deserialize<List<string>>(v.Fotos) ?? []
    };
}
