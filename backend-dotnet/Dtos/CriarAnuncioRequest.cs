using System.ComponentModel.DataAnnotations;

namespace OficinaBandeira.API.Dtos;

public class CriarAnuncioRequest
{
    [Required][Range(1, int.MaxValue)]
    public int     VeiculoId { get; set; }

    [Required][Range(0, double.MaxValue)]
    public decimal Preco     { get; set; }

    [StringLength(1000)]
    public string? Descricao { get; set; }
}
